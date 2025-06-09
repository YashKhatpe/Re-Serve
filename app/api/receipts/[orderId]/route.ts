import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY!
);
// import { supabase } from "@/lib/supabase";
export async function GET(
  req: Request,
  context: { params: { orderId: string } }
) {
  const orderId = context.params.orderId;

  // 1. Check if receipt exists in DB
  const { data: receipt } = await supabase
    .from("receipts")
    .select("*")
    .eq("order_id", orderId)
    .single();

  if (receipt && receipt.pdf_url) {
    // Serve the original PDF from storage
    const pdfRes = await fetch(receipt.pdf_url);
    if (!pdfRes.ok) {
      return new Response(
        JSON.stringify({ error: "PDF not found in storage" }),
        { status: 404 }
      );
    }
    const pdfBuffer = await pdfRes.arrayBuffer();
    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=receipt_${orderId}.pdf`,
      },
    });
  }

  // If not found, return error (do NOT generate a new PDF)
  return new Response(JSON.stringify({ error: "Receipt not found" }), {
    status: 404,
  });
}
