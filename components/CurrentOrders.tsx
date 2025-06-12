"use client";

import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { useAuth } from "@/context/auth-context";
import Image from "next/image";
import { Delete, Edit, Trash, Trash2 } from "lucide-react";
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
import { createClient } from "@/lib/supabase/client";

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
  original?: {
    preparation_date_time: string | null;
    food_type: string;
    storage: string;
  };
};

export default function CurrentOrders() {
  const supabase = createClient();
  const [orders, setOrders] = useState<DonorFormWithOrders[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [selectedOrder, setSelectedOrder] =
    useState<DonorFormWithOrders | null>(null);
  const { user } = useAuth();

  const fetchCurrentOrders = async (page = 1, pageSize = 10) => {
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
      .eq("donor_id", user?.id)
      .order("preparation_date_time", { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);
    if (error) {
      console.error("Error fetching orders:", error);
      return;
    }
    setOrders(data || []);
    console.log("Order data: ", data);
  };
  useEffect(() => {
    fetchCurrentOrders();
  }, []);

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

  // Retry helper
  async function retryAsync<T>(
    fn: () => Promise<T>,
    retries = 2,
    delay = 1000
  ): Promise<T> {
    let lastError;
    for (let i = 0; i <= retries; i++) {
      try {
        return await fn();
      } catch (err) {
        lastError = err;
        if (i < retries) await new Promise((res) => setTimeout(res, delay));
      }
    }
    throw lastError;
  }

  const handleSave = async () => {
    setIsLoading(true);
    if (!selectedOrder) {
      toast("No details found", {
        description: "Please fill all the details correctly",
      });
      return;
    }
    let foodImageUrl: string | null = null;
    const file: File | string | null = selectedOrder.food_image;
    // Upload image only if it's a new File, with retry
    if (file instanceof File) {
      const fileExt = file.name.split(".").pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      try {
        await retryAsync(async () => {
          const { error: uploadError } = await supabase.storage
            .from("food-image")
            .upload(fileName, file, {
              cacheControl: "3600",
              upsert: false,
            });
          if (uploadError) throw uploadError;
        });
      } catch (uploadError: any) {
        console.error("Upload Error (with retry):", uploadError);
        toast("Upload failed after retries", {
          description: uploadError.message,
        });
        setIsLoading(false);
        return;
      }
      const { data: publicUrlData } = supabase.storage
        .from("food-image")
        .getPublicUrl(fileName);
      foodImageUrl = publicUrlData?.publicUrl ?? "";
    } else if (typeof file === "string") {
      foodImageUrl = file;
    } else {
      toast("No image selected", {
        description: "Please select a food image before submitting.",
      });
      setIsLoading(false);
      return;
    }

    // ⏱ Check if food safety info needs to be re-fetched
    const original = selectedOrder.original;
    const prepChanged =
      selectedOrder.preparation_date_time !== original?.preparation_date_time;
    const typeChanged = selectedOrder.food_type !== original?.food_type;
    const storageChanged = selectedOrder.storage !== original?.storage;

    const shouldCallFoodSafetyAPI =
      prepChanged || typeChanged || storageChanged;

    let foodSafetyInfo = selectedOrder.food_safety_info || null;

    if (shouldCallFoodSafetyAPI) {
      try {
        const prepDate = new Date(selectedOrder.preparation_date_time);
        const now = new Date();
        const hoursSincePrepared = Math.floor(
          (now.getTime() - prepDate.getTime()) / (1000 * 60 * 60)
        );

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

        foodSafetyInfo = apiRes.data;
        console.log("Food Safety API response:", apiRes.data);
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

    // 🔄 Update the donor_form with retry
    try {
      await retryAsync(async () => {
        const { error } = await supabase
          .from("donor_form")
          .update(payload)
          .eq("id", selectedOrder.id);
        if (error) throw error;
      });
      toast("Update successful", { description: "Order updated successfully" });
      fetchCurrentOrders();
      setSelectedOrder(null);
      document.getElementById("close-edit-modal")?.click();
    } catch (error: any) {
      console.error("Update failed after retries:", error);
      toast("Failed to update after retries", { description: error.message });
    }
    setIsLoading(false);
  };

  const handleDelete = async () => {
    setIsLoading(true);
    if (!selectedOrder) {
      toast("No details found", {
        description: "Please fill all the details correctly",
      });
      return;
    }
    try {
      await retryAsync(async () => {
        const { error } = await supabase
          .from("donor_form")
          .delete()
          .eq("id", selectedOrder.id);
        if (error) throw error;
      });
      toast("Delete successful", { description: "Order deleted successfully" });
      fetchCurrentOrders();
      setSelectedOrder(null);
      document.getElementById("close-delete-modal")?.click();
    } catch (error: any) {
      console.error("Delete failed after retries:", error);
      toast("Failed to delete after retries", { description: error.message });
    }
    setIsLoading(false);
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
                <th className="p-4 border border-gray-300">Delete</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const isUnavailable = order.serves === 0;
                let isExpired: boolean = false;
                // Try to use food_safety_info.shelf_life if available
                if (order.food_safety_info && order.preparation_date_time) {
                  let info: any = order.food_safety_info;
                  if (typeof info === "string") {
                    try {
                      info = JSON.parse(info);
                    } catch (e) {
                      info = undefined;
                    }
                  }
                  // Storage type mapping (same as getApiExpiryDate)
                  const storageTypeMap: Record<string, string> = {
                    room_temp: "Room Temp",
                    "Room Temp": "Room Temp",
                    refrigerated: "Refrigerated",
                    fridge: "Refrigerated",
                    Refrigerated: "Refrigerated",
                    frozen: "Frozen",
                    freezer: "Frozen",
                    Frozen: "Frozen",
                  };
                  const apiStorageType =
                    storageTypeMap[order.storage ?? ""] || order.storage;
                  const shelfLifeHours =
                    info && info.shelf_life && info.shelf_life[apiStorageType];
                  if (shelfLifeHours && !isNaN(Number(shelfLifeHours))) {
                    const prepTime = new Date(order.preparation_date_time);
                    const expiryDate = new Date(
                      prepTime.getTime() +
                        Number(shelfLifeHours) * 60 * 60 * 1000
                    );
                    isExpired = new Date() > expiryDate;
                  } else {
                    // fallback to old logic
                    const now = new Date();
                    isExpired = !!(
                      order.preparation_date_time &&
                      new Date(order.preparation_date_time) < now
                    );
                  }
                } else {
                  // fallback to old logic
                  const now = new Date();
                  isExpired = !!(
                    order.preparation_date_time &&
                    new Date(order.preparation_date_time) < now
                  );
                }
                return (
                  <tr
                    key={order.id}
                    className={`border-b border-gray-300 ${
                      isExpired
                        ? "opacity-60"
                        : isUnavailable
                        ? "opacity-50"
                        : ""
                    }`}
                  >
                    <td className="p-4 border border-gray-300 flex items-center gap-2">
                      {order.food_name}
                      {isExpired && (
                        <span className="ml-2 px-2 py-0.5 text-xs rounded bg-gray-300 text-gray-700">
                          Expired
                        </span>
                      )}
                    </td>
                    <td className="p-4 border border-gray-300">
                      <Image
                        src={order.food_image}
                        alt="Food"
                        width={80}
                        height={80}
                      />
                    </td>
                    <td className="p-4 border border-gray-300">
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
                    <td className="p-4 border border-gray-300">
                      {order.serves}
                    </td>
                    <td className="p-4 border border-gray-300">
                      {order.storage == "refrigerated"
                        ? "Refrigerated"
                        : order.storage == "room_temp"
                        ? "Room Temperature"
                        : "Frozen"}
                    </td>
                    <td className="p-4 border">
                      <Dialog>
                        <DialogTrigger asChild>
                          <span
                            title={
                              isUnavailable || isExpired
                                ? isExpired
                                  ? "This item is expired."
                                  : "All serves have been ordered."
                                : ""
                            }
                          >
                            <Button
                              variant="ghost"
                              onClick={() =>
                                setSelectedOrder({
                                  ...order,
                                  original: {
                                    preparation_date_time:
                                      order.preparation_date_time,
                                    food_type: order.food_type,
                                    storage: order.storage,
                                  },
                                })
                              }
                              disabled={Boolean(isUnavailable || isExpired)}
                            >
                              <Edit className="text-red-500" />
                              Edit
                            </Button>
                          </span>
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
                                      <SelectItem value="vegan">
                                        Vegan
                                      </SelectItem>
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
                                <Button
                                  id="close-edit-modal"
                                  type="button"
                                  variant="secondary"
                                  onClick={() => setIsLoading(false)}
                                >
                                  Cancel
                                </Button>
                              </DialogClose>
                              <Button
                                type="button"
                                onClick={handleSave}
                                disabled={isLoading}
                              >
                                {isLoading ? "Saving..." : "Save"}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        )}
                      </Dialog>
                    </td>
                    <td className="p-4 border">
                      <Dialog
                        open={isOpen}
                        onOpenChange={(open) => {
                          setIsOpen(open);
                          if (!open) {
                            setIsLoading(false);
                            setSelectedOrder(null);
                          }
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            onClick={() => {
                              setSelectedOrder({
                                ...order,
                                original: {
                                  preparation_date_time:
                                    order.preparation_date_time,
                                  food_type: order.food_type,
                                  storage: order.storage,
                                },
                              });
                              setIsOpen(true);
                            }}
                          >
                            <Trash2 className="text-red-500" />
                            Delete
                          </Button>
                        </DialogTrigger>
                        {selectedOrder?.id === order.id && (
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle>Delete Donation</DialogTitle>
                            </DialogHeader>

                            <div className="space-y-4 py-4">
                              Are you sure you want to delete this donation??
                            </div>

                            <DialogFooter>
                              <DialogClose asChild>
                                <Button
                                  id="close-delete-modal"
                                  type="button"
                                  variant="secondary"
                                  onClick={() => setIsLoading(false)}
                                >
                                  Cancel
                                </Button>
                              </DialogClose>
                              <Button
                                type="button"
                                onClick={handleDelete}
                                disabled={isLoading}
                              >
                                {isLoading ? "Deleting..." : "Delete"}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        )}
                      </Dialog>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
