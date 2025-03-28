"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { supabase } from "@/lib/supabase";
import { Donation, useDonation } from "@/context/donation-context";
import MapClientWrapper from "@/components/food-map/MapClientWrapper";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import axios from "axios";

export default function FoodListingPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [userType, setUserType] = useState<"donor" | "ngo" | null>(null);
  const [donations, setDonations] = useState<Donation[] | []>([]);
  const router = useRouter();
  const { setSelectedDonation } = useDonation();
  
  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        setUserType(null);
        return;
      }
      setUserId(user.id);
      const { data: donorData } = await supabase.from("donor").select("id").eq("id", user.id).single();
      setUserType(donorData ? "donor" : "ngo");
    }
    checkAuth();
  }, [router]);
  
  useEffect(() => {
    async function fetchDonations() {
      let latLng = { lat: 0, lng: 0 };
      const { data, error } = await supabase.from('donor_form').select('*');
      if (error) {
        console.error("Error fetching donations:", error);
      } else {
        setDonations(data);
        const updatedDonations: Donation[] = [];
        for( let donation of data){

          const { data: donorData, error: donorError } = await supabase
          .from('donor')
          .select('address_map_link') // Select all columns from the donor table
          .eq('id', donation.donor_id)
          .single();

          try{
            const apiKey = "AIzaSyBn1CMaRL-FEezXOMgrGE-B6k5mjHezIW4"; // Replace with your actual API key
            let apiUrl = donorData?.address_map_link;

            if (apiUrl) {
                const url = new URL(apiUrl);
                url.searchParams.append("key", apiKey); // Add API key as a query parameter
                apiUrl = url.toString();
            }

            const res = await axios.get(apiUrl, { maxRedirects: 0, validateStatus: null });
          
            const longUrl = res.headers.location;
            const regex = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
            const match = longUrl.match(regex);
            if (match) {
              latLng = { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
            }
          }catch(e){
            console.log(e)
          }
          

          
          const updatedDonation: Donation = {
            ...donation,
            location: latLng,
          };
          updatedDonations.push({...donation,location: latLng});
        }
        setDonations(updatedDonations);
        console.log(donations)
      }
      

    }
    fetchDonations();
  }, []);

  const handleCardClick = (donation: Donation) => {
    setSelectedDonation(donation);
    router.push("/products");
  };
  
  return (
    <>
      <Navbar />
      <div className="flex flex-col min-h-screen bg-white p-6">
        <Tabs defaultValue="list">
          <TabsList className="flex justify-center space-x-4 mb-6">
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="map">Map View</TabsTrigger>
          </TabsList>
          
          <TabsContent value="list">
            <h1 className="text-3xl font-bold mb-6 text-center">Find Food Rescuers</h1>
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-6 w-6" />
              <Input placeholder="Search nearby NGOs..." className="pl-12 w-full bg-gray-100 shadow-md border-none rounded-xl py-3" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {donations.map((donation) => (
                <div key={donation.id} className="bg-white shadow-lg rounded-xl overflow-hidden transform transition hover:scale-105 cursor-pointer" onClick={() => handleCardClick(donation)}>
                  <div className="w-full h-48 relative">
                    <Image src={donation.food_image} alt={donation.food_name} fill className="object-cover" />
                  </div>
                  <div className="p-5">
                    <h2 className="text-xl font-bold text-gray-900">{donation.food_name}</h2>
                    <p className="text-emerald-600">{donation.food_type}</p>
                    <p className="text-gray-600">Expires in {new Date(donation.expiry_date_time).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="map">
            <h1 className="text-3xl font-bold text-center mb-6">Food Donation Map</h1>
            <p className="text-center text-gray-600 max-w-2xl mx-auto mb-4">
              Interactive map showing locations where food donations are needed. Hover over or click on a marker to see details about the food available for donation.
            </p>
            <MapClientWrapper donations={donations} />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
