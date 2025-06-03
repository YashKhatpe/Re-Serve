// generate-pdf.js
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

function generatePDF(order, outputPath) {
  const fontPath = path.join(process.cwd(), "public/font/Roboto-Regular.ttf");
  const doc = new PDFDocument({ margin: 40 });
  doc.registerFont("Custom", fontPath);
  doc.font("Custom");
  doc.pipe(fs.createWriteStream(outputPath));

  doc
    .fontSize(18)
    .font("Custom")
    .text("DONATION RECEIPT (BATCH)", { align: "center" });
  doc.moveDown();
  doc
    .fontSize(14)
    .font("Custom")
    .text(order.donorName || "Restaurant Name", { align: "center" });
  doc.moveDown();
  doc
    .fontSize(10)
    .font("Custom")
    .text(`Receipt Number: ${order.receiptNumber}`);
  doc.font("Custom").text(`Batch ID: ${order.batchId}`);
  doc.font("Custom").text(`Date Issued: ${order.issueDate}`);
  doc.font("Custom").text(`Donation Date: ${order.donationDate}`);
  doc.moveDown();
  doc
    .fontSize(12)
    .font("Custom")
    .text("Donor Information", { underline: true });
  doc
    .fontSize(10)
    .font("Custom")
    .text(`Name: ${order.donorName || "Unknown"}`);
  doc.font("Custom").text(`Phone: ${order.donorPhone || "N/A"}`);
  doc.font("Custom").text(`Email: ${order.donorEmail || "N/A"}`);
  doc.moveDown();
  doc
    .fontSize(12)
    .font("Custom")
    .text("Recipient Organization", { underline: true });
  doc
    .fontSize(10)
    .font("Custom")
    .text(`Name: ${order.ngoName || "Unknown"}`);
  doc.font("Custom").text(`Registration Number: ${order.ngoRegNo || "N/A"}`);
  doc.moveDown();
  doc.fontSize(12).font("Custom").text("Donation Details", { underline: true });
  doc
    .fontSize(10)
    .font("Custom")
    .text(`Description: ${order.foodName || "Food Donation"}`);
  doc.font("Custom").text(`Food Serves: ${order.serves}`);
  doc.font("Custom").text(`Value per Serve: ₹50.00`);
  doc.font("Custom").text(`Total Amount: ₹${order.donationAmount}`);
  doc.moveDown();
  doc
    .fontSize(10)
    .font("Custom")
    .text(`Total Donation Value: ₹${order.donationAmount}`);
  doc.moveDown();
  doc
    .fontSize(10)
    .font("Custom")
    .text(
      "This receipt is issued as documentation for tax deduction purposes under Section 80G of the Income Tax Act. The amount stated represents the fair market value of the donated food items."
    );
  doc.moveDown();
  doc
    .fillColor("red")
    .fontSize(10)
    .font("Custom")
    .text(
      "IMPORTANT: This is part of a batch receipt. The donation can only be claimed once for tax deduction purposes.",
      { align: "center" }
    );
  doc.fillColor("black");
  doc.moveDown();
  if (order.deliveryPersonName) {
    doc
      .fontSize(12)
      .font("Custom")
      .text("Delivery Information", { underline: true });
    doc
      .fontSize(10)
      .font("Custom")
      .text(`Delivered by: ${order.deliveryPersonName}`);
    doc.font("Custom").text(`Contact: ${order.deliveryPersonPhone || "N/A"}`);
    doc.moveDown();
  }
  doc.moveDown();
  doc
    .fontSize(12)
    .font("Custom")
    .text("Thank You For Your Generous Donation!", { align: "center" });
  doc.moveDown();
  doc
    .font("Custom")
    .text("_________________________    _________________________");
  doc.font("Custom").text("Donor Signature             Recipient Signature");
  doc.end();
}

// Read order data from stdin
const input = [];
process.stdin.on("data", (chunk) => input.push(chunk));
process.stdin.on("end", () => {
  const { order, outputPath } = JSON.parse(Buffer.concat(input).toString());
  generatePDF(order, outputPath);
});
