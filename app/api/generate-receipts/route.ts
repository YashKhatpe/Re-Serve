export const runtime = "nodejs";

// import { createClient } from "@supabase/supabase-js";
// Remove PDFKit import which is causing issues
// import PDFDocument from "pdfkit";
import { supabase } from "@/lib/supabase";
import JSZip from "jszip";
import puppeteer from "puppeteer";

// Initialize Supabase client with error handling
// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// if (!supabaseUrl || !supabaseKey) {
//   console.error("Missing Supabase environment variables");
// }

// const supabase = createClient(supabaseUrl || "", supabaseKey || "");

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
      };
    });

    // Create a zip file to store all text receipts
    const zip = new JSZip();

    // Launch Puppeteer browser once for all receipts
    const browser = await puppeteer.launch({
      headless: "new", // or true for latest puppeteer
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    try {
      for (const order of orders) {
        try {
          console.log(`Generating receipt for order ${order.id}`);

          const receiptNumber = `DNTN-${order.id.substring(
            0,
            8
          )}-BATCH-${batchId.substring(0, 8)}`;

          const serves = order.serves || 0;
          const donationAmount = serves * 50;

          const issueDate = new Date().toLocaleDateString();
          const donationDate = order.created_at
            ? new Date(order.created_at).toLocaleDateString()
            : new Date().toLocaleDateString();

          // Create HTML receipt content
          const htmlReceipt = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>Donation Receipt - ${receiptNumber}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 20px; }
              .receipt-info { text-align: right; margin-bottom: 20px; }
              .section { margin-bottom: 15px; }
              .section-title { font-weight: bold; margin-bottom: 5px; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
              th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
              th { background-color: #f2f2f2; }
              .amount { text-align: right; }
              .important { color: red; text-align: center; margin: 20px 0; }
              .signature { margin-top: 50px; display: flex; justify-content: space-between; }
              .signature-line { width: 200px; text-align: center; }
            </style>
          </head>
          <body>
            <div class="header">
              <h2>DONATION RECEIPT (BATCH)</h2>
              <h3>${order.donor_form?.donor?.name || "Restaurant Name"}</h3>
            </div>
            
            <div class="receipt-info">
              <p>Receipt Number: ${receiptNumber}</p>
              <p>Batch ID: ${batchId}</p>
              <p>Date Issued: ${issueDate}</p>
              <p>Donation Date: ${donationDate}</p>
            </div>
            
            <div class="section">
              <div class="section-title">Donor Information</div>
              <p>Name: ${order.donor_form?.donor?.name || "Unknown"}</p>
              <p>Phone: ${order.donor_form?.donor?.phone_no || "N/A"}</p>
              <p>Email: ${order.donor_form?.donor?.email || "N/A"}</p>
            </div>
            
            <div class="section">
              <div class="section-title">Recipient Organization</div>
              <p>Name: ${order.ngo?.name || "Unknown"}</p>
              <p>Registration Number: ${order.ngo?.reg_no || "N/A"}</p>
            </div>
            
            <div class="section">
              <div class="section-title">Donation Details</div>
              <table>
                <tr>
                  <th>Description</th>
                  <th>Food Serves</th>
                  <th>Value per Serve</th>
                  <th>Total Amount</th>
                </tr>
                <tr>
                  <td>${order.donor_form?.food_name || "Food Donation"}</td>
                  <td>${serves}</td>
                  <td>₹50.00</td>
                  <td class="amount">₹${donationAmount.toFixed(2)}</td>
                </tr>
              </table>
            </div>
            
            <div class="amount">
              <p><strong>Total Donation Value: ₹${donationAmount.toFixed(
                2
              )}</strong></p>
            </div>
            
            <p>This receipt is issued as documentation for tax deduction purposes under Section 80G of the Income Tax Act. The amount stated represents the fair market value of the donated food items.</p>
            
            <div class="important">
              <p>IMPORTANT: This is part of a batch receipt. The donation can only be claimed once for tax deduction purposes.</p>
            </div>
            
            ${
              order.delivery_person_name
                ? `
            <div class="section">
              <div class="section-title">Delivery Information</div>
              <p>Delivered by: ${order.delivery_person_name}</p>
              <p>Contact: ${order.delivery_person_phone_no || "N/A"}</p>
            </div>
            `
                : ""
            }
            
            <div class="header">
              <h3>Thank You For Your Generous Donation!</h3>
            </div>
            
            <div class="signature">
              <div class="signature-line">
                <p>_________________________</p>
                <p>Donor Signature</p>
              </div>
              <div class="signature-line">
                <p>_________________________</p>
                <p>Recipient Signature</p>
              </div>
            </div>
          </body>
          </html>
          `;

          // Convert HTML to PDF using Puppeteer
          const page = await browser.newPage();
          await page.setContent(htmlReceipt, { waitUntil: "networkidle0" });
          const pdfBuffer = await page.pdf({ format: "A4" });
          await page.close();

          // Add PDF to zip
          const fileName = `donation_receipt_${receiptNumber}.pdf`;
          zip.file(fileName, pdfBuffer);
          console.log(`Added PDF receipt to zip file: ${fileName}`);
        } catch (err) {
          console.error(`Error generating receipt for order ${order.id}:`, err);
          if (err instanceof Error) {
            console.error("Error details:", {
              message: err.message,
              stack: err.stack,
              name: err.name,
            });
          }
        }
      }

      // Log zip file contents before generating
      console.log(
        "Zip file contents before generation:",
        Object.keys(zip.files)
      );

      if (Object.keys(zip.files).length === 0) {
        console.error("No receipt files were added to the zip file");
        return new Response(
          JSON.stringify({ error: "Failed to generate any receipts" }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      console.log(
        `Successfully generated ${Object.keys(zip.files).length} receipts`
      );

      // Generate the zip file
      console.log("Generating zip file...");
      const zipContent = await zip.generateAsync({ type: "nodebuffer" });
      console.log("Zip file generated");

      // Check if zip content is valid
      if (!zipContent || zipContent.length === 0) {
        console.error("Generated zip file is empty");
        return new Response(
          JSON.stringify({ error: "Generated zip file is empty" }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      console.log(`Generated zip file with size: ${zipContent.length} bytes`);

      // Insert receipt records
      const { error: insertError } = await supabase
        .from("receipts")
        .insert(receiptRecords);

      if (insertError) {
        console.error("Error recording batch receipts:", insertError);
        // Continue anyway to deliver the generated receipts
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
        // Continue anyway to deliver the generated receipts
      }

      // Format date range for filename
      const formattedStartDate = new Date(startDate)
        .toISOString()
        .split("T")[0];
      const formattedEndDate = new Date(endDate).toISOString().split("T")[0];

      return new Response(zipContent, {
        status: 200,
        headers: {
          "Content-Type": "application/zip",
          "Content-Disposition": `attachment; filename=donation_receipts_${formattedStartDate}_to_${formattedEndDate}.zip`,
        },
      });
    } finally {
      await browser.close();
    }
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
