"use client";

import { useState } from "react";
import { Button } from "./ui/button";

type Orders = {
  id: string;
  serves: number;
  otp: number;
  created_at: string;
  delivery_person_name: string;
  delivery_person_phone_no: number;
  delivery_status: "delivering" | "delivered";
};
export default function CurrentOrders() {
  const [orders, setOrders] = useState<Orders[]>([]);
  return (
    <>
      <section className=" px-6 py-10 pt-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Donor Current Order Details
        </h1>

        <div className="overflow-x-auto">
          <table className="w-full border border-gray-300 bg-white shadow-md rounded-lg text-left">
            <thead>
              <tr className="bg-gray-100 text-gray-900">
                <th className="p-4 border border-gray-300">Order ID</th>
                <th className="p-4 border border-gray-300">Delivery Status</th>
                <th className="p-4 border border-gray-300">Serves</th>
                <th className="p-4 border border-gray-300">Delivery Person</th>
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
                  <td className="p-4 border border-gray-300">{order.serves}</td>
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
                        //   value={otpInput[order.id] || ""}
                        //   onChange={(e) =>
                        //     setOtpInput((prev) => ({
                        //       ...prev,
                        //       [order.id]: e.target.value,
                        //     }))
                        //   }
                      />
                    )}
                  </td>
                  <td className="p-4 border border-gray-300">
                    {order.delivery_status === "delivered" ? (
                      <span className="text-green-600">✔ Verified</span>
                    ) : (
                      <Button
                      //   onClick={() => handleVerifyOTP(order.id, order.otp)}
                      //   disabled={!otpInput[order.id]}
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
    </>
  );
}
