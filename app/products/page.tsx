"use client";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MapPin, Clock, Sprout, ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import Image from "next/image";
import { useDonation } from "@/context/donation-context";
import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { Volume2 } from "lucide-react";
import axios from "axios";
import { Erica_One } from "next/font/google";

// Define the type for the food safety API response
interface FoodSafetyInfo {
  food_name: string;
  food_category: string;
  ingredients: string[];
  high_risk: boolean;
  safety_status: string;
  safety_message: string;
  danger_zone_hours: number;
  shelf_life: Record<string, number>;
  recommended_storage: string;
  safety_guidelines: string[];
  remaining_hours: number;
  hours_before_unsafe: number;
}

export default function ProductDetailPage() {
  const { selectedDonation } = useDonation();
  const [isOpen, setIsOpen] = useState(false);
  const [otp, setOtp] = useState("");
  const [serves, setServes] = useState("");
  const [delivery_person_name, setDeliveryPersonName] = useState("");
  const [delivery_person_phone_no, setDeliveryPersonPhoneNo] = useState("");

  // Food Safety API integration
  const [foodSafetyInfo, setFoodSafetyInfo] = useState<FoodSafetyInfo | null>(
    null
  );
  const [loadingSafety, setLoadingSafety] = useState(true);
  const [safetyError, setSafetyError] = useState("");
  const [expiryCountdown, setExpiryCountdown] = useState<string>("");
  const [isExpired, setIsExpired] = useState(false);

  const router = useRouter();

  useEffect(() => {
    if (!selectedDonation) {
      router.push("/food-listing");
      return;
    }
    // Calculate hours since preparation
    const prepTime = new Date(selectedDonation.preparation_date_time);
    const now = new Date();
    const hoursSincePrepared = Math.floor(
      (now.getTime() - prepTime.getTime()) / (1000 * 60 * 60)
    );

    // Map storage type to API expected values
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
      storageTypeMap[selectedDonation.storage] || selectedDonation.storage;

    const apiPayload = {
      foodName: selectedDonation.food_name,
      storageType: apiStorageType,
      hoursSincePrepared,
    };
    console.log("Sending to Food Safety API:", apiPayload);
    setLoadingSafety(true);
    setSafetyError("");
    fetch("https://expiry-prediction.onrender.com/api/food-safety", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(apiPayload),
    })
      .then(async (res) => {
        const text = await res.text();
        console.log("API response status:", res.status);
        console.log("API response text:", text);
        if (!res.ok) throw new Error(text);
        return JSON.parse(text);
      })
      .then((data) => setFoodSafetyInfo(data))
      .catch((err) => {
        setFoodSafetyInfo(null);
        setSafetyError("Could not fetch food safety info. " + err.message);
        console.error("Food Safety API error:", err);
      })
      .finally(() => setLoadingSafety(false));
  }, [selectedDonation, router]);

  // Real-time countdown for expiry
  useEffect(() => {
    if (!selectedDonation) return;
    let interval: NodeJS.Timeout | undefined;
    function updateCountdown() {
      if (!selectedDonation) return;
      const apiExpiry = getApiExpiryDate();
      const now = new Date();
      if (apiExpiry) {
        const diffMs = apiExpiry.getTime() - now.getTime();
        if (diffMs <= 0) {
          setExpiryCountdown("Expired");
          setIsExpired(true);
        } else {
          const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
          const diffMin = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
          let text = "";
          if (diffHrs > 0) text += `${diffHrs} hour${diffHrs > 1 ? "s" : ""} `;
          text += `${diffMin} minute${diffMin !== 1 ? "s" : ""} left to expire`;
          setExpiryCountdown(text);
          setIsExpired(false);
        }
      } else {
        // fallback to DB expiry
        const dbExpiry = selectedDonation?.expiry_date_time
          ? new Date(selectedDonation.expiry_date_time)
          : null;
        if (!dbExpiry) {
          setExpiryCountdown("");
          setIsExpired(true);
          return;
        }
        const diffMs = dbExpiry.getTime() - now.getTime();
        if (diffMs <= 0) {
          setExpiryCountdown("Expired");
          setIsExpired(true);
        } else {
          const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
          const diffMin = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
          let text = "";
          if (diffHrs > 0) text += `${diffHrs} hour${diffHrs > 1 ? "s" : ""} `;
          text += `${diffMin} minute${diffMin !== 1 ? "s" : ""} left to expire`;
          setExpiryCountdown(text);
          setIsExpired(false);
        }
      }
    }
    updateCountdown();
    interval = setInterval(updateCountdown, 60000); // update every minute
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [foodSafetyInfo, selectedDonation]);

  if (!selectedDonation) {
    return <div className="p-4">Loading...</div>;
  }

  const generateOTP = () => {
    const newOtp = Math.floor(1000 + Math.random() * 9000).toString();
    setOtp(newOtp);
  };

  function formatDateTime(dateString: string) {
    const date = new Date(dateString);

    const day = date.getDate();
    const month = date.toLocaleString("en-US", { month: "long" });
    const year = date.getFullYear();

    // Get ordinal suffix for the day (1st, 2nd, 3rd, etc.)
    const getOrdinalSuffix = (day: number) => {
      if (day > 3 && day < 21) return "th"; // 11th to 19th are "th"
      switch (day % 10) {
        case 1:
          return "st";
        case 2:
          return "nd";
        case 3:
          return "rd";
        default:
          return "th";
      }
    };

    const formattedDay = `${day}${getOrdinalSuffix(day)}`;
    const formattedTime = date.toLocaleString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    return `${formattedDay} ${month} ${year} at ${formattedTime}`;
  }

  const handleDictateDetails = async () => {
    const text = `The name of the product you are currently seeing is ${
      selectedDonation.food_name
    }. The details of this product are: Food Type is ${
      selectedDonation.food_type
    }, its pickup time is ${
      selectedDonation.preferred_pickup_time
    }. The storage type of the product is ${
      selectedDonation.storage
    }. The expected serves of this product is ${
      selectedDonation.serves
    }. The product was prepared on ${formatDateTime(
      selectedDonation.preparation_date_time
    )} and its expiry date is ${formatDateTime(
      selectedDonation.expiry_date_time
    )}. The distance of the product from your location is ${
      selectedDonation.distance
    } kilometer away.`;

    try {
      const response = await axios.post(
        "/api/text-to-speech",
        { text },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = response.data;
      const audioSrc = `data:audio/mp3;base64,${data.audioContent}`;
      const audio = new Audio(audioSrc);
      await new Promise<void>((resolve) => {
        audio.onended = () => resolve();
        audio.play();
      });
    } catch (error: any) {
      console.error("Error playing order details:", error.message);
    }
  };

  const onOrderPlaced = async () => {
    if (!delivery_person_name) {
      alert("Please enter the name of the delivery person.");
      return;
    }

    if (!delivery_person_phone_no || delivery_person_phone_no.length !== 10) {
      alert("Please enter a valid 10-digit phone number.");
      return;
    }

    if (!serves || isNaN(Number(serves)) || Number(serves) < 1) {
      alert("Please enter a valid number of serves (at least 1).");
      return;
    }

    if (!otp || otp.length !== 4) {
      alert("OTP must be exactly 4 digits.");
      return;
    }

    if (Number(selectedDonation.serves) < Number(serves)) {
      alert("Requested servering cannot be more than available.");
      return;
    }

    try {
      const uniqueId = uuidv4();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast("Error", {
          description: "User not authenticated",
        });
        return;
      }

      // Retrieve donor id from the food.
      const { data: donorId, error: donorIdError } = await supabase
        .from("donor_form")
        .select("donor_id")
        .eq("id", selectedDonation.id);

      console.log("Donor id retrieved: ", donorId?.[0].donor_id);

      if (donorIdError) {
        console.error("Donor Id Retrieval Fail:", donorIdError);
        throw new Error(`Order insertion failed: ${donorIdError.message}`);
      }

      // First, insert the order
      const { error: orderError } = await supabase.from("orders").insert([
        {
          id: uniqueId,
          donor_form_id: selectedDonation.id,
          ngo_id: user.id,
          serves: Number(serves),
          otp: otp,
          created_at: new Date(),
          delivery_person_name: delivery_person_name,
          delivery_person_phone_no: delivery_person_phone_no,
          delivery_status: "delivering",
          donor_id: donorId?.[0].donor_id,
        },
      ]);

      if (orderError) {
        console.error("Order insertion error:", orderError);
        throw new Error(`Order insertion failed: ${orderError.message}`);
      }

      // Then update the donor_form serves count
      const newServesCount = Number(selectedDonation.serves) - Number(serves);

      console.log("Updating donor_form:", {
        id: selectedDonation.id,
        currentServes: selectedDonation.serves,
        requestedServes: serves,
        newServesCount: newServesCount,
      });

      const { error: updateError } = await supabase
        .from("donor_form")
        .update({ serves: newServesCount })
        .eq("id", selectedDonation.id);

      if (updateError) {
        console.error("Update error:", updateError);
        throw new Error(`Update failed: ${updateError.message}`);
      }

      toast("Success", {
        description: "The order was placed successfully",
      });
      console.log("Order placed successfully!");
      setIsOpen(false);
    } catch (error: any) {
      console.error("Error in onOrderPlaced:", error);
      toast("Fail", {
        description: `Error placing order: ${error.message}`,
      });
    }
  };
  function onServeValueChange(value: any) {
    if (Number(value) > Number(selectedDonation?.serves)) {
      console.log("here1");
      setServes(selectedDonation?.serves as any);
    } else {
      console.log("here2");
      setServes(value);
    }
  }

  // Helper to calculate expiry date from preparation date and shelf life hours
  function getApiExpiryDate() {
    if (!foodSafetyInfo || !selectedDonation?.preparation_date_time)
      return null;
    const prepTime = new Date(selectedDonation.preparation_date_time);
    // Use the storage type sent to the API
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
      storageTypeMap[selectedDonation?.storage ?? ""] ||
      selectedDonation?.storage;
    const shelfLifeHours = foodSafetyInfo.shelf_life?.[apiStorageType];
    if (!shelfLifeHours) return null;
    const expiryDate = new Date(
      prepTime.getTime() + shelfLifeHours * 60 * 60 * 1000
    );
    return expiryDate;
  }

  return (
    <>
      <Navbar />
   <div className="min-h-screen bg-gradient-to-br from-[#F5F3F0] via-[#FDF8F5] to-[#F9F6F3]">
      <div className="container mx-auto px-6 py-12">
        <div className="space-y-8">
          {/* Header Section */}
          <div className="space-y-6">
          
            
            <div className="flex justify-between items-start">
              <h1 className="text-4xl lg:text-5xl font-bold text-[#2D3748] leading-tight">
                {selectedDonation.food_name}
              </h1>
              <Button
                onClick={handleDictateDetails}
                className="bg-[#FF6B35] text-white hover:bg-[#E55A2B] rounded-full p-3 transition-all shadow-lg hover:shadow-xl"
              >
                <Volume2 className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Food Image */}
            <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl overflow-hidden pt-0 h-fit pb-0">
              <div className="relative">
                <img
                  src={selectedDonation.food_image}
                  alt={selectedDonation.food_name}
                  className="w-full object-cover"
                />
                <div className="absolute top-4 right-4 bg-[#FF6B35] text-white px-4 py-2 rounded-full text-sm font-medium">
                  {selectedDonation.food_type}
                </div>
              </div>
            </Card>

            {/* Details Card */}
            <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl">
              <CardContent className="p-8 space-y-6">
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-[#2D3748]">Details</h2>
                  <Separator className="bg-[#E8E5E1]" />
                </div>

                <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center gap-4 p-4 bg-[#F5F3F0]/50 rounded-2xl">
                    <div className="bg-[#FF6B35]/10 p-3 rounded-xl">
                      <MapPin className="w-6 h-6 text-[#FF6B35]" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#2D3748]">Pickup Location</p>
                      <p className="text-[#718096]">
                        {Math.round(selectedDonation.distance * 100) / 100} km away
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-[#F5F3F0]/50 rounded-2xl">
                    <div className="bg-[#FF6B35]/10 p-3 rounded-xl">
                      <Sprout className="w-6 h-6 text-[#FF6B35]" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#2D3748]">Food Type</p>
                      <p className="text-[#718096]">{selectedDonation.food_type}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-[#F5F3F0]/50 rounded-2xl">
                    <div className="bg-[#FF6B35]/10 p-3 rounded-xl">
                      <Clock className="w-6 h-6 text-[#FF6B35]" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#2D3748]">Pickup Time</p>
                      <p className="text-[#718096]">{selectedDonation.preferred_pickup_time}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-[#F5F3F0]/50 rounded-2xl">
                    <div className="bg-[#FF6B35]/10 p-3 rounded-xl">
                      <Clock className="w-6 h-6 text-[#FF6B35]" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#2D3748]">Expiry Date</p>
                      <p className="text-[#718096]">
                        {new Date(selectedDonation.expiry_date_time).toLocaleDateString()}{" "}
                        {new Date(selectedDonation.expiry_date_time).toLocaleTimeString()}
                      </p>
                      <p className="text-sm font-semibold text-red-600">
                        {expiryCountdown}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-[#F5F3F0]/50 rounded-2xl">
                    <div className="bg-[#FF6B35]/10 p-3 rounded-xl">
                      <Sprout className="w-6 h-6 text-[#FF6B35]" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#2D3748]">Serves</p>
                      <p className="text-[#718096]">{selectedDonation.serves} people</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-[#F5F3F0]/50 rounded-2xl">
                    <div className="bg-[#FF6B35]/10 p-3 rounded-xl">
                      <Clock className="w-6 h-6 text-[#FF6B35]" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#2D3748]">Storage Type</p>
                      <p className="text-[#718096]">{selectedDonation.storage}</p>
                    </div>
                  </div>
                </div>

                {/* Food Safety Info Section */}
                                {/* Food Safety Info from API */}
                <div className="col-span-2">
                  <Separator />
                  <h3 className="font-semibold mt-2">Food Safety Info</h3>
                  {loadingSafety ? (
                    <p>Loading food safety info...</p>
                  ) : safetyError ? (
                    <p className="text-red-500">{safetyError}</p>
                  ) : foodSafetyInfo ? (
                    <div className="space-y-1">
                      <p>
                        <strong>Status:</strong> {foodSafetyInfo.safety_status}
                      </p>
                      <p>
                        <strong>Message:</strong>{" "}
                        {foodSafetyInfo.safety_message}
                      </p>
                      <p>
                        <strong>Recommended Storage:</strong>{" "}
                        {foodSafetyInfo.recommended_storage}
                      </p>
                      <p>
                        <strong>Hours before unsafe:</strong>{" "}
                        <span className="text-red-600 font-semibold">
                          {(() => {
                            const apiExpiry = getApiExpiryDate();
                            if (!apiExpiry) return 0;
                            const now = new Date();
                            const diffMs = apiExpiry.getTime() - now.getTime();
                            if (diffMs <= 0) return 0;
                            const diffHrs = Math.floor(
                              diffMs / (1000 * 60 * 60)
                            );
                            return diffHrs;
                          })()}
                        </span>
                      </p>
                      {foodSafetyInfo.safety_guidelines && (
                        <ul className="list-disc ml-5">
                          {foodSafetyInfo.safety_guidelines.map(
                            (g: string, i: number) => (
                              <li key={i}>{g}</li>
                            )
                          )}
                        </ul>
                      )}
                    </div>
                  ) : (
                    <p>No food safety info available.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Request Button */}
          <div className="flex items-center justify-center pt-8">
            {isExpired ? (
              <div className="text-center p-6 bg-red-50 rounded-3xl border border-red-200">
                <p className="text-red-600 font-semibold text-lg">
                  This food has expired and cannot be requested.
                </p>
              </div>
            ) : (
              <Button
                className="bg-[#FF6B35] text-white hover:bg-[#E55A2B] rounded-2xl px-12 py-6 text-lg font-semibold transition-all shadow-xl hover:shadow-2xl transform hover:scale-105"
                onClick={() => {
                  setIsOpen(true);
                  generateOTP();
                }}
              >
                Request Food
              </Button>
            )}
          </div>
        </div>

        {/* Request Dialog */}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="bg-white/95 backdrop-blur-sm border-[#E8E5E1] rounded-3xl shadow-2xl max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-[#2D3748] text-center">
                Request Food
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6 p-2">
              <div className="space-y-3">
                <Label htmlFor="serves" className="text-[#4A5568] font-medium">
                  Number of Serves
                </Label>
                <Input
                  id="serves"
                  max={selectedDonation.serves}
                  min="1"
                  type="number"
                  value={serves}
                  onChange={(e) => onServeValueChange(e.target.value)}
                  placeholder="Enter number of serves"
                  className="bg-white/80 border-[#E8E5E1] rounded-xl focus:border-[#FF6B35] focus:ring-[#FF6B35]"
                />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="delivery_person_name" className="text-[#4A5568] font-medium">
                  Delivery Person Name
                </Label>
                <Input
                  id="delivery_person_name"
                  type="text"
                  value={delivery_person_name}
                  onChange={(e) => setDeliveryPersonName(e.target.value)}
                  placeholder="Enter name of delivery person"
                  className="bg-white/80 border-[#E8E5E1] rounded-xl focus:border-[#FF6B35] focus:ring-[#FF6B35]"
                />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="delivery_person_phone_no" className="text-[#4A5568] font-medium">
                  Delivery Person Phone
                </Label>
                <Input
                  id="delivery_person_phone_no"
                  type="tel"
                  value={delivery_person_phone_no}
                  onChange={(e) => setDeliveryPersonPhoneNo(e.target.value)}
                  placeholder="Enter phone number"
                  className="bg-white/80 border-[#E8E5E1] rounded-xl focus:border-[#FF6B35] focus:ring-[#FF6B35]"
                />
              </div>
              
              <div className="hidden">
                <Input
                  type="text"
                  value={otp}
                  disabled
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex justify-center gap-4 pt-4">
              <DialogClose asChild>
                <Button 
                  variant="outline" 
                  className="border-[#E8E5E1] text-[#4A5568] hover:bg-[#F5F3F0] rounded-xl px-6 py-3"
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button
                onClick={onOrderPlaced}
                className="bg-[#FF6B35] text-white hover:bg-[#E55A2B] rounded-xl px-6 py-3 font-medium transition-all shadow-lg hover:shadow-xl"
              >
                Submit Request
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
    </>
  );
}
