"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

type Orders = {
    id: string;
    serves: number;
    otp: number; // Ensure it's treated as a number
    created_at: string;
    delivery_person_name: string;
    delivery_person_phone_no: number;
    delivery_status: "delivering" | "delivered";
};

export function NgoOrderDetails() {
    const [userId, setUserId] = useState<string | null>(null);
    const [orders, setOrders] = useState<Orders[]>([]);
    const [otpInput, setOtpInput] = useState<{ [key: string]: string }>({});
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const router = useRouter();

    // Check authentication
    useEffect(() => {
        async function checkAuth() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/login");
                return;
            }
            setUserId(user.id);
        }
        checkAuth();
    }, [router]);

    // Fetch orders
    useEffect(() => {
        async function fetchOrders() {
            if (!userId) return;

            const { data, error } = await supabase
                .from("orders")
                .select("id, serves, otp, created_at, delivery_person_name, delivery_person_phone_no, delivery_status")
                .eq("ngo_id", userId);

            if (error) {
                console.error("Error fetching orders:", error);
                return;
            }

            setOrders(data);
        }

        fetchOrders();
    }, [userId]);

    // Handle OTP verification
    const handleVerifyOTP = async (orderId: string, correctOtp: number) => {
        // Convert both to strings for proper comparison
        const enteredOtp = (otpInput[orderId] || "").trim();
        const storedOtp = String(correctOtp).trim();

        if (enteredOtp !== storedOtp) {
            setError("Incorrect OTP! Please try again.");
            setSuccess(null);
            return;
        }

        const { error } = await supabase
            .from("orders")
            .update({ delivery_status: "delivered" })
            .eq("id", orderId);

        if (error) {
            setError("Failed to verify OTP. Please try again.");
            setSuccess(null);
            return;
        }

        setOrders((prevOrders) =>
            prevOrders.map((order) =>
                order.id === orderId ? { ...order, delivery_status: "delivered" } : order
            )
        );

        setSuccess("OTP verified successfully! Order marked as delivered.");
        setError(null);
    };

    return (
        <>
            <div className="container mx-auto px-6 py-10">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">NGO Order Details</h1>

                {/* Error / Success Messages */}
                {error && <p className="text-red-600 bg-red-100 p-3 rounded-md">{error}</p>}
                {success && <p className="text-green-600 bg-green-100 p-3 rounded-md">{success}</p>}

                <div className="overflow-x-auto">
                    <table className="w-full border border-gray-300 bg-white shadow-md rounded-lg text-left">
                        <thead>
                            <tr className="bg-gray-100 text-gray-900">
                                <th className="p-4 border border-gray-300">Order ID</th>
                                <th className="p-4 border border-gray-300">Serves</th>
                                <th className="p-4 border border-gray-300">Delivery Person</th>
                                <th className="p-4 border border-gray-300">Contact</th>
                                <th className="p-4 border border-gray-300">Delivery Status</th>
                                <th className="p-4 border border-gray-300">Enter OTP</th>
                                <th className="p-4 border border-gray-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => (
                                <tr key={order.id} className="border-b border-gray-300">
                                    <td className="p-4 border border-gray-300">{order.id}</td>
                                    <td className="p-4 border border-gray-300">{order.serves}</td>
                                    <td className="p-4 border border-gray-300">{order.delivery_person_name}</td>
                                    <td className="p-4 border border-gray-300">{order.delivery_person_phone_no}</td>
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
                                                    setOtpInput((prev) => ({ ...prev, [order.id]: e.target.value }))
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
            </div>
        </>
    );
}
