"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Orders = {
  id: string;
  serves: number;
  otp: number;
  created_at: string;
  delivery_person_name: string;
  delivery_person_phone_no: number;
  delivery_status: "delivering" | "delivered";
  donor: any;
};

export function NgoOrderDetails() {
  const supabase = createClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [orders, setOrders] = useState<Orders[]>([]);
  const router = useRouter();

  // Check authentication
  useEffect(() => {
    async function checkAuth() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUserId(user?.id);
    }
    checkAuth();
  }, [router]);

  // Fetch orders
  useEffect(() => {
    async function fetchOrders() {
      if (!userId) return;

      const { data, error } = await supabase
        .from("orders")
        .select(
          `
  id,
  serves,
  otp,
  created_at,
  delivery_person_name,
  delivery_person_phone_no,
  delivery_status,
  donor:donor_id (
    address_map_link,
    name
  )
`
        )
        .eq("ngo_id", userId);
      console.log(data);

      if (error) {
        console.error("Error fetching orders:", error);
        return;
      }

      setOrders(data);
    }

    fetchOrders();
  }, [userId]);

  return (
    <>
      <div className="container mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          NGO Order Details
        </h1>
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-300 bg-white shadow-md rounded-lg text-left">
            <thead>
              <tr className="bg-gray-100 text-gray-900">
                <th className="p-4 border border-gray-300">Donor Name</th>
                <th className="p-4 border border-gray-300">
                  Donor Address Map Link
                </th>
                <th className="p-4 border border-gray-300">Serves</th>
                <th className="p-4 border border-gray-300">Delivery Person</th>
                <th className="p-4 border border-gray-300">Contact</th>
                <th className="p-4 border border-gray-300">Delivery Status</th>
                <th className="p-4 border border-gray-300">OTP</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-gray-300">
                  <td className="p-4 border border-gray-300">
                    {order.donor?.name}
                  </td>
                  <td className="p-4 border border-gray-300">
                    <button
                      onClick={() =>
                        window.open(order.donor?.address_map_link, "_blank")
                      }
                      className="text-blue-600 hover:underline hover:text-blue-800"
                    >
                      View Map
                    </button>
                  </td>
                  <td className="p-4 border border-gray-300">{order.serves}</td>
                  <td className="p-4 border border-gray-300">
                    {order.delivery_person_name}
                  </td>
                  <td className="p-4 border border-gray-300">
                    {order.delivery_person_phone_no}
                  </td>
                  <td className="p-4 border border-gray-300">
                    <span
                      className={`px-3 py-1 rounded-md font-medium ${
                        order.delivery_status === "delivered"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {order.delivery_status}
                    </span>
                  </td>
                  <td className="p-4 border border-gray-300">{order.otp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
