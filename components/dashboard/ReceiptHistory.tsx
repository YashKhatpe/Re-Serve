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
        .select("id, created_at, donor_form:donor_form_id(food_name)")
        .eq("donor_form.donor_id", user.id)
        .order("created_at", { ascending: false });
      setOrders(data || []);
      setLoading(false);
    }
    fetchOrders();
  }, [user?.id]);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Your Donation Receipts</h2>
      <table className="min-w-full">
        <thead>
          <tr>
            <th>Date</th>
            <th>Food Name</th>
            <th>Receipt</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>{new Date(order.created_at).toLocaleDateString()}</td>
              <td>{order.donor_form?.food_name}</td>
              <td>
                <Button
                  onClick={() =>
                    window.open(`/api/receipts/${order.id}`, "_blank")
                  }
                  className="bg-orange-500 text-white"
                >
                  Download Receipt
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
