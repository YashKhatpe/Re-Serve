import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { useAuth } from "@/context/auth-context";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import axios from "axios";

interface DonationFormProps {
  formData: {
    foodName: string;
    foodImage: File | null;
    preparationDate: string;
    // expiryDate: string;
    foodType: string;
    storageType: string;
    servings: string;
    pickupTime: string;
  };
  updateFormField: (field: string, value: string) => void;
  updateImageField: (field: string, file: File | null) => void;
}

const DonationForm: React.FC<DonationFormProps> = ({
  formData,
  updateFormField,
  updateImageField,
}) => {
  const router = useRouter();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    if (!user?.id) {
      toast("Auth Error", {
        description: "You must be logged in to donate food.",
      });
      return;
    }

    try {
      let foodImageUrl = null;
      console.log("In try block");
      // Upload image to Supabase Storage if a file is selected
      if (!formData) {
        toast("No details found", {
          description: "Please fill all the details correctly",
        });
        return;
      }
      const file = formData.foodImage;
      console.log("food img: ", file);
      if (!file) {
        toast("No image selected", {
          description: "Please select a food image before submitting.",
        });
        return;
      }
      const fileExt = file.name.split(".").pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      console.log("waiting");
      const { error: uploadError } = await supabase.storage
        .from("food_image")
        .upload(fileName, file, { cacheControl: "3600", upsert: false });

      console.log("waiting over");
      if (uploadError) throw uploadError;
      console.log("File Name: ", fileName);
      // Get the public URL for the uploaded file
      const { data: publicUrlData } = supabase.storage
        .from("food_image")
        .getPublicUrl(fileName);

      if (publicUrlData) {
        foodImageUrl = publicUrlData.publicUrl;
        console.log("File Url: ", foodImageUrl);
      }

      console.log("Calling Api...");
      // 1. Call Food Safety API
      // Calculate hours since prepared
      let hoursSincePrepared = 0;
      if (formData.preparationDate) {
        const prepDate = new Date(formData.preparationDate);
        const now = new Date();
        hoursSincePrepared = Math.floor(
          (now.getTime() - prepDate.getTime()) / (1000 * 60 * 60)
        );
      }
      let foodSafetyInfo = null;
      try {
        // Debug: log value and type
        console.log(
          "food_name value:",
          formData.foodName,
          typeof formData.foodName
        );
        // Try both snake_case and camelCase for debugging
        const apiPayload = {
          // food_name: formData.foodName,
          foodName: formData.foodName,
          storage_type: formData.storageType,
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
        // Type guard for AxiosError
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
      console.log(
        "After Food Safety API call, foodSafetyInfo:",
        foodSafetyInfo
      );

      // 2. Insert into Supabase with food_safety_info
      const uniqueId = uuidv4();
      const insertPayload = {
        id: uniqueId,
        food_name: formData.foodName,
        food_image: foodImageUrl,
        preparation_date_time: new Date(formData.preparationDate).toISOString(),
        // expiry_date_time: new Date(formData.expiryDate).toISOString(),
        food_type: formData.foodType,
        serves: Number(formData.servings), // Ensure this is a number
        storage: formData.storageType,
        preferred_pickup_time: formData.pickupTime,
        donor_id: user?.id,
        created_at: new Date().toISOString(),
        food_safety_info: foodSafetyInfo,
      };
      console.log("Supabase insert payload:", insertPayload);
      const { error } = await supabase.from("donor_form").insert(insertPayload);
      if (error) {
        console.error(
          "Supabase insert error:",
          error,
          JSON.stringify(error, null, 2)
        );
        toast("Donation Creation Unsuccessful", {
          description:
            "Failed to donate your food. Please check the form details",
        });
        return;
      }

      toast("Donation Created", {
        description: "Your food donation has been listed successfully.",
      });

      router.push("/dashboard");
    } catch (error: any) {
      toast("Error Creating Donation", {
        description:
          error.message || "Could not create your donation. Please try again.",
      });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    updateImageField("foodImage", file);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gray-800">
          Donate Food
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Food Name */}
          <div className="space-y-2">
            <Label
              htmlFor="foodName"
              className="text-sm font-medium text-gray-700"
            >
              Food Name
            </Label>
            <Input
              id="foodName"
              value={formData.foodName}
              onChange={(e) => updateFormField("foodName", e.target.value)}
              placeholder="Provide a descriptive name for the food you're donating"
              className="w-full"
            />
          </div>

          {/* Food Image */}
          <div className="space-y-2">
            <Label
              htmlFor="foodImage"
              className="text-sm font-medium text-gray-700"
            >
              Food Image
            </Label>
            <Input
              id="foodImage"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full"
            />
            {formData.foodImage && (
              <p className="text-sm text-green-600">
                Image selected: {formData.foodImage.name}
              </p>
            )}
          </div>

          {/* Date Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="preparationDate"
                className="text-sm font-medium text-gray-700"
              >
                Preparation Date & Time
              </Label>
              <Input
                id="preparationDate"
                type="datetime-local"
                value={formData.preparationDate}
                onChange={(e) =>
                  updateFormField("preparationDate", e.target.value)
                }
                className="w-full"
              />
            </div>
            {/* <div className="space-y-2">
              <Label
                htmlFor="expiryDate"
                className="text-sm font-medium text-gray-700"
              >
                Expiry Date & Time
              </Label>
              <Input
                id="expiryDate"
                type="datetime-local"
                value={formData.expiryDate}
                onChange={(e) => updateFormField("expiryDate", e.target.value)}
                className="w-full"
              />
            </div> */}
          </div>

          {/* Type Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="foodType"
                className="text-sm font-medium text-gray-700"
              >
                Food Type
              </Label>
              <select
                id="foodType"
                value={formData.foodType}
                onChange={(e) => updateFormField("foodType", e.target.value)}
                className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Select food type</option>
                <option value="veg">Vegetarian</option>
                <option value="non-veg">Non-Vegetarian</option>
                <option value="jain">Jain</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="storageType"
                className="text-sm font-medium text-gray-700"
              >
                Storage Type
              </Label>
              <select
                id="storageType"
                value={formData.storageType}
                onChange={(e) => updateFormField("storageType", e.target.value)}
                className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Select storage type</option>
                <option value="refrigerated">Refrigerated</option>
                <option value="frozen">Frozen</option>
                <option value="room_temp">Room Temperature</option>
              </select>
            </div>
          </div>

          {/* Servings and Pickup Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="servings"
                className="text-sm font-medium text-gray-700"
              >
                Number of Servings
              </Label>
              <Input
                id="servings"
                type="number"
                value={formData.servings}
                onChange={(e) => updateFormField("servings", e.target.value)}
                placeholder="1"
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                Approximate number of people this food can serve
              </p>
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="pickupTime"
                className="text-sm font-medium text-gray-700"
              >
                Preferred Pickup Time
              </Label>
              <Input
                id="pickupTime"
                value={formData.pickupTime}
                onChange={(e) => updateFormField("pickupTime", e.target.value)}
                placeholder="e.g., Today 5-7 PM"
                className="w-full"
              />
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-gray-800 hover:bg-gray-900 text-white py-3 text-lg font-medium"
          >
            Create Donation
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default DonationForm;
