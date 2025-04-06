"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { FOOD_PREFERENCES } from "@/lib/constants";
import { supabase } from "@/lib/supabase";
import { toast} from "sonner"

const donorFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone_no: z.string().min(10, { message: "Phone number must be at least 10 digits." }),
  address_map_link: z.string().url({ message: "Please enter a valid URL for the address." }),
  operational_hours: z.string().min(2, { message: "Please specify operational hours." }).optional(),
  food_preference: z.array(z.string()).min(1, { message: "Please select a food preference." }),
  fssai_license: z.string().min(14, { message: "Invalid FSSAI License Number." }),
  fssai_license_auto_verify: z.boolean().default(false),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

const ngoFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  reg_no: z.string().min(2, { message: "Registration number is required." }),
  address_map_link: z.string().url({ message: "Please enter a valid URL for the address." }),
  operating_hours: z.string().min(2, { message: "Please specify operational hours." }),
  contact_person: z.string().min(2, { message: "Contact person name is required." }),
  charity_license_verification: z.boolean().default(false),
  fcra_reg_no: z.string().min(2, { message: "FCRA registration number is required." }),
  food_preference: z.array(z.string()).min(1, { message: "Please select a food preference." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  confirmPassword: z.string(),
  // terms: z.boolean().refine(val => val === true, { message: "You must agree to the terms and conditions." })
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [activeTab, setActiveTab] = useState(searchParams.get("type") || "donor");

  const donorForm = useForm<z.infer<typeof donorFormSchema>>({
    resolver: zodResolver(donorFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone_no: "",
      address_map_link: "",
      operational_hours: "ab",
      food_preference: [],
      fssai_license_auto_verify: false,
      fssai_license: "",
      // health_and_safety_cert: "",
      password: "",
      confirmPassword: "",
      // terms: false
    }
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
      // terms: false
    }
  });
  
async function onDonorSubmit(data: z.infer<typeof donorFormSchema>) {
  console.log("Submitting Donor Form:", data);
  
  // Validate FSSAI License before proceeding
  try {
    
    const fssaiResponse = await fetch("/api/verifyFssai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ fssai_license: data.fssai_license })
    });
    
    
    const fssaiDetails = await fssaiResponse.json();
    
  if (fssaiDetails.status === '404') {
    return toast("Invalid FSSAI License",{
      description: "The provided FSSAI license is not valid or not active.",
    });
  }

  try {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });
    
    if (authError) throw authError;
    
    if (authData.user) {
      // Insert donor data with verified license
      const { error: donorError } = await supabase.from('donor').insert({
        id: authData.user.id,
        name: data.name,
        fssai_license: data.fssai_license,
        fssai_license_auto_verify: data.fssai_license_auto_verify,
        address_map_link: data.address_map_link,
        phone_no: data.phone_no,
        email: data.email,
        operational_hours: data.operational_hours,
        food_preference: data.food_preference,
        created_at: new Date(),
        average_rating: 0,
        total_ratings: 0
      });

      if (donorError) throw donorError;
      
     toast("Registration successful!",{
        description: "You can now log in to your donor account.",
      });
      
      router.push('/login');
    }
  } catch (error: any) {
    toast("Registration Failed", {
      description: error.message || "Something went wrong. Please try again.",
    });
  }
} 
catch (error) {

 
    return toast("Invalid FSSAI License",{
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
        const { error: ngoError } = await supabase.from('ngo').insert({
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
          created_at: new Date()
        });

        if (ngoError) throw ngoError;

        toast("Registration successful!",{
          description: "You can now log in to your NGO account.",
        });

        router.push('/login');
      }
    } catch (error: any) {
      toast("Registration Failed", {
        description: error.message || "Something went wrong. Please try again.",
      });
    }
  }

  return (

    <div className="min-h-screen bg-secondary/30 flex items-center justify-center">
      <div className="container mx-auto py-8 flex flex-col md:flex-row gap-8 items-center">
        
        {/* Image Section - Fixed */}
        <div className="w-full md:w-1/2 flex justify-center">
          <div className="relative w-full max-w-md rounded-lg overflow-hidden shadow-lg">
            <Image 
              src="https://cdn.usegalileo.ai/sdxl10/3d290948-e8e2-4620-b69f-7e711ee6b381.png" 
              alt="Food Donation" 
              width={600} 
              height={600} 
              className="rounded-lg shadow-lg object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
              <h2 className="text-white text-2xl font-bold">
              Share a Meal, Spread the Love.
              </h2>
            </div>
          </div>
        </div>
        
        {/* Registration Form Section */}
        <div className="w-full md:w-1/2">
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="donor">Donor Registration</TabsTrigger>
              <TabsTrigger value="ngo">NGO Registration</TabsTrigger>
            </TabsList>
  
            {/* Donor Form */}
            <TabsContent value="donor">
              <Card>
                <CardHeader><CardTitle>Register as a Food Donor</CardTitle></CardHeader>
                <CardContent>
                <CardContent>
                    <Form {...donorForm}>
                      <form onSubmit={donorForm.handleSubmit(onDonorSubmit)} className="space-y-4">
                        <FormField
                          control={donorForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter your name or organization name" {...field} />
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
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input type="email" placeholder="Enter your email" {...field} />
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
                                <FormLabel>Phone Number</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter your phone number" {...field} />
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
                              <FormLabel>FSSAI License Number</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter FSSAI Registration Number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={donorForm.control}
                          name="address_map_link"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Address Map Link</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter Google Maps link to your location" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        {/* <FormField
                          control={donorForm.control}
                          name="operational_hours"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Operational Hours</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., Mon-Fri: 9AM-5PM" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        /> */}
                        
                        <FormField
                          control={donorForm.control}
                          name="food_preference"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Food Preference</FormLabel>
                              <FormControl>
                                <div className="flex flex-wrap gap-2">
                                  {FOOD_PREFERENCES.map((preference) => (
                                    <div key={preference.value} className="flex items-center space-x-2">
                                      <Checkbox
                                        id={preference.value}
                                        checked={field.value?.includes(preference.value)}
                                        onCheckedChange={(checked) => {
                                            field.onChange(
                                            checked
                                              ? [...(Array.isArray(field.value) ? field.value : []), preference.value]
                                              : (Array.isArray(field.value) ? field.value : []).filter((val) => val !== preference.value)
                                            );
                                        }}
                                      />
                                      <label htmlFor={preference.value} className="text-sm">
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
                          control={donorForm.control}
                          name="fssai_license_auto_verify"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <Checkbox 
                                  checked={field.value} 
                                  onCheckedChange={field.onChange} 
                                />
                              </FormControl>
                              <FormLabel className="cursor-pointer">
                                FSSAI Verification
                              </FormLabel>
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
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                  <Input type="password" placeholder="Create a password" {...field} />
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
                                <FormLabel>Confirm Password</FormLabel>
                                <FormControl>
                                  <Input type="password" placeholder="Confirm your password" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        
                        <Button type="submit" className="w-full bg-[#019863] text-white hover:bg-[#017a52]">
                          Register as Donor
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                {/* </Card> */}
                </CardContent>
              </Card>
            </TabsContent>
  
            {/* NGO Form */}
            <TabsContent value="ngo">
              <Card>
                <CardHeader><CardTitle>Register as an NGO</CardTitle></CardHeader>
                <CardContent>
                <Form {...ngoForm}>
                      <form onSubmit={ngoForm.handleSubmit(onNgoSubmit)} className="space-y-4">
                        <FormField
                          control={ngoForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>NGO Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter your NGO name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={ngoForm.control}
                            name="reg_no"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Registration Number</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter NGO registration number" {...field} />
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
                                <FormLabel>FCRA Registration Number</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter FCRA registration number" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={ngoForm.control}
                          name="address_map_link"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Address Map Link</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter Google Maps link to your location" {...field} />
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
                              <FormLabel>Operating Hours</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., Mon-Fri: 9AM-5PM" {...field} />
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
                              <FormLabel>Contact Person</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter name of primary contact person" {...field} />
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
                              <FormLabel>Food Preference</FormLabel>
                              <FormControl>
                                <div className="flex flex-wrap gap-2">
                                  {FOOD_PREFERENCES.map((preference) => (
                                    <div key={preference.value} className="flex items-center space-x-2">
                                      <Checkbox
                                        id={preference.value}
                                        checked={field.value?.includes(preference.value)}
                                        onCheckedChange={(checked) => {
                                            field.onChange(
                                            checked
                                              ? [...(Array.isArray(field.value) ? field.value : []), preference.value]
                                              : (Array.isArray(field.value) ? field.value : []).filter((val) => val !== preference.value)
                                            );
                                        }}
                                      />
                                      <label htmlFor={preference.value} className="text-sm">
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
                            control={ngoForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input type="email" placeholder="Enter your email" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={ngoForm.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                  <Input type="password" placeholder="Create a password" {...field} />
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
                                <FormLabel>Confirm Password</FormLabel>
                                <FormControl>
                                  <Input type="password" placeholder="Confirm your password" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        
                        <Button type="submit" className="w-full bg-[#019863] text-white hover:bg-[#017a52]">
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
  );
  
}