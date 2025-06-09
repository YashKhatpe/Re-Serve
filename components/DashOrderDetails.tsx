"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { NgoOrderDetails } from "@/components/order/ngo-order-details";
import { useAuth } from "@/context/auth-context";
import { DashNavbar } from "@/components/DashNavbar";
import { toast } from "sonner";
type Orders = {
  id: string;
  serves: number;
  otp: number;
  created_at: string;
  delivery_person_name: string;
  delivery_person_phone_no: number;
  delivery_status: "delivering" | "delivered";
};

export default function DashOrderDetails() {
  // const [userType, setUserType] = useState<"donor" | "ngo" | null>(null);
  const [filter, setFilter] = useState<string>("ALL");
  const [orders, setOrders] = useState<Orders[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Orders[]>([]);
  const [otpInput, setOtpInput] = useState<{ [key: string]: string }>({});
  const router = useRouter();
  const { userType, loading, session, user } = useAuth();

  useEffect(() => {
    if (loading) return; // Wait until auth check is complete

    if (!user) {
      router.push("/login");
      return;
    }

    const fetchOrders = async () => {
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
                        id, 
                        donor_form_id, 
                        ngo_id, 
                        serves,
                        donor_id, 
                        otp, 
                        created_at, 
                        delivery_person_name, 
                        delivery_person_phone_no, 
                        delivery_status
                    `
        )
        .eq("donor_id", user.id);

      if (error) {
        console.error("Error fetching orders:", error);
        return;
      }

      console.log("Fetched Orders:", data);
      setOrders(data);
      setFilteredOrders(data);
    };

    fetchOrders();
  }, [loading, user]); // Add `loading` and `user` as dependencies

  // Handle OTP verification
  const handleVerifyOTP = async (orderId: string, correctOtp: number) => {
    // Convert both to strings for proper comparison
    const enteredOtp = (otpInput[orderId] || "").trim();
    const storedOtp = String(correctOtp).trim();
    console.log("Both the otps: ", enteredOtp, storedOtp);
    if (enteredOtp !== storedOtp) {
      // setError("Incorrect OTP! Please try again.");
      toast("Incorrect OTP", {
        description: "Please try again.",
      });
      // setSuccess(null);
      return;
    }

    const { error } = await supabase
      .from("orders")
      .update({ delivery_status: "delivered" })
      .eq("id", orderId);

    if (error) {
      // setError("Failed to verify OTP. Please try again.");
      // setSuccess(null);
      toast("Incorrect OTP", {
        description: "Please try again.",
      });
      return;
    }

    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === orderId
          ? { ...order, delivery_status: "delivered" }
          : order
      )
    );

    toast("Correct OTP", {
      description: "Successfully verified otp",
    });
  };

  return (
    <>
      {userType == "donor" ? (
        <section className=" px-6 py-10 pt-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Donor Order Details
          </h1>

          {/* Filters */}
          <div className="flex space-x-4 mb-6">
            {["ALL", "Delivered", "Delivering"].map((status) => (
              <Button
                key={status}
                className={`px-6 py-2 font-medium text-sm rounded-md transition ${
                  filter === status
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
                onClick={() => setFilter(status)}
              >
                {status}
              </Button>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border border-gray-300 bg-white shadow-md rounded-lg text-left">
              <thead>
                <tr className="bg-gray-100 text-gray-900">
                  <th className="p-4 border border-gray-300">Order ID</th>
                  <th className="p-4 border border-gray-300">
                    Delivery Status
                  </th>
                  <th className="p-4 border border-gray-300">Serves</th>
                  <th className="p-4 border border-gray-300">
                    Delivery Person
                  </th>
                  <th className="p-4 border border-gray-300">Contact</th>
                  {/* <th className="p-4 border border-gray-300">OTP</th> */}
                  <th className="p-4 border border-gray-300">Enter OTP</th>
                  <th className="p-4 border border-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-300">
                    <td className="p-4 border border-gray-300">{order.id}</td>
                    <td className="p-4 border border-gray-300">
                      <span
                        className={`px-3 py-1 rounded-md font-medium ${
                          order.delivery_status === "delivered"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {order.delivery_status ?? "delivering"}
                      </span>
                    </td>
                    <td className="p-4 border border-gray-300">
                      {order.serves}
                    </td>
                    <td className="p-4 border border-gray-300">
                      {order.delivery_person_name}
                    </td>
                    <td className="p-4 border border-gray-300">
                      {order.delivery_person_phone_no}
                    </td>
                    {/* <td className="p-4 border border-gray-300">{order.otp}</td> */}
                    <td className="p-4 border border-gray-300">
                      {order.delivery_status === "delivered" ? (
                        <span className="text-gray-500">Already Delivered</span>
                      ) : (
                        <input
                          type="text"
                          placeholder="Enter OTP"
                          className="px-3 py-2 border rounded-md w-32"
                          value={otpInput[order.id] || ""}
                          onChange={(e) =>
                            setOtpInput((prev) => ({
                              ...prev,
                              [order.id]: e.target.value,
                            }))
                          }
                        />
                      )}
                    </td>
                    <td className="p-4 border border-gray-300">
                      {order.delivery_status === "delivered" ? (
                        <span className="text-green-600">✔ Verified</span>
                      ) : (
                        <Button
                          onClick={() => handleVerifyOTP(order.id, order.otp)}
                          disabled={!otpInput[order.id]}
                        >
                          Verify OTP
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <NgoOrderDetails />
      )}
    </>
  );
}
