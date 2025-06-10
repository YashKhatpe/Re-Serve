"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { FOOD_PREFERENCES } from "@/lib/constants";
import BackButton from "@/components/BackButton";
import Link from "next/link";

const donorFormSchema = z
  .object({
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    email: z.string().email({ message: "Please enter a valid email address." }),
    phone_no: z
      .string()
      .min(10, { message: "Phone number must be at least 10 digits." }),
    address_map_link: z
      .string()
      .url({ message: "Please enter a valid URL for the address." }),
    food_preference: z
      .array(z.string())
      .min(1, { message: "Please select a food preference." }),
    fssai_license: z
      .string()
      .min(14, { message: "Invalid FSSAI License Number." }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters." }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const ngoFormSchema = z
  .object({
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    reg_no: z.string().min(2, { message: "Registration number is required." }),
    address_map_link: z
      .string()
      .url({ message: "Please enter a valid URL for the address." }),
    operating_hours: z
      .string()
      .min(2, { message: "Please specify operational hours." }),
    contact_person: z
      .string()
      .min(2, { message: "Contact person name is required." }),
    charity_license_verification: z.boolean().default(false),
    fcra_reg_no: z
      .string()
      .min(2, { message: "FCRA registration number is required." }),
    food_preference: z
      .array(z.string())
      .min(1, { message: "Please select a food preference." }),
    email: z.string().email({ message: "Please enter a valid email address." }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters." }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function RegisterPage() {
  const [activeTab, setActiveTab] = useState("donor");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const type = searchParams.get("tab") || "donor";
    console.log("Type is: ", type, activeTab);
    setActiveTab(type);
  }, [searchParams]);

  const donorForm = useForm<z.infer<typeof donorFormSchema>>({
    resolver: zodResolver(donorFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone_no: "",
      address_map_link: "",
      food_preference: [],
      fssai_license: "",
      password: "",
      confirmPassword: "",
    },
  });

  const ngoForm = useForm<z.infer<typeof ngoFormSchema>>({
    resolver: zodResolver(ngoFormSchema),
    defaultValues: {
      name: "",
      reg_no: "",
      address_map_link: "",
      operating_hours: "",
      contact_person: "",
      charity_license_verification: false,
      fcra_reg_no: "",
      food_preference: [],
      email: "",
      password: "",
      confirmPassword: "",
    },
  });
  async function onDonorSubmit(data: z.infer<typeof donorFormSchema>) {
    console.log("Submitting Donor Form:", data);

    // Validate FSSAI License before proceeding
    try {
      const fssaiResponse = await fetch("/api/verifyFssai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fssai_license: data.fssai_license }),
      });

      const fssaiDetails = await fssaiResponse.json();

      if (fssaiDetails.status === "404") {
        return toast("Invalid FSSAI License", {
          description: "The provided FSSAI license is not valid or not active.",
        });
      }

      try {
        // Create auth user
        const { data: authData, error: authError } = await supabase.auth.signUp(
          {
            email: data.email,
            password: data.password,
          }
        );

        if (authError) throw authError;

        if (authData.user) {
          // Insert donor data with verified license - automatically set fssai_license_auto_verify to true
          const { error: donorError } = await supabase.from("donor").insert({
            id: authData.user.id,
            name: data.name,
            fssai_license: data.fssai_license,
            fssai_license_auto_verify: true, // Always set to true when license is valid
            address_map_link: data.address_map_link,
            phone_no: data.phone_no,
            email: data.email,
            food_preference: data.food_preference,
            created_at: new Date(),
            average_rating: 0,
            total_ratings: 0,
          });

          if (donorError) throw donorError;

          toast("Registration successful!", {
            description: "You can now log in to your donor account.",
          });

          router.push("/login");
        }
      } catch (error: any) {
        toast("Registration Failed", {
          description:
            error.message || "Something went wrong. Please try again.",
        });
      }
    } catch (error) {
      return toast("Invalid FSSAI License", {
        description: "The provided FSSAI license is not valid or not active.",
      });
    }
  }

  async function onNgoSubmit(data: z.infer<typeof ngoFormSchema>) {
    console.log(data);
    try {
      // First create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (authError) throw authError;

      if (authData.user) {
        // Then insert NGO data
        const { error: ngoError } = await supabase.from("ngo").insert({
          id: authData.user.id,
          name: data.name,
          reg_no: data.reg_no,
          address_map_link: data.address_map_link,
          operating_hours: data.operating_hours,
          contact_person: data.contact_person,
          charity_license_verification: data.charity_license_verification,
          fcra_reg_no: data.fcra_reg_no,
          food_preference: data.food_preference,
          verified: false,
          created_at: new Date(),
        });

        if (ngoError) throw ngoError;

        toast("Registration successful!", {
          description: "You can now log in to your NGO account.",
        });

        router.push("/login");
      }
    } catch (error: any) {
      toast("Registration Failed", {
        description: error.message || "Something went wrong. Please try again.",
      });
    }
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted manually");
    const formData = donorForm.getValues();
    console.log("Form data:", formData);
    onDonorSubmit(formData);
  };

  return (
    <div className="min-h-screen max-h-screen bg-gradient-to-br from-[#F5F3F0] via-[#FDF8F5] to-[#F9F6F3] overflow-hidden flex items-center justify-center">
      <div className="container mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-12 items-center justify-center min-h-[70vh]">
          {/* Left Side - Hero Content */}
          <div className="hidden lg:block w-full lg:w-1/2 space-y-6 ">
            <div className="space-y-2">
              <h1 className="text-4xl lg:text-5xl font-bold text-[#2D3748] leading-tight">
                Small Changes That{" "}
                <span className="text-[#FF6B35]">Change The Future</span>
              </h1>
              <p className="text-lg text-[#718096] leading-relaxed max-w-lg">
                Connect restaurants with surplus food to NGOs and make every
                meal matter. Reduce food waste while serving those in need with
                our secure, verified platform.
              </p>
              <div className="mt-4 text-sm text-gray-600 ">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-[#FF6B35] font-semibold hover:underline px-2"
                >
                  <button className="w-24 h-8 bg-[#FF6B35] text-white hover:bg-[#E55A2B] rounded-xl  font-medium text-base shadow-lg hover:shadow-xl transition-all">
                    Login
                  </button>
                </Link>
              </div>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 ">
              <div className="text-center">
                <div className="text-3xl font-bold text-[#FF6B35]">500+</div>
                <div className="text-sm text-[#718096]">Meals Served</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#FF6B35]">50+</div>
                <div className="text-sm text-[#718096]">Partner NGOs</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#FF6B35]">25+</div>
                <div className="text-sm text-[#718096]">Restaurants</div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="relative hidden lg:block">
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-[#FED7D7] rounded-full opacity-60"></div>
              <div className="absolute top-8 -right-8 w-8 h-8 bg-[#C6F6D5] rounded-full opacity-80"></div>
              <div className="absolute -top-8 right-4 w-12 h-12 bg-[#FEFCBF] rounded-full opacity-70"></div>
            </div>
          </div>

          {/* Right Side - Registration Form */}
          <div className="w-full lg:w-1/2 max-w-md mx-auto">
            <BackButton />
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 bg-white/80 backdrop-blur-sm border border-[#E8E5E1] rounded-2xl">
                <TabsTrigger
                  value="donor"
                  className="rounded-xl data-[state=active]:bg-[#FF6B35] data-[state=active]:text-white data-[state=active]:shadow-sm transition-all"
                >
                  Donor Registration
                </TabsTrigger>
                <TabsTrigger
                  value="ngo"
                  className="rounded-xl data-[state=active]:bg-[#FF6B35] data-[state=active]:text-white data-[state=active]:shadow-sm transition-all"
                >
                  NGO Registration
                </TabsTrigger>
              </TabsList>

              {/* Donor Form */}
              <TabsContent value="donor">
                <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl max-h-[80vh] flex flex-col">
                  <CardHeader className="">
                    <CardTitle className="text-2xl font-bold text-[#2D3748] text-center">
                      Register as a Donor
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 overflow-y-auto">
                    <Form {...donorForm}>
                      <form
                        onSubmit={donorForm.handleSubmit(onDonorSubmit)}
                        className="space-y-4"
                      >
                        <FormField
                          control={donorForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[#4A5568] font-medium">
                                Name
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter your name or organization name"
                                  {...field}
                                  className="rounded-xl border-[#E8E5E1] bg-white/70 focus:border-[#FF6B35] focus:ring-[#FF6B35] transition-colors"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={donorForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-[#4A5568] font-medium">
                                  Email
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="email"
                                    placeholder="Enter your email"
                                    {...field}
                                    className="rounded-xl border-[#E8E5E1] bg-white/70 focus:border-[#FF6B35] focus:ring-[#FF6B35] transition-colors"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={donorForm.control}
                            name="phone_no"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-[#4A5568] font-medium">
                                  Phone Number
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Enter your phone number"
                                    {...field}
                                    className="rounded-xl border-[#E8E5E1] bg-white/70 focus:border-[#FF6B35] focus:ring-[#FF6B35] transition-colors"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={donorForm.control}
                          name="fssai_license"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[#4A5568] font-medium">
                                FSSAI License Number
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="e.g., 12345678901234"
                                  {...field}
                                  className="rounded-xl border-[#E8E5E1] bg-white/70 focus:border-[#FF6B35] focus:ring-[#FF6B35] transition-colors"
                                />
                              </FormControl>
                              <p className="text-xs text-gray-500 mt-1">
                                Example: 12345678901234 (14-digit number issued
                                by FSSAI)
                              </p>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={donorForm.control}
                          name="address_map_link"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[#4A5568] font-medium">
                                Address Map Link
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter Google Maps link to your location"
                                  {...field}
                                  className="rounded-xl border-[#E8E5E1] bg-white/70 focus:border-[#FF6B35] focus:ring-[#FF6B35] transition-colors"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={donorForm.control}
                          name="food_preference"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[#4A5568] font-medium">
                                Food Preference
                              </FormLabel>
                              <FormControl>
                                <div className="grid grid-cols-3 gap-3">
                                  {FOOD_PREFERENCES.map((preference) => (
                                    <div
                                      key={preference.value}
                                      className="flex items-center space-x-2 p-3 rounded-xl bg-white/50 border border-[#E8E5E1] hover:bg-white/80 transition-colors"
                                    >
                                      <Checkbox
                                        id={preference.value}
                                        checked={field.value?.includes(
                                          preference.value
                                        )}
                                        onCheckedChange={(checked) => {
                                          field.onChange(
                                            checked
                                              ? [
                                                  ...(Array.isArray(field.value)
                                                    ? field.value
                                                    : []),
                                                  preference.value,
                                                ]
                                              : (Array.isArray(field.value)
                                                  ? field.value
                                                  : []
                                                ).filter(
                                                  (val) =>
                                                    val !== preference.value
                                                )
                                          );
                                        }}
                                        className="data-[state=checked]:bg-[#FF6B35] data-[state=checked]:border-[#FF6B35]"
                                      />
                                      <label
                                        htmlFor={preference.value}
                                        className="text-sm text-[#4A5568] cursor-pointer"
                                      >
                                        {preference.label}
                                      </label>
                                    </div>
                                  ))}
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={donorForm.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-[#4A5568] font-medium">
                                  Password
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="password"
                                    placeholder="Create a password"
                                    {...field}
                                    className="rounded-xl border-[#E8E5E1] bg-white/70 focus:border-[#FF6B35] focus:ring-[#FF6B35] transition-colors"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={donorForm.control}
                            name="confirmPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-[#4A5568] font-medium">
                                  Confirm Password
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="password"
                                    placeholder="Confirm your password"
                                    {...field}
                                    className="rounded-xl border-[#E8E5E1] bg-white/70 focus:border-[#FF6B35] focus:ring-[#FF6B35] transition-colors"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <Button
                          type="submit"
                          className="w-full bg-[#FF6B35] text-white hover:bg-[#E55A2B] rounded-xl py-3 font-medium text-base shadow-lg hover:shadow-xl transition-all"
                        >
                          Register as Donor
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* NGO Form */}
              <TabsContent value="ngo">
                <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl max-h-[80vh] flex flex-col">
                  <CardHeader className="">
                    <CardTitle className="text-2xl font-bold text-[#2D3748] text-center">
                      Register as an NGO
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 overflow-y-auto">
                    <Form {...ngoForm}>
                      <form
                        onSubmit={ngoForm.handleSubmit(onNgoSubmit)}
                        className="space-y-4"
                      >
                        <FormField
                          control={ngoForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[#4A5568] font-medium">
                                NGO Name
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter your NGO name"
                                  {...field}
                                  className="rounded-xl border-[#E8E5E1] bg-white/70 focus:border-[#FF6B35] focus:ring-[#FF6B35] transition-colors"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={ngoForm.control}
                          name="reg_no"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[#4A5568] font-medium">
                                Registration Number
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter NGO registration number"
                                  {...field}
                                  className="rounded-xl border-[#E8E5E1] bg-white/70 focus:border-[#FF6B35] focus:ring-[#FF6B35] transition-colors"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={ngoForm.control}
                          name="fcra_reg_no"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[#4A5568] font-medium">
                                FCRA Registration Number
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="e.g., 23165012345678"
                                  {...field}
                                  className="rounded-xl border-[#E8E5E1] bg-white/70 focus:border-[#FF6B35] focus:ring-[#FF6B35] transition-colors"
                                />
                              </FormControl>
                              <p className="text-xs text-gray-500 mt-1">
                                Example: 23165012345678 (As issued by the
                                Ministry of Home Affairs)
                              </p>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={ngoForm.control}
                          name="address_map_link"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[#4A5568] font-medium">
                                Address Map Link
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter Google Maps link to your location"
                                  {...field}
                                  className="rounded-xl border-[#E8E5E1] bg-white/70 focus:border-[#FF6B35] focus:ring-[#FF6B35] transition-colors"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={ngoForm.control}
                          name="operating_hours"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[#4A5568] font-medium">
                                Operating Hours
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="e.g., Mon-Fri: 9AM-5PM"
                                  {...field}
                                  className="rounded-xl border-[#E8E5E1] bg-white/70 focus:border-[#FF6B35] focus:ring-[#FF6B35] transition-colors"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={ngoForm.control}
                          name="contact_person"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[#4A5568] font-medium">
                                Contact Person
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter name of primary contact person"
                                  {...field}
                                  className="rounded-xl border-[#E8E5E1] bg-white/70 focus:border-[#FF6B35] focus:ring-[#FF6B35] transition-colors"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={ngoForm.control}
                          name="food_preference"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[#4A5568] font-medium">
                                Food Preference
                              </FormLabel>
                              <FormControl>
                                <div className="grid grid-cols-3 gap-3">
                                  {FOOD_PREFERENCES.map((preference) => (
                                    <div
                                      key={preference.value}
                                      className="flex items-center space-x-2 p-3 rounded-xl bg-white/50 border border-[#E8E5E1] hover:bg-white/80 transition-colors"
                                    >
                                      <Checkbox
                                        id={preference.value}
                                        checked={field.value?.includes(
                                          preference.value
                                        )}
                                        onCheckedChange={(checked) => {
                                          field.onChange(
                                            checked
                                              ? [
                                                  ...(Array.isArray(field.value)
                                                    ? field.value
                                                    : []),
                                                  preference.value,
                                                ]
                                              : (Array.isArray(field.value)
                                                  ? field.value
                                                  : []
                                                ).filter(
                                                  (val) =>
                                                    val !== preference.value
                                                )
                                          );
                                        }}
                                        className="data-[state=checked]:bg-[#FF6B35] data-[state=checked]:border-[#FF6B35]"
                                      />
                                      <label
                                        htmlFor={preference.value}
                                        className="text-sm text-[#4A5568] cursor-pointer"
                                      >
                                        {preference.label}
                                      </label>
                                    </div>
                                  ))}
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={ngoForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[#4A5568] font-medium">
                                Email
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="email"
                                  placeholder="Enter your email"
                                  {...field}
                                  className="rounded-xl border-[#E8E5E1] bg-white/70 focus:border-[#FF6B35] focus:ring-[#FF6B35] transition-colors"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={ngoForm.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-[#4A5568] font-medium">
                                  Password
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="password"
                                    placeholder="Create a password"
                                    {...field}
                                    className="rounded-xl border-[#E8E5E1] bg-white/70 focus:border-[#FF6B35] focus:ring-[#FF6B35] transition-colors"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={ngoForm.control}
                            name="confirmPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-[#4A5568] font-medium">
                                  Confirm Password
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="password"
                                    placeholder="Confirm your password"
                                    {...field}
                                    className="rounded-xl border-[#E8E5E1] bg-white/70 focus:border-[#FF6B35] focus:ring-[#FF6B35] transition-colors"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <Button
                          type="submit"
                          className="w-full bg-[#FF6B35] text-white hover:bg-[#E55A2B] rounded-xl py-3 font-medium text-base shadow-lg hover:shadow-xl transition-all"
                        >
                          Register as NGO
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
