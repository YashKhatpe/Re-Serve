import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const ngoId = searchParams.get("ngo_id");

    if (!ngoId) {
      return new Response("ngo_id query parameter is required", {
        status: 400,
      });
    }

    const { data: mealsData, error: mealsError } = await supabase
      .from("orders")
      .select("serves")
      .eq("ngo_id", ngoId)
      .eq("delivery_status", "delivered");

    if (mealsError) throw mealsError;
    const totalMealsServed = mealsData.reduce(
      (sum, order) => sum + (order.serves || 0),
      0
    );

    const { count: donationCount, error: donationError } = await supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("ngo_id", ngoId);

    if (donationError) throw donationError;

    const { data: donorsData, error: donorsError } = await supabase
      .from("orders")
      .select("donor_form_id")
      .eq("ngo_id", ngoId)
      .neq("donor_form_id", null);

    if (donorsError) throw donorsError;

    const uniqueDonors = Array.from(
      new Set(donorsData.map((d) => d.donor_form_id))
    );

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: volunteerData, error: volunteerError } = await supabase
      .from("orders")
      .select("delivery_person_name, delivery_person_phone_no, created_at")
      .eq("ngo_id", ngoId)
      .gte("created_at", thirtyDaysAgo.toISOString());

    if (volunteerError) throw volunteerError;

    const uniqueVolunteers = Object.values(
      volunteerData.reduce((acc, v) => {
        const key = v.delivery_person_phone_no;
        if (v.delivery_person_name && !acc[key]) {
          acc[key] = {
            name: v.delivery_person_name,
            phone: v.delivery_person_phone_no,
            joined: v.created_at,
          };
        }
        return acc;
      }, {} as Record<string, { name: string; phone: string; joined: string }>)
    );

    return NextResponse.json({
      totalMealsServed,
      totalDonations: donationCount,
      uniqueDonors: uniqueDonors.length,
      newVolunteers: uniqueVolunteers,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch NGO dashboard data" },
      { status: 500 }
    );
  }
}
