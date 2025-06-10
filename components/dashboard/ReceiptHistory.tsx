import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "../ui/button";
import { useAuth } from "@/context/auth-context";

export default function ReceiptHistory() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    async function fetchOrders() {
      setLoading(true);
      const { data, error } = await supabase
        .from("orders")
        .select("id, created_at, serves, donor_form:donor_form_id(food_name)")
        .eq("donor_form.donor_id", user.id)
        .order("created_at", { ascending: false });
      setOrders(data || []);
      setLoading(false);
    }
    fetchOrders();
  }, [user?.id]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-4 my-6">
      <h2 className="text-xl font-bold mb-4">Your Donation Receipts</h2>
      <table className="min-w-full border-2 border-orange-500 rounded-xl">
        <thead className="bg-orange-500 text-white">
          <tr>
            <th className="text-center px-4 py-2 border-2 border-orange-500" >Food Name</th>
            <th className="text-center px-4 py-2">Receipt Generated On</th>
            <th className="text-center px-4 py-2">Amount</th>
          </tr>
        </thead>
        <tbody >
          {orders.map((order) => (
            <tr key={order.id} className="border-2 border-orange-500" >
              <td className="text-center px-4 py-2 border-2 border-orange-500">
                {order.donor_form?.food_name}
              </td>
              <td className="text-center px-4 py-2 border-2 border-orange-500">
                {new Date(order.created_at).toLocaleString()}
              </td>
              <td className="text-center px-4 py-2 border-2 border-orange-500">
                ₹{order.serves ? (order.serves * 50).toFixed(2) : "0.00"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
