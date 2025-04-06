export const runtime = "nodejs";

import { createClient } from "@supabase/supabase-js";
import PDFDocument from "pdfkit";
import JSZip from "jszip";

// Initialize Supabase client with error handling
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase environment variables");
}

const supabase = createClient(supabaseUrl || "", supabaseKey || "");

// Define types for database structure
type Donor = {
  name: string;
  phone_no: string;
  email: string;
  food_preference: string;
};

type DonorForm = {
  food_name: string;
  food_image: string;
  food_type: string;
  donor_id: string;
  donor: Donor;
};

type NGO = {
  name: string;
  address_map_link: string;
  reg_no?: string;
  food_preference: string;
};

type Order = {
  id: string;
  serves?: number;
  created_at?: string;
  donor_form_id: string;
  donor_form?: DonorForm;
  ngo_id: string;
  ngo?: NGO;
  delivery_person_name?: string;
  delivery_person_phone_no?: string;
  receipt_generated?: boolean;
};

export async function GET(request: Request) {
  try {
    // Get parameters from URL
    const url = new URL(request.url);
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");
    const donorId = url.searchParams.get("donorId");
    const batchId =
      url.searchParams.get("batchId") || `batch-${new Date().getTime()}`;

    if (!startDate || !endDate) {
      return new Response(JSON.stringify({ error: "Date range is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log(`Processing batch receipts from ${startDate} to ${endDate}`);
    if (donorId) {
      console.log(`Filtering for donor ID: ${donorId}`);
    }

    // Build Supabase query
    let query = supabase
      .from("orders")
      .select(
        `
        id,
        serves,
        created_at,
        donor_form_id,
        donor_form:donor_form_id (
          food_name,
          food_image,
          food_type, 
          donor_id,
          donor:donor_id (
            name, 
            phone_no,
            email,
            food_preference
          )
        ),
        ngo_id,
        ngo:ngo_id (
          name,
          address_map_link,
          reg_no,
          food_preference
        ),
        delivery_person_name,
        delivery_person_phone_no,
        receipt_generated
      `
      )
      .gte("created_at", startDate)
      .lte("created_at", endDate)
      .eq("receipt_generated", false); // Only include orders without receipts

    // Add donor filter if provided
    if (donorId) {
      query = query.eq("donor_form.donor_id", donorId);
    }

    // Execute the query
    const { data, error } = await query;

    if (error) {
      console.error("Error fetching orders:", error);
      return new Response(
        JSON.stringify({ error: `Failed to fetch orders: ${error.message}` }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (!data || data.length === 0) {
      console.log("No eligible orders found for the specified criteria");
      return new Response(
        JSON.stringify({
          error: "No eligible orders found in the specified date range",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Found ${data.length} orders for receipt generation`);

    // Cast data to our Order type for type safety
    const orders = data as unknown as Order[];

    // Fix schema differences for all orders

    // Track the orders included in this batch
    const orderIds = orders.map((order) => order.id);

    // Create batch receipts in database
    const receiptRecords = orderIds.map((orderId) => {
      const order = orders.find((o) => o.id === orderId);
      const serves = order?.serves || 0;
      return {
        order_id: orderId,
        receipt_number: `DNTN-${orderId.substring(
          0,
          8
        )}-BATCH-${batchId.substring(0, 8)}`,
        receipt_type: "batch",
        batch_id: batchId,
        amount: serves * 50,
        created_at: new Date().toISOString(),
      };
    });

    // Insert receipt records
    const { error: insertError } = await supabase
      .from("receipts")
      .insert(receiptRecords);

    if (insertError) {
      console.error("Error recording batch receipts:", insertError);
      // Continue anyway to generate the PDFs
    }

    // Update all orders with receipt information
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        receipt_generated: true,
        batch_id: batchId,
      })
      .in("id", orderIds);

    if (updateError) {
      console.error("Error updating orders:", updateError);
      // Continue anyway to generate the PDFs
    }

    // Create a zip file to store all PDFs
    const zip = new JSZip();

    // Generate PDFs for each order
    const pdfPromises = orders.map(async (order) => {
      try {
        const pdfBuffer = await generateReceiptPDF(order, batchId);
        const receiptNumber = `DNTN-${order.id.substring(
          0,
          8
        )}-BATCH-${batchId.substring(0, 8)}`;
        zip.file(`donation_receipt_${receiptNumber}.pdf`, pdfBuffer);
      } catch (err) {
        console.error(`Error generating PDF for order ${order.id}:`, err);
        // Continue with other PDFs even if one fails
      }
    });

    // Wait for all PDFs to be generated
    await Promise.all(pdfPromises);

    // Generate the zip file
    const zipContent = await zip.generateAsync({ type: "nodebuffer" });

    // Format date range for filename
    const formattedStartDate = new Date(startDate).toISOString().split("T")[0];
    const formattedEndDate = new Date(endDate).toISOString().split("T")[0];

    return new Response(zipContent, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename=donation_receipts_${formattedStartDate}_to_${formattedEndDate}.zip`,
      },
    });
  } catch (error: any) {
    console.error("Unexpected error in batch receipt generation:", error);
    return new Response(
      JSON.stringify({
        error: "An unexpected error occurred while generating batch receipts",
        details: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// Helper function to generate a single receipt PDF
async function generateReceiptPDF(
  order: Order,
  batchId: string
): Promise<Buffer> {
  // Calculate the donation amount
  const serves = order.serves || 0;
  const donationAmount = serves * 50;

  // Create batch-specific receipt number
  const receiptNumber = `DNTN-${order.id.substring(
    0,
    8
  )}-BATCH-${batchId.substring(0, 8)}`;

  const issueDate = new Date().toLocaleDateString();
  const donationDate = order.created_at
    ? new Date(order.created_at).toLocaleDateString()
    : new Date().toLocaleDateString();

  // Create PDF document
  const doc = new PDFDocument({
    size: "A4",
    margin: 50,
    info: {
      Title: `Donation Receipt - ${receiptNumber}`,
      Author: order.donor_form?.donor?.name || "Restaurant",
    },
  });

  // Buffer to store PDF
  const chunks: Buffer[] = [];
  doc.on("data", (chunk : Buffer) => chunks.push(chunk));

  // Create a promise to resolve when the document is finished
  const pdfPromise = new Promise<Buffer>((resolve) => {
    doc.on("end", () => {
      resolve(Buffer.concat(chunks));
    });
  });

  // Add content to PDF
  // Header with title
  doc
    .fontSize(20)
    .font("Helvetica-Bold")
    .text("DONATION RECEIPT (BATCH)", { align: "center" })
    .moveDown(0.5);

  // Restaurant logo or name as header
  doc
    .fontSize(16)
    .font("Helvetica-Bold")
    .text(order.donor_form?.donor?.name || "Restaurant Name", {
      align: "center",
    })
    .moveDown(0.5);

  // Receipt information
  doc
    .fontSize(12)
    .font("Helvetica")
    .text(`Receipt Number: ${receiptNumber}`, { align: "right" })
    .text(`Batch ID: ${batchId}`, { align: "right" })
    .text(`Date Issued: ${issueDate}`, { align: "right" })
    .text(`Donation Date: ${donationDate}`, { align: "right" })
    .moveDown(1);

  // Draw a line
  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke().moveDown(1);

  // Donor Information
  doc
    .fontSize(14)
    .font("Helvetica-Bold")
    .text("Donor Information")
    .moveDown(0.5);

  doc
    .fontSize(12)
    .font("Helvetica")
    .text(`Name: ${order.donor_form?.donor?.name || "Unknown"}`)
    .text(`Phone: ${order.donor_form?.donor?.phone_no || "N/A"}`)
    .text(`Email: ${order.donor_form?.donor?.email || "N/A"}`)
    .moveDown(1);

  // Recipient Information
  doc
    .fontSize(14)
    .font("Helvetica-Bold")
    .text("Recipient Organization")
    .moveDown(0.5);

  doc
    .fontSize(12)
    .font("Helvetica")
    .text(`Name: ${order.ngo?.name || "Unknown"}`)
    .text(`Registration Number: ${order.ngo?.reg_no || "N/A"}`)
    .moveDown(1);

  // Donation Details
  doc
    .fontSize(14)
    .font("Helvetica-Bold")
    .text("Donation Details")
    .moveDown(0.5);

  // Create a table for donation details
  const tableTop = doc.y;
  const tableLeft = 50;
  const colWidth = 125;
  const rowHeight = 30;

  // Draw table headers
  doc.font("Helvetica-Bold").fontSize(12);
  doc.text("Description", tableLeft, tableTop, {
    width: colWidth,
    align: "left",
  });
  doc.text("Food Serves", tableLeft + colWidth, tableTop, {
    width: colWidth,
    align: "center",
  });
  doc.text("Value per Serve", tableLeft + colWidth * 2, tableTop, {
    width: colWidth,
    align: "center",
  });
  doc.text("Total Amount", tableLeft + colWidth * 3, tableTop, {
    width: colWidth,
    align: "right",
  });

  // Draw table row
  doc.font("Helvetica").fontSize(12);
  doc.text(
    order.donor_form?.food_name || "Food Donation",
    tableLeft,
    tableTop + rowHeight,
    { width: colWidth, align: "left" }
  );
  doc.text(
    (order.serves || 0).toString(),
    tableLeft + colWidth,
    tableTop + rowHeight,
    { width: colWidth, align: "center" }
  );
  doc.text("₹50.00", tableLeft + colWidth * 2, tableTop + rowHeight, {
    width: colWidth,
    align: "center",
  });
  doc.text(
    `₹${donationAmount.toFixed(2)}`,
    tableLeft + colWidth * 3,
    tableTop + rowHeight,
    { width: colWidth, align: "right" }
  );

  // Draw table lines
  doc
    .moveTo(tableLeft, tableTop - 5)
    .lineTo(tableLeft + colWidth * 4, tableTop - 5)
    .stroke();

  doc
    .moveTo(tableLeft, tableTop + rowHeight - 5)
    .lineTo(tableLeft + colWidth * 4, tableTop + rowHeight - 5)
    .stroke();

  doc
    .moveTo(tableLeft, tableTop + rowHeight * 2 - 5)
    .lineTo(tableLeft + colWidth * 4, tableTop + rowHeight * 2 - 5)
    .stroke();

  // Total amount (with some space after the table)
  doc.moveDown(2);
  doc
    .fontSize(14)
    .font("Helvetica-Bold")
    .text(`Total Donation Value: ₹${donationAmount.toFixed(2)}`, {
      align: "right",
    })
    .moveDown(1);

  // Legal statement for tax deduction
  doc.moveDown(1);
  doc
    .fontSize(12)
    .font("Helvetica-Oblique")
    .text(
      "This receipt is issued as documentation for tax deduction purposes under Section 80G of the Income Tax Act. The amount stated represents the fair market value of the donated food items.",
      { align: "justify" }
    )
    .moveDown(0.5);

  // Batch receipt identifier
  doc
    .fontSize(10)
    .font("Helvetica-Bold")
    .fillColor("red")
    .text(
      "IMPORTANT: This is part of a batch receipt. The donation can only be claimed once for tax deduction purposes.",
      { align: "center" }
    )
    .fillColor("black")
    .moveDown(0.5);

  // Delivery information
  if (order.delivery_person_name) {
    doc.moveDown(1);
    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .text("Delivery Information")
      .moveDown(0.5);

    doc
      .fontSize(12)
      .font("Helvetica")
      .text(`Delivered by: ${order.delivery_person_name}`)
      .text(`Contact: ${order.delivery_person_phone_no || "N/A"}`)
      .moveDown(1);
  }

  // Thank you note
  doc.moveDown(1);
  doc
    .fontSize(14)
    .font("Helvetica-Bold")
    .text("Thank You For Your Generous Donation!", { align: "center" })
    .moveDown(0.5);

  // Signature lines
  doc.moveDown(3);
  const signatureY = doc.y;

  doc
    .fontSize(12)
    .font("Helvetica")
    .text("_________________________", 100, signatureY)
    .text("Donor Signature", 125, signatureY + 20)
    .text("_________________________", 350, signatureY)
    .text("Recipient Signature", 375, signatureY + 20);

  // Finalize PDF
  doc.end();

  // Wait for PDF to be generated and return it
  return await pdfPromise;
}
