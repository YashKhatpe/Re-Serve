"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { supabase } from "@/lib/supabase";
import { Donation, useDonation } from "@/context/donation-context";
import MapClientWrapper from "@/components/food-map/MapClientWrapper";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
    async function fetchDonations() {
      let latLng = { lat: 0, lng: 0 };
      const { data, error } = await supabase.from("donor_form").select("*");
      if (error) {
        console.error("Error fetching donations:", error);
      } else {
        setDonations(data);
        const updatedDonations: Donation[] = [];
        for (let donation of data) {
          const { data: donorData, error: donorError } = await supabase
            .from("donor")
            .select("address_map_link") // Select all columns from the donor table
            .eq("id", donation.donor_id)
            .single();

          try {
            const apiKey = "AIzaSyBn1CMaRL-FEezXOMgrGE-B6k5mjHezIW4"; // Replace with your actual API key
            let apiUrl = donorData?.address_map_link;

            if (apiUrl) {
              const url = new URL(apiUrl);
              url.searchParams.append("key", apiKey); // Add API key as a query parameter
              apiUrl = url.toString();
            }

            const res = await axios.get(apiUrl, {
              maxRedirects: 0,
              validateStatus: null,
            });

            const longUrl = res.headers.location;
            const regex = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
            const match = longUrl.match(regex);
            if (match) {
              latLng = { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
            }
          } catch (e) {
            console.log(e);
          }

          const updatedDonation: Donation = {
            ...donation,
            location: latLng,
          };
          updatedDonations.push({ ...donation, location: latLng });
        }
        setDonations(updatedDonations);
        console.log(donations);
      }
    }
    fetchDonations();
  }, []);

  const handleCardClick = (donation: Donation) => {
    setSelectedDonation(donation);
    router.push("/products");
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
          await sendTextToGemini(result.transcript);
        } else {
          setError("Error uploading audio to server");
        }
      };
    } catch (err) {
      console.error("Error sending audio:", err);
      setError("Error processing or sending audio");
    }
  };

  const sendTextToGemini = async (text: string) => {
    try {
      const API_URL = process.env.NEXT_GEMINI_API_URL || "";
      const response = await axios.post(API_URL, {
        contents: [
          {
            parts: [
              {
                text:
                  text +
                  ' I have several parameters like food_name, serves (no of people that can eat the food), expiry date, food_type (veg, non-veg, jain). So I want you to return only a JS object in the below format { food_name: "actual_name", food_type: "actual_type", serves: "actual_serve", expiry_date: "actual_date", prep_data: "actual_date" } — if any of the parameters are missing then return null value for it and return the date in date format by calculating from Date.now(). So return only the JSON object for the above sentence and nothing else',
              },
            ],
          },
        ],
      });

      let rawText =
        response?.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

      // Remove markdown code block wrappers
      rawText = rawText.replace(/```json|```/g, "").trim();

      // Try extracting JSON using regex
      const jsonMatch = rawText.match(/\{[\s\S]*?\}/); // Extracts first {...} block
      if (!jsonMatch) throw new Error("No JSON found in Gemini response");

      const parsedObject = JSON.parse(jsonMatch[0]);
      console.log("Parsed Gemini Object:", parsedObject);

      // Show pretty JSON to user (or save to DB)
      setUserQuery(JSON.stringify(parsedObject, null, 2));
    } catch (error: any) {
      console.error("Error in gemini response: ", error.message);
      setError("Failed to process Gemini response.");
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
              <div></div>
              <h1 className="text-3xl font-bold mb-6 text-center">
                Find Food Rescuers
              </h1>
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
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-6 w-6" />
              <Input
                placeholder="Search nearby NGOs..."
                className="pl-12 w-full bg-gray-100 shadow-md border-none rounded-xl py-3"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {donations.map((donation) => (
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
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="map">
            <h1 className="text-3xl font-bold text-center mb-6">
              Food Donation Map
            </h1>
            <p className="text-center text-gray-600 max-w-2xl mx-auto mb-4">
              Interactive map showing locations where food donations are needed.
              Hover over or click on a marker to see details about the food
              available for donation.
            </p>
            <MapClientWrapper donations={donations} />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
