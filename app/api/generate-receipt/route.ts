export const runtime = "nodejs";

import { createClient } from "@supabase/supabase-js";
import PDFDocument from "pdfkit";

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
};

// Mock data for testing - only used if database fetch fails
const mockData = {
  id: "test-order-123456",
  serves: 50,
  created_at: new Date().toISOString(),
  donor_form: {
    food_name: "Mixed Vegetable Curry",
    donor: {
      name: "Test Restaurant",
      phone_no: "+91 9876543210",
      address: "123 Test Street, Test City, 400001",
    },
  },
  ngo: {
    name: "Test NGO Organization",
    address: "456 NGO Road, Test City, 400002",
    registration_number: "NGO-REG-12345",
  },
  delivery_person_name: "John Doe",
  delivery_person_phone_no: "+91 9876543211",
};

// In-memory receipt tracking for demo purposes
// In production, this would be stored in a database
const generatedReceipts = new Map<string, string>();

export async function GET(request: Request) {
  try {
    // Get order ID from URL parameter
    const url = new URL(request.url);
    const orderId = url.searchParams.get("id");

    if (!orderId) {
      return new Response(JSON.stringify({ error: "Order ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log(`Processing receipt for order ID: ${orderId}`);

    // Check if receipt already exists for this order
    const { data: existingReceipt, error: receiptError } = await supabase
      .from("receipts")
      .select("receipt_number, receipt_type")
      .eq("order_id", orderId)
      .single();

    if (receiptError && receiptError.code !== "PGRST116") {
      // PGRST116 is "not found" which is expected
      console.error("Error checking existing receipts:", receiptError);
    }

    if (existingReceipt) {
      console.log(
        `Order ${orderId} already has receipt ${existingReceipt.receipt_number}`
      );
      // You could return an error or continue with generating a duplicate receipt
    }

    // Fetch order data from Supabase with all related information
    let { data, error } = await supabase
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
        delivery_person_phone_no
      `
      )
      .eq("id", orderId)
      .single();

    if (error) {
      console.error("Error fetching order data:", error);
      return new Response(
        JSON.stringify({
          error: `Failed to fetch order data: ${error.message}`,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (!data) {
      console.error("No data found for order ID:", orderId);
      return new Response(JSON.stringify({ error: "Order not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Cast data to our Order type for type safety
    const order = data as unknown as Order;


    // Calculate the donation amount (with a fallback if serves is undefined)
    const serves = order.serves || 0;
    const donationAmount = serves * 50;

    // Generate a unique receipt ID with timestamp
    const timestamp = new Date().getTime();
    const receiptNumber = `DNTN-${order.id.substring(0, 8)}-${timestamp}`;

    // Store the receipt in the database
    const { error: insertError } = await supabase.from("receipts").insert({
      order_id: orderId,
      receipt_number: receiptNumber,
      receipt_type: "individual",
      amount: donationAmount,
      created_at: new Date().toISOString(),
    });

    if (insertError) {
      console.error("Error recording receipt:", insertError);
      // Continue anyway to generate the PDF
    }

    // Update the order to mark it as having a receipt
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        receipt_generated: true,
        receipt_number: receiptNumber,
      })
      .eq("id", orderId);

    if (updateError) {
      console.error("Error updating order:", updateError);
      // Continue anyway to generate the PDF
    }

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
      .text("DONATION RECEIPT", { align: "center" })
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

    // Anti-duplication disclaimer
    doc
      .fontSize(10)
      .font("Helvetica-Bold")
      .fillColor("red")
      .text(
        "IMPORTANT: This donation receipt is unique and can only be used for tax deduction once. This donation cannot be claimed again if it appears in a batch receipt.",
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
    const pdfBuffer = await pdfPromise;

    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=donation_receipt_${receiptNumber}.pdf`,
      },
    });
  } catch (error: any) {
    console.error("Unexpected error in receipt generation:", error);
    return new Response(
      JSON.stringify({
        error: "An unexpected error occurred while generating the receipt",
        details: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
