import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import * as XLSX from "xlsx";
import { supabase } from "@/lib/supabase";

interface OrderData {
  serves: number;
  created_at: string;
  donor_form: {
    food_name: string;
    donor: {
      name: string;
      phone_no: string;
    } | null;
  } | null;
  ngo: {
    name: string;
  } | null;
  delivery_person_name: string | null;
  delivery_person_phone_no: string | null;
}

export async function GET() {
  try {

    // Fetch data from Supabase
    const { data, error } = await supabase
      .from("orders") // Replace with your table name
      .select(`
        serves,
        created_at,
        donor_form:donor_form_id (food_name,donor:donor_id (name, phone_no)),
        ngo:ngo_id (name),
        delivery_person_name,
        delivery_person_phone_no
        `) as { data: OrderData[] | null; error: any };

    if (error || !data) {
      return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }

    // Transform data
    const formattedData = data.map((row) => ({
      Donor: row.donor_form?.donor?.name || "Unknown",
      NGO: row.ngo?.name || "Unknown",
      "Food Name": row.donor_form?.food_name || "Unknown",
      Serves: row.serves,
      "Delivery Person": row.delivery_person_name || "Not Assigned",
      "Delivery Contact": row.delivery_person_phone_no || "N/A",
      "Total Amount": row.serves * 50, // Calculation
      "Created At": new Date(row.created_at).toLocaleString(),
    }));
    // Convert to Excel format
    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Donations");

    // Generate binary data
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    // Convert to Blob and return as response
    return new NextResponse(Buffer.from(excelBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": "attachment; filename=donations.xlsx",
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
