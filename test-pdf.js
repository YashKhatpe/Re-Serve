const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

// Absolute path to your font file
const fontPath = path.join(process.cwd(), "public/font/Roboto-Regular.ttf");
console.log("Font path:", fontPath);

if (!fs.existsSync(fontPath)) {
  console.error("Font file not found at:", fontPath);
  process.exit(1);
}

// Create a new PDF document
const doc = new PDFDocument();
doc.registerFont("Custom", fontPath);
doc.font("Custom");

// Pipe its output somewhere, like to a file or HTTP response
const outPath = path.join(process.cwd(), "test-output.pdf");
doc.pipe(fs.createWriteStream(outPath));

// Add some text
doc
  .fontSize(25)
  .font("Custom")
  .text("Hello, this is a test PDF using Roboto!", 100, 100);
doc
  .fontSize(14)
  .font("Custom")
  .text("If you see this text, your font is working.", 100, 150);

// Finalize PDF file
doc.end();

console.log("PDF generated at:", outPath);
