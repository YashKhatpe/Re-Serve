"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mic, Volume2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { FOOD_PREFERENCES, STORAGE_OPTIONS } from "@/lib/constants";
import { ArrowLeft, ImageIcon } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

import { toast } from "sonner";

const donationFormSchema = z.object({
  food_name: z
    .string()
    .min(2, { message: "Food name must be at least 2 characters." }),
  food_image: z.instanceof(File, { message: "Please upload a image file." }),
  preparation_date_time: z
    .string()
    .min(1, { message: "Preparation date and time is required." }),
  expiry_date_time: z
    .string()
    .min(1, { message: "Expiry date and time is required." }),
  food_type: z.string().min(1, { message: "Please select a food type." }),
  serves: z.coerce
    .number()
    .min(1, { message: "Number of servings must be at least 1." }),
  storage: z.string().min(1, { message: "Please select a storage type." }),
  preferred_pickup_time: z
    .string()
    .min(1, { message: "Preferred pickup time is required." }),
  // additional_notes: z.string().optional(),
});

export default function DonatePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    async function checkAuth() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUserId(user.id);
    }

    checkAuth();
  }, [router]);

  const form = useForm<z.infer<typeof donationFormSchema>>({
    resolver: zodResolver(donationFormSchema),
    defaultValues: {
      food_name: "",
      preparation_date_time: "",
      expiry_date_time: "",
      food_type: "",
      serves: 1,
      storage: "",
      preferred_pickup_time: "",
      // additional_notes: "",
    },
  });

  async function onSubmit(data: z.infer<typeof donationFormSchema>) {
    console.log(data);
    if (!userId) {
      toast("Auth Error", {
        description: "You must be logged in to donate food.",
      });
      return;
    }

    try {
      setIsLoading(true);
      let foodImageUrl = null;

      // Upload image to Supabase Storage if a file is selected

      const file = data.food_image;
      const fileExt = file.name.split(".").pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("food_image")
        .upload(fileName, file, { cacheControl: "3600", upsert: false });

      if (uploadError) throw uploadError;

      // Get the public URL for the uploaded file
      const { data: publicUrlData } = supabase.storage
        .from("food_image")
        .getPublicUrl(fileName);

      if (publicUrlData) {
        foodImageUrl = publicUrlData.publicUrl;
      }

      const uniqueId = uuidv4();
      const { error } = await supabase.from("donor_form").insert({
        id: uniqueId,
        food_name: data.food_name,
        food_image: foodImageUrl,
        preparation_date_time: new Date(
          data.preparation_date_time
        ).toISOString(),
        expiry_date_time: new Date(data.expiry_date_time).toISOString(),
        food_type: data.food_type,
        serves: data.serves,
        storage: data.storage,
        preferred_pickup_time: data.preferred_pickup_time,
        donor_id: userId,
        // additional_notes: data.additional_notes || null,
        created_at: new Date().toISOString(),
      });

      if (error) throw error;

      toast("Donation Created", {
        description: "Your food donation has been listed successfully.",
      });

      router.push("/dashboard");
    } catch (error: any) {
      toast("Error Creating Donation", {
        description:
          error.message || "Could not create your donation. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      <div className="container mx-auto py-8">
        <Button
          variant="ghost"
          className="flex items-center text-primary"
          onClick={() => router.push("/dashboard")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>

        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Donate Food</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="food_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Food Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Provide a descriptive name for the food you're donating"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                      {/* <Volume2 size={20} /> */}
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="food_image"
                  render={({ field: { onChange } }) => (
                    <FormItem>
                      <FormLabel>Food Image</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => onChange(e.target.files?.[0])}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="preparation_date_time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preparation Date & Time</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="expiry_date_time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expiry Date & Time</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="food_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Food Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select food type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {FOOD_PREFERENCES.map((preference) => (
                              <SelectItem
                                key={preference.value}
                                value={preference.value}
                              >
                                {preference.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="storage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Storage Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select storage type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {STORAGE_OPTIONS.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="serves"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Servings</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" {...field} />
                        </FormControl>
                        <FormDescription>
                          Approximate number of people this food can serve
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="preferred_pickup_time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Pickup Time</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Today 5-7 PM" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating Donation..." : "Create Donation"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
