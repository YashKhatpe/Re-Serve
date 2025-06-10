"use client";

import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { useAuth } from "@/context/auth-context";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { Edit } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";

type Order = {
  id: string;
  //   delivery_status: string;
};

type DonorFormWithOrders = {
  id: string;
  food_name: string;
  food_image: any;
  preparation_date_time: string;
  food_type: string;
  serves: number;
  storage: string;
  preferred_pickup_time: string;
  food_safety_info: string | null;
  original_serves: number;
  orders: Order[]; // related orders with delivery_status = 'delivering'
};

export default function CurrentOrders() {
  const [orders, setOrders] = useState<DonorFormWithOrders[]>([]);
  const { user } = useAuth();

  const fetchCurrentOrders = async () => {
    const { data, error } = await supabase
      .from("donor_form")
      .select(
        `
  id,
  food_name,
  food_image,
  preparation_date_time,
  food_type,
  serves,
  storage,
  preferred_pickup_time,
  food_safety_info,
  original_serves,
  orders (
    id
  )
  `
      )
      .eq("donor_id", user?.id);
    if (error) {
      console.error("Error fetching orders:", error);
      return;
    }
    const unOrderedFood = data.filter((item) => item.orders.length === 0);

    setOrders(unOrderedFood);
    console.log("Order data: ", unOrderedFood);
  };
  useEffect(() => {
    fetchCurrentOrders();
  }, []);

  const [selectedOrder, setSelectedOrder] =
    useState<DonorFormWithOrders | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedOrder) return;

    setSelectedOrder({
      ...selectedOrder,
      [e.target.name]: e.target.value,
    });
  };

  const handleStorageChange = (value: string) => {
    if (!selectedOrder) return;

    setSelectedOrder({
      ...selectedOrder,
      storage: value,
    });
  };

  const handleSave = async () => {
    if (!selectedOrder) {
      toast("No details found", {
        description: "Please fill all the details correctly",
      });
      return;
    }

    console.log("Saving updated order:", selectedOrder);
    let foodImageUrl: string | null = null;
    const file: File | string | null = selectedOrder.food_image;

    // 🧠 Skip upload if not changed
    if (file instanceof File) {
      const fileExt = file.name.split(".").pop();
      const fileName = `${uuidv4()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("food_image")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("Upload Error:", uploadError);
        toast("Upload failed", {
          description: uploadError.message,
        });
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("food_image")
        .getPublicUrl(fileName);

      foodImageUrl = publicUrlData?.publicUrl ?? "";
    } else if (typeof file === "string") {
      foodImageUrl = file; // reuse existing image
    } else {
      toast("No image selected", {
        description: "Please select a food image before submitting.",
      });
      return;
    }

    // Calculate hours since preparation
    let hoursSincePrepared = 0;
    if (selectedOrder.preparation_date_time) {
      const prepDate = new Date(selectedOrder.preparation_date_time);
      const now = new Date();
      hoursSincePrepared = Math.floor(
        (now.getTime() - prepDate.getTime()) / (1000 * 60 * 60)
      );
    }

    // 🧪 Food Safety API
    let foodSafetyInfo = null;
    try {
      const apiPayload = {
        foodName: selectedOrder.food_name,
        storage_type: selectedOrder.storage,
        hours_since_prepared: hoursSincePrepared,
      };

      console.log("Food Safety API payload:", apiPayload);
      const apiRes = await axios.post(
        "https://expiry-prediction.onrender.com/api/food-safety",
        apiPayload,
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("Food Safety API response:", apiRes.data);
      foodSafetyInfo = apiRes.data;
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        console.error(
          "Food Safety API error:",
          err.response.status,
          err.response.data
        );
      } else {
        console.error("Food Safety API error:", err);
      }
      foodSafetyInfo = null;
    }

    // 📝 Construct the payload
    const payload = {
      food_name: selectedOrder.food_name,
      food_image: foodImageUrl,
      preparation_date_time: selectedOrder.preparation_date_time,
      food_type: selectedOrder.food_type,
      serves: selectedOrder.serves,
      storage: selectedOrder.storage,
      preferred_pickup_time: selectedOrder.preferred_pickup_time,
      food_safety_info: foodSafetyInfo,
      original_serves: selectedOrder.serves,
    };

    // 🔄 Update the donor_form
    const { error } = await supabase
      .from("donor_form")
      .update(payload)
      .eq("id", selectedOrder.id);

    if (error) {
      console.error("Update failed:", error);
      toast("Failed to update", { description: error.message });
    } else {
      toast("Update successful", { description: "Order updated successfully" });
      fetchCurrentOrders();
      setSelectedOrder(null);
    }
  };

  return (
    <>
      <section className=" px-6 py-10 pt-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Live Donation Details
        </h1>

        <div className="overflow-x-auto">
          <table className="w-full border border-gray-300 bg-white shadow-md rounded-lg text-left">
            <thead>
              <tr className="bg-gray-100 text-gray-900">
                <th className="p-4 border border-gray-300">Food Name</th>
                <th className="p-4 border border-gray-300">Food Image</th>
                <th className="p-4 border border-gray-300">Preparation Time</th>
                <th className="p-4 border border-gray-300">Food Type</th>
                {/* <th className="p-4 border border-gray-300">Contact</th> */}
                {/* <th className="p-4 border border-gray-300">OTP</th> */}
                <th className="p-4 border border-gray-300">Serves</th>
                <th className="p-4 border border-gray-300">Storage</th>
                <th className="p-4 border border-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-gray-300">
                  <td className="p-4 border border-gray-300">
                    {order.food_name}
                  </td>
                  <td className="p-4 border border-gray-300">
                    {/* <span
                      className={`px-3 py-1 rounded-md font-medium ${
                        order.delivery_status === "delivered"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {order.delivery_status ?? "delivering"}
                    </span> */}
                    <Image
                      src={order.food_image}
                      alt="Food"
                      width={80}
                      height={80}
                    />
                    {/* {order.food_image} */}
                  </td>
                  <td className="p-4 border border-gray-300">
                    {/* {new Date(order.preparation_date_time).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )} */}
                    {order.preparation_date_time}
                  </td>
                  <td className="p-4 border border-gray-300">
                    {order.food_type
                      .split("-")
                      .map(
                        (word) => word.charAt(0).toUpperCase() + word.slice(1)
                      )
                      .join("-")}
                  </td>
                  <td className="p-4 border border-gray-300">{order.serves}</td>
                  <td className="p-4 border border-gray-300">
                    {order.storage == "refrigerated"
                      ? "Refrigerated"
                      : order.storage == "room_temp"
                      ? "Room Temperature"
                      : "Frozen"}
                  </td>
                  {/* <td className="p-4 border border-gray-300 ">
                    <Edit color="red" />
                  </td> */}
                  <td className="p-4 border">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <Edit className="text-red-500" />
                          Edit
                        </Button>
                      </DialogTrigger>
                      {selectedOrder?.id === order.id && (
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Edit Order</DialogTitle>
                          </DialogHeader>

                          <div className="space-y-4 py-4">
                            {/* Food Name */}
                            <div className="space-y-2">
                              <Label htmlFor="food_name">Food Name</Label>
                              <Input
                                id="food_name"
                                name="food_name"
                                value={selectedOrder?.food_name || ""}
                                onChange={handleInputChange}
                              />
                            </div>

                            {/* Food Image */}
                            <div className="space-y-2">
                              <Label htmlFor="food_image">Food Image</Label>
                              <Input
                                id="food_image"
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (!file || !selectedOrder) return;

                                  setSelectedOrder({
                                    ...selectedOrder,
                                    food_image: file, // 👈 store the File directly
                                  });
                                }}
                              />
                              {selectedOrder?.food_image && (
                                <img
                                  src={
                                    selectedOrder.food_image instanceof File
                                      ? URL.createObjectURL(
                                          selectedOrder.food_image
                                        )
                                      : selectedOrder.food_image
                                  }
                                  alt="Preview"
                                  className="w-24 h-24 object-cover rounded"
                                />
                              )}
                            </div>

                            {/* Preparation DateTime */}
                            <div className="space-y-2">
                              <Label htmlFor="preparation_date_time">
                                Preparation Time
                              </Label>
                              <Input
                                id="preparation_date_time"
                                name="preparation_date_time"
                                type="datetime-local"
                                value={
                                  selectedOrder?.preparation_date_time
                                    ? new Date(
                                        new Date(
                                          selectedOrder.preparation_date_time
                                        ).getTime() -
                                          new Date(
                                            selectedOrder.preparation_date_time
                                          ).getTimezoneOffset() *
                                            60000
                                      )
                                        .toISOString()
                                        .slice(0, 16)
                                    : ""
                                }
                                onChange={handleInputChange}
                              />
                            </div>
                            {/* Serves */}
                            <div className="space-y-2">
                              <Label htmlFor="serves">Serves</Label>
                              <Input
                                id="serves"
                                type="number"
                                name="serves"
                                min={1}
                                value={selectedOrder?.serves || ""}
                                onChange={handleInputChange}
                              />
                            </div>
                            <div className="flex justify-between">
                              {/* Food Type */}
                              <div className="space-y-2 ">
                                <Label htmlFor="food_type">Food Type</Label>
                                <Select
                                  value={selectedOrder?.food_type}
                                  onValueChange={(value) =>
                                    setSelectedOrder({
                                      ...selectedOrder!,
                                      food_type: value,
                                    })
                                  }
                                >
                                  <SelectTrigger
                                    className="w-[150px]"
                                    id="food_type"
                                  >
                                    <SelectValue placeholder="Select Food Type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="veg">Veg</SelectItem>
                                    <SelectItem value="non-veg">
                                      Non-Veg
                                    </SelectItem>
                                    <SelectItem value="vegan">Vegan</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              {/* Storage */}
                              <div className="space-y-2">
                                <Label htmlFor="storage">Storage</Label>
                                <Select
                                  value={selectedOrder?.storage}
                                  onValueChange={handleStorageChange}
                                >
                                  <SelectTrigger
                                    className="w-[180px]"
                                    id="storage"
                                  >
                                    <SelectValue placeholder="Select Storage" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="refrigerated">
                                      Refrigerated
                                    </SelectItem>
                                    <SelectItem value="room_temp">
                                      Room Temperature
                                    </SelectItem>
                                    <SelectItem value="frozen">
                                      Frozen
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>

                          <DialogFooter>
                            <DialogClose asChild>
                              <Button type="button" variant="secondary">
                                Cancel
                              </Button>
                            </DialogClose>
                            <DialogClose asChild>
                              <Button type="button" onClick={handleSave}>
                                Save
                              </Button>
                            </DialogClose>
                          </DialogFooter>
                        </DialogContent>
                      )}
                    </Dialog>
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
