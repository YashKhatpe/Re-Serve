"use client";
import { SetStateAction, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Filter, MapPin, Search } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { supabase } from "@/lib/supabase";
import { Donation, useDonation } from "@/context/donation-context";
import MapClientWrapper from "@/components/food-map/MapClientWrapper";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { FOOD_PREFERENCES } from "@/lib/constants";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import axios from "axios";
import { Button } from "@/components/ui/button";
import audioBufferToWav from "audiobuffer-to-wav";
import { calculateDistance, extractLocationFromMapUrl } from "@/lib/mapUtils";

export default function FoodListingPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [userType, setUserType] = useState<"donor" | "ngo" | null>(null);
  const [donations, setDonations] = useState<Donation[] | []>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [userQuery, setUserQuery] = useState<string>("");
  const [error, setError] = useState<string | null>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<string>(
    "Search for products using our voice based query. In clear voice describe your query"
  );
  const audioChunksRef = useRef<Blob[]>([]);
  const router = useRouter();
  const { setSelectedDonation } = useDonation();

  const [filteredDonations, setFilteredDonations] = useState<Donation[] | []>(
    []
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [voiceQuery, setVoiceQuery] = useState("");
  const [maxDistance, setMaxDistance] = useState(50); // Default max distance in km
  const [selectedFoodTypes, setSelectedFoodTypes] = useState<string[]>([]);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        setUserType(null);
        return;
      }
      setUserId(user.id);
      const { data: donorData } = await supabase
        .from("donor")
        .select("id")
        .eq("id", user.id)
        .single();
      setUserType(donorData ? "donor" : "ngo");
    }
    checkAuth();
  }, [router]);

  useEffect(() => {
    async function getUserLocation() {
      // If user is an NGO, try to get location from their address_map_link
      if (userType === "ngo" && userId) {
        try {
          const { data: ngoData, error: ngoError } = await supabase
            .from("ngo")
            .select("address_map_link")
            .eq("id", userId)
            .single();

          if (ngoError) {
            console.error("Error fetching NGO data:", ngoError.details);
          } else if (ngoData && ngoData.address_map_link) {
            // Extract coordinates from the map URL
            const locationResult = extractLocationFromMapUrl(
              ngoData.address_map_link
            );
            if (locationResult.location) {
              console.log(
                "Using NGO location from address_map_link:",
                locationResult.location
              );
              setUserLocation(locationResult.location);
              return; // Exit early as we've set the location
            }
          }
        } catch (error) {
          console.error("Error processing NGO location:", error);
        }
      }
    }

    getUserLocation();
  }, [userId, userType]);

  useEffect(() => {
    async function fetchDonations() {
      let latLng = { lat: 0, lng: 0 };
      const { data, error } = await supabase.from("donor_form").select("*");
      if (error) {
        console.error("Error fetching donations:", error);
      } else {
        const updatedDonations: Donation[] = [];
        for (let donation of data) {
          const { data: donorData, error: donorError } = await supabase
            .from("donor")
            .select("address_map_link")
            .eq("id", donation.donor_id)
            .single();

          if (donorData && donorData.address_map_link) {
            // Extract coordinates from the map URL
            const locationResult = extractLocationFromMapUrl(
              donorData.address_map_link
            );
            if (locationResult.location) {
              latLng = locationResult.location;
            }
          }

          // Calculate distance if user location is available
          let distance = 0;
          if (userLocation && latLng.lat !== 0 && latLng.lng !== 0) {
            distance = calculateDistance(
              userLocation.lat,
              userLocation.lng,
              latLng.lat,
              latLng.lng
            );
          }

          const updatedDonation: Donation = {
            ...donation,
            location: latLng,
            distance: distance,
          };
          updatedDonations.push(updatedDonation);
        }

        // Sort by distance
        updatedDonations.sort((a, b) => a.distance - b.distance);

        // Log unique food types for debugging
        const uniqueFoodTypes = [
          ...new Set(updatedDonations.map((d) => d.food_type)),
        ];
        console.log("Available food types:", uniqueFoodTypes);

        setDonations(updatedDonations);
        setFilteredDonations(updatedDonations);
      }
    }
    fetchDonations();
  }, [userLocation]);

  // Apply filters when any filter criteria changes
  useEffect(() => {
    if (donations.length === 0) return;

    let filtered = [...donations];

    // Apply search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (donation) =>
          donation.food_name.toLowerCase().includes(term) ||
          donation.food_type.toLowerCase().includes(term)
      );
    }

    // Apply food type filter
    if (selectedFoodTypes.length > 0) {
      filtered = filtered.filter((donation) =>
        selectedFoodTypes.includes(donation.food_type)
      );
    }

    // Apply distance filter
    if (userLocation) {
      filtered = filtered.filter(
        (donation) => donation.distance <= maxDistance
      );
    }

    setFilteredDonations(filtered);
    console.log("Filtered donations:", filtered.length);
    console.log("Filter criteria:", {
      searchTerm,
      selectedFoodTypes,
      maxDistance,
    });
  }, [searchTerm, selectedFoodTypes, maxDistance, donations, userLocation]);

  const handleCardClick = (donation: Donation) => {
    setSelectedDonation(donation);
    router.push("/products");
  };
  const toggleFoodType = (type: string) => {
    setSelectedFoodTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleVoiceQuery = async () => {
    setUserQuery("");
    setIsDialogOpen(true);
  };

  const speakText = async (query: string) => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/text-to-speech", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: query }),
      });

      if (!response.ok) {
        throw new Error("Failed to convert text to speech");
      }
      const data = await response.json();
      const audioSrc = `data:audio/mp3;base64,${data.audioContent}`;
      const audio = new Audio(audioSrc);

      audio.onended = () => {
        // Automatically start recording after the question is spoken
        console.log("Recording starting....");
        startRecording();
      };

      audio.play();
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      console.error("Error speaking text:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const SAMPLE_RATE = 16000;
  const startRecording = async (): Promise<void> => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1, // Request mono channel audio
          sampleRate: SAMPLE_RATE,
        },
      });

      const audioContext = new AudioContext({
        sampleRate: SAMPLE_RATE,
      });
      const source = audioContext.createMediaStreamSource(stream);
      const destination = audioContext.createMediaStreamDestination();
      source.connect(destination);

      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" }); // Capture as WebM
      recorder.ondataavailable = (event: BlobEvent) => {
        // Changed from BlobEvent to Blob
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      recorder.onstop = () => {
        console.log("Audio chunks: ", audioChunksRef);
        // setRecordingStatus('Recording stopped. Processing...');
        sendAudioToBackend();
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      setIsRecording(true);
      // Automatically stop recording after 5 seconds
      setTimeout(() => {
        if (
          mediaRecorderRef.current &&
          mediaRecorderRef.current.state === "recording"
        ) {
          stopRecording();
        }
      });
    } catch (error) {
      console.error("Error capturing audio:", error);
    }
  };

  const handleAskQuestion = async () => {
    setUserQuery("");
    speakText(currentQuestion);
  };

  const sendAudioToBackend = async () => {
    if (audioChunksRef.current.length === 0) {
      setError("No audio recorded");
      return;
    }

    try {
      const audioBlob = new Blob(audioChunksRef.current, {
        type: "audio/webm",
      });

      const fileReader = new FileReader();
      fileReader.readAsArrayBuffer(audioBlob);

      fileReader.onloadend = async () => {
        const audioContext = new AudioContext({
          sampleRate: SAMPLE_RATE,
        });
        const audioBuffer = await audioContext.decodeAudioData(
          fileReader.result as ArrayBuffer
        );

        // Mix down to mono if needed
        const channelData = audioBuffer.getChannelData(0);
        const monoBuffer = audioContext.createBuffer(
          1,
          audioBuffer.length,
          audioBuffer.sampleRate
        );
        monoBuffer.copyToChannel(channelData, 0);

        // Resample to 16kHz
        const newAudioBuffer = audioContext.createBuffer(
          1,
          audioBuffer.length,
          SAMPLE_RATE
        );
        const newChannelData = newAudioBuffer.getChannelData(0);
        for (let i = 0; i < audioBuffer.length; i++) {
          newChannelData[i] = channelData[i];
        }

        const wavBuffer = audioBufferToWav(newAudioBuffer);

        const wavBlob = new Blob([wavBuffer], { type: "audio/wav" });

        const formData = new FormData();
        formData.append("audio", wavBlob, "audio.wav");

        // Send to backend
        const response = await fetch("/api/speech-to-text", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          setUserQuery(result.transcript);
          audioChunksRef.current = [];

          //send to gemini
          const filters = await sendTextToGemini(result.transcript);
          const data = await queryDonorForm(filters); // parsed from Gemini
          setFilteredDonations(data);
          console.log("Final Data: ", data);
        } else {
          setError("Error uploading audio to server");
        }
      };
    } catch (err) {
      console.error("Error sending audio:", err);
      setError("Error processing or sending audio");
    }
  };

  async function queryDonorForm(filters: any[]) {
    let query: any = supabase.from("donor_form").select("*");
    console.log("Query", query);
    filters.forEach((filter) => {
      const { field, operator, value } = filter;

      switch (operator) {
        case "=":
          query = query.eq(field, value);
          break;
        case ">":
          query = query.gt(field, value);
          break;
        case ">=":
          query = query.gte(field, value);
          break;
        case "<":
          query = query.lt(field, value);
          break;
        case "<=":
          query = query.lte(field, value);
          break;
        case "!=":
          query = query.neq(field, value);
          break;
        case "like":
          query = query.ilike(field, `%${value}%`);
          break;
        default:
          console.warn(`Unsupported operator: ${operator}`);
      }
    });

    const { data, error } = await query;
    if (error) {
      console.error("Supabase query error:", error.message);
    } else {
      console.log("Query result:", data);
    }

    return data;
  }
  const sendTextToGemini = async (text: string) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_GEMINI_API_URL || "";
      const today = new Date().toLocaleDateString("en-GB"); // Format: "31/05/2025"

      const prompt = `
      Today's date is ${today}. Please use this when processing any date-related queries.
  You are a helpful assistant. A user will provide a voice query related to food donations.
  
  Your ONLY task is to return a list of filters in this EXACT JSON format:
  [
    {
      "field": "field_name",
      "operator": "=", "<=", ">=", "like",
      "value": "actual_value"
    }
  ]
  
  ⚠️ RULES:
  - Use only these fields: food_name, food_type (veg, non-veg), serves, preparation_date_time, expiry_date_time, storage, preferred_pickup_time
  - Dates like "today" or "tomorrow" must be calculated using Date.now() and returned in YYYY-MM-DD format.
  - If a date is mentioned like tomorrow's then food expiring tomorrow or after that must be shown.
  - Return only JSON. No markdown (\`\`\`), no explanation, no prefix text.
  
  Query: ${text}
  `;
      console.log("Api URL: ", API_URL);
      const response = await axios.post(API_URL, {
        contents: [{ parts: [{ text: prompt }] }],
      });

      const aiResponse =
        response.data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      console.log(
        "Gemini full response:",
        JSON.stringify(response.data, null, 2)
      );

      console.log("Gemini raw response:\n", aiResponse);

      // Try to extract JSON between [ ... ]
      let jsonText = "";

      // Try to extract JSON inside backticks first (e.g., ```json\n[...]\n```)
      const codeBlockMatch = aiResponse.match(
        /```(?:json)?\s*([\s\S]*?)\s*```/
      );
      if (codeBlockMatch) {
        jsonText = codeBlockMatch[1];
      } else {
        // Fallback: Try to extract raw JSON using brackets
        const jsonMatch = aiResponse.match(/\[[\s\S]*?\]/);
        if (jsonMatch) {
          jsonText = jsonMatch[0];
        }
      }

      if (!jsonText) {
        throw new Error("JSON array not found in Gemini response.");
      }
      console.log("Final response: ", JSON.parse(jsonText));
      return JSON.parse(jsonText);
    } catch (error: any) {
      console.error("Error in Gemini response:", error.message);
      return [];
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      // Stop all audio tracks
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
    }
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
            <div className="flex justify-between">
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <h1 className="text-3xl font-bold mb-6 text-center">
                  Find Food Rescuers
                </h1>
              </div>

              <Button onClick={handleVoiceQuery}>
                Try our voice based query
              </Button>
            </div>

            <Dialog
              open={isDialogOpen}
              onOpenChange={(open) => {
                if (!open) {
                  stopRecording();
                  setIsDialogOpen(false);
                  // completeVoiceInteraction();
                }
              }}
            >
              <DialogContent className="sm:max-w-[725px]">
                {/* <DialogHeader>
            <DialogTitle>Voice Input Progress</DialogTitle>
            <DialogDescription>
              {currentStatus || "Ready to listen..."}
            </DialogDescription>
          </DialogHeader> */}
                {/* <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-50"> */}
                {/* <div className="w-full max-w-2xl rounded-lg shadow-lg bg-white p-6"> */}
                {/* <div> */}
                <DialogTitle className="text-2xl font-bold mb-6 text-center">
                  Voice Conversation
                </DialogTitle>

                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-2">
                    Current Question:
                  </h2>
                  <div className="p-4 bg-blue-50 rounded-md">
                    {currentQuestion}
                  </div>
                </div>

                {userQuery && (
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold mb-2">Your Answer:</h2>
                    <div className="p-4 bg-green-50 rounded-md">
                      {userQuery}
                    </div>
                  </div>
                )}

                <div className="flex justify-center mt-4">
                  {isRecording ? (
                    <button
                      onClick={stopRecording}
                      className="px-6 py-3 bg-red-600 text-white rounded-md flex items-center"
                    >
                      <span className="mr-2">●</span> Recording... (Click to
                      Stop)
                    </button>
                  ) : (
                    <button
                      onClick={handleAskQuestion}
                      disabled={isLoading}
                      className="px-6 py-3 bg-blue-600 text-white rounded-md disabled:bg-blue-300"
                    >
                      {isLoading ? "Processing..." : "Ask Question"}
                    </button>
                  )}
                </div>

                {error && (
                  <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
                    Error: {error}
                  </div>
                )}
                {/* </div> */}
                {/* </div> */}
                {/* </main> */}
              </DialogContent>
            </Dialog>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-grow">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-6 w-6" />
                <Input
                  placeholder="Search by food name or type..."
                  className="pl-12 w-full bg-gray-100 shadow-md border-none rounded-xl py-3"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Filter size={18} />
                Filters
              </Button>
            </div>
            {/* Filter Panel */}
            {showFilters && (
              <div className="bg-gray-100 p-4 rounded-lg mb-6 shadow-md">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Food Type Filters */}
                  <div>
                    <h3 className="font-semibold mb-2">Food Type</h3>
                    <div className="flex flex-wrap gap-3">
                      {/* Use both FOOD_PREFERENCES and any unique food types from the data */}
                      {[
                        ...FOOD_PREFERENCES,
                        // Add any food types from the data that aren't in FOOD_PREFERENCES
                        ...Array.from(
                          new Set(donations.map((d) => d.food_type))
                        )
                          .filter(
                            (type) =>
                              !FOOD_PREFERENCES.some((p) => p.value === type)
                          )
                          .map((type) => ({
                            value: type,
                            label: type.charAt(0).toUpperCase() + type.slice(1),
                          })),
                      ].map((preference) => (
                        <div
                          key={preference.value}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`filter-${preference.value}`}
                            checked={selectedFoodTypes.includes(
                              preference.value
                            )}
                            onCheckedChange={() =>
                              toggleFoodType(preference.value)
                            }
                          />
                          <label
                            htmlFor={`filter-${preference.value}`}
                            className="text-sm cursor-pointer"
                          >
                            {preference.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Distance Filter */}
                  <div>
                    <h3 className="font-semibold mb-2">
                      Maximum Distance: {maxDistance} km
                    </h3>
                    <Slider
                      value={maxDistance}
                      min={1}
                      max={100}
                      onChange={(e) => setMaxDistance(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Reset Filters Button */}
                <div className="mt-4 flex justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedFoodTypes([]);
                      setMaxDistance(50);
                    }}
                  >
                    Reset Filters
                  </Button>
                </div>
              </div>
            )}

            <p className="text-gray-600 mb-4">
              Showing {filteredDonations.length} of {donations.length} donations
            </p>

            {/* Food Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDonations.length > 0 ? (
                filteredDonations.map((donation) => (
                  <div
                    key={donation.id}
                    className="bg-white shadow-lg rounded-xl overflow-hidden transform transition hover:scale-105 cursor-pointer"
                    onClick={() => handleCardClick(donation)}
                  >
                    <div className="w-full h-48 relative">
                      <Image
                        src={donation.food_image}
                        alt={donation.food_name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-5">
                      <h2 className="text-xl font-bold text-gray-900">
                        {donation.food_name}
                      </h2>
                      <p className="text-emerald-600">{donation.food_type}</p>
                      <p className="text-gray-600">
                        Expires in{" "}
                        {new Date(donation.expiry_date_time).toLocaleString()}
                      </p>
                      {donation.distance > 0 && (
                        <div className="flex items-center mt-2 text-gray-500">
                          <MapPin size={16} className="mr-1" />
                          <span>{donation.distance.toFixed(1)} km away</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-center py-10">
                  <p className="text-gray-500">
                    No donations match your filters. Try adjusting your search
                    criteria.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="map">
            <h1 className="text-3xl font-bold text-center mb-6">
              Food Donation Map
            </h1>
            <p className="text-center text-gray-600 max-w-2xl mx-auto mb-4">
              Hover over or click on a marker to see details about the food
              available for donation.
            </p>
            <MapClientWrapper donations={filteredDonations} />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
