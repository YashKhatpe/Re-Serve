"use client"
import React, { useState } from "react";

// Define the type for an order
interface Order {
  id: number;
  customer: string;
  status: "delivering" | "delivered";
  totalPrice: number;
}

const OrderPage: React.FC = () => {
  // Sample order data
  const [orders] = useState<Order[]>([
    { id: 1, customer: "John Doe", status: "delivering", totalPrice: 250 },
    { id: 2, customer: "Jane Smith", status: "delivered", totalPrice: 450 },
    { id: 3, customer: "Alice Brown", status: "delivering", totalPrice: 150 },
  ]);

  // Filter state
  const [statusFilter, setStatusFilter] = useState<"delivering" | "delivered" | "all">("all");

  // Function to handle status filtering
  const filteredOrders = orders.filter(
    (order) => statusFilter === "all" || order.status === statusFilter
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Orders</h1>
      <div className="mb-4">
        <button onClick={() => setStatusFilter("all")} className="mr-2 px-4 py-2 border rounded">
          All
        </button>
        <button onClick={() => setStatusFilter("delivering")} className="mr-2 px-4 py-2 border rounded">
          Delivering
        </button>
        <button onClick={() => setStatusFilter("delivered")} className="px-4 py-2 border rounded">
          Delivered
        </button>
      </div>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">ID</th>
            <th className="border p-2">Customer</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Total Price ($)</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.map((order) => (
            <tr key={order.id} className="text-center">
              <td className="border p-2">{order.id}</td>
              <td className="border p-2">{order.customer}</td>
              <td className="border p-2 capitalize">{order.status}</td>
              <td className="border p-2">${order.totalPrice}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderPage;
