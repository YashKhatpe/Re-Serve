import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  try {
    const { searchParams } = new URL(request.url);
    const donorId = searchParams.get("donor_id");

    if (!donorId) {
      return new Response("donor_id query parameter is required", {
        status: 400,
      });
    }

    // Total Today's Donation
    const today = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"
    const { data: allServes, error: servesError } = await supabase
      .from("orders")
      .select("serves")
      .eq("donor_id", donorId)
      .eq("delivery_status", "delivered")
      .filter("created_at", "eq", today); // compare only the date part

    if (servesError) throw servesError;
    const noOfPeopleServedToday =
      allServes?.reduce((sum, row) => sum + row.serves, 0) || 0;
    const todayTotalDonation = noOfPeopleServedToday * 60;

    // Total Donations
    const { count: totalDonationCount, error: donError } = await supabase
      .from("orders")
      .select("serves", { count: "exact", head: true })
      .eq("donor_id", donorId)
      .eq("delivery_status", "delivered");
    // .filter("created_at", "eq", today); // compare only the date part

    if (donError) throw donError;

    // Number of Ngos
    const { data: ngos, error: ngoCountError } = await supabase
      .from("orders")
      .select("ngo_id")
      .eq("donor_id", donorId);

    if (ngoCountError) throw ngoCountError;
    const uniqueNgoIds = [...new Set(ngos.map((item) => item.ngo_id))];
    console.log("Unique NGO count:", uniqueNgoIds.length);

    // Number of people served
    const { data: noOfServes, error: peopleError } = await supabase
      .from("orders")
      .select("serves")
      .eq("donor_id", donorId);

    if (peopleError) throw peopleError;

    const noOfPeopleServed =
      noOfServes.reduce((sum, row) => sum + row.serves, 0) || 0;

    return NextResponse.json({
      todayTotalDonation,
      noOfPeopleServedToday,
      totalDonationCount,
      noOfNgos: uniqueNgoIds.length,
      noOfPeopleServed,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch NGO dashboard data" },
      { status: 500 }
    );
  }
}
