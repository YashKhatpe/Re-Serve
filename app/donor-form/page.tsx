"use client";

import React, { useState, useRef, FormEvent, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useParams } from "next/navigation";

// Define type for form data
interface FoodDonationForm {
  food_name: string;
  food_desc: string;
  preparation_date_time: string;
  expiry_date_time: string;
  food_type: string;
  serves: string;
  storage: string;
  preferred_pickup_time: string;
}

// Define type for voice question
interface VoiceQuestion {
  field: keyof FoodDonationForm;
  question: string;
}

export default function DonorFoodForm() {
  // Form state
  const [formData, setFormData] = useState<FoodDonationForm>({
    food_name: "",
    food_desc: "",
    preparation_date_time: "",
    expiry_date_time: "",
    food_type: "",
    serves: "",
    storage: "",
    preferred_pickup_time: "",
  });

  // Voice interaction state
  const [isVoiceMode, setIsVoiceMode] = useState<boolean>(false);
  const [currentVoiceField, setCurrentVoiceField] = useState<
    keyof FoodDonationForm | null
  >(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [voiceQuestions] = useState<VoiceQuestion[]>([
    {
      field: "food_name",
      question: "What is the name of the food you want to donate?",
    },
    { field: "food_desc", question: "Please describe the food in detail." },
    {
      field: "preparation_date_time",
      question:
        "When was this food prepared? Please provide the date and time.",
    },
    {
      field: "expiry_date_time",
      question: "What is the expiry date and time of this food?",
    },
    {
      field: "food_type",
      question:
        "What type of food is this? Is it vegetarian, non-vegetarian, or vegan?",
    },
    { field: "serves", question: "How many people can this food serve?" },
    {
      field: "storage",
      question: "What are the storage instructions for this food?",
    },
    {
      field: "preferred_pickup_time",
      question: "When would you prefer the food to be picked up?",
    },
  ]);

  // Refs and state for audio recording
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [currentStatus, setCurrentStatus] = useState<string>("");

  const params = useParams();
  const donationId = params.id;

  useEffect(() => {
    if (isDialogOpen && currentVoiceField) {
      const startInteraction = async () => {
        await playQuestionAudio(
          voiceQuestions.find((q) => q.field === currentVoiceField)?.question ||
            ""
        );
        startRecording();
      };
      startInteraction();
    }
  }, [currentVoiceField, isDialogOpen]);

  const startVoiceInteraction = () => {
    setIsDialogOpen(true);
    setCurrentVoiceField(voiceQuestions[0].field);
    setCurrentStatus("Starting voice interaction...");
  };

  // Handle text-to-speech for questions
  const playQuestionAudio = async (question: string): Promise<void> => {
    try {
      const response = await fetch("/api/text-to-speech", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: question }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate speech");
      }

      const data = await response.json();
      const audioSrc = `data:audio/mp3;base64,${data.audioContent}`;
      const audio = new Audio(audioSrc);
      await new Promise<void>((resolve) => {
        audio.onended = () => resolve();
        audio.play();
      });
    } catch (error) {
      console.error("Error playing question audio:", error);
      setCurrentStatus("Error playing audio question");
    }
  };

  // Start audio recording
  const startRecording = async () => {
    try {
      setCurrentStatus("Preparing microphone..");
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1, // Request mono channel audio
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });
      mediaRecorderRef.current = mediaRecorder;

      audioChunksRef.current = []; // Reset before recording starts
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          console.log("Audio chunk received:", event.data);
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        await processAudioRecording();
      };

      mediaRecorder.start();
      setIsRecording(true);
      setCurrentStatus("Listening...");

      // Auto-stop after 8 seconds
      setTimeout(() => {
        if (mediaRecorder?.state === "recording") {
          mediaRecorder.stop();
        }
      }, 8000);
    } catch (error) {
      console.error("Microphone access error:", error);
      setCurrentStatus("Microphone access denied");
      setIsDialogOpen(false);
    }
  };

  // Enhanced audio processing
  const processAudioRecording = async () => {
    setIsRecording(false);
    setCurrentStatus("Processing your response...");

    try {
      const audioBlob = new Blob(audioChunksRef.current, {
        type: "audio/webm",
      });
      const formData = new FormData();
      formData.append("audio", audioBlob);

      const response = await fetch("/api/speech-to-text", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("API request failed");

      const { transcript } = await response.json();

      if (currentVoiceField) {
        setFormData((prev) => ({
          ...prev,
          [currentVoiceField]: transcript,
        }));
      }

      proceedToNextQuestion();
    } catch (error) {
      console.error("Processing error:", error);
      setCurrentStatus("Error processing response. Please try again.");
      retryCurrentQuestion();
    }
  };

  const proceedToNextQuestion = () => {
    const currentIndex = voiceQuestions.findIndex(
      (q) => q.field === currentVoiceField
    );

    if (currentIndex < voiceQuestions.length - 1) {
      const nextField = voiceQuestions[currentIndex + 1].field;
      setCurrentVoiceField(nextField);
    } else {
      completeVoiceInteraction();
    }
  };

  const retryCurrentQuestion = async () => {
    if (currentVoiceField) {
      await playQuestionAudio(
        `Sorry, I didn't catch that. ${
          voiceQuestions.find((q) => q.field === currentVoiceField)?.question
        }`
      );
      startRecording();
    }
  };

  const completeVoiceInteraction = () => {
    setCurrentStatus("Voice input complete!");
    setIsDialogOpen(false);
    setCurrentVoiceField(null);
    setIsVoiceMode(false);
  };

  // Send recorded audio for speech-to-text
  // const sendAudioToSpeechToText = async () => {
  //   console.log("Checking recorded audio...");
  //   if (audioChunksRef.current.length === 0 || !currentVoiceField) {
  //     setCurrentStatus("No audio recorded");
  //     console.log("Chunnks length: ", audioChunksRef.current.length);
  //     console.error("No audio data found!");
  //     return;
  //   }

  //   try {
  //     const audioBlob = new Blob(audioChunksRef.current, {
  //       type: "audio/webm",
  //     });
  //     console.log("Audio Blob size:", audioBlob.size);
  //     const formData = new FormData();
  //     formData.append("audio", audioBlob, "audio.webm");

  //     // Debug: Check FormData content
  //     console.log("FormData content:", formData.get("audio"));

  //     const response = await fetch("/api/speech-to-text", {
  //       method: "POST",
  //       body: formData,
  //     });

  //     if (response.ok) {
  //       const result = await response.json();
  //       console.log("Received transcript:", result.text);

  //       // Update form data with the transcribed text
  //       setFormData((prev) => ({
  //         ...prev,
  //         [currentVoiceField]: result.text,
  //       }));

  //       // Move to next field or end voice interaction
  //       const currentIndex = voiceQuestions.findIndex(
  //         (q) => q.field === currentVoiceField
  //       );
  //       if (currentIndex < voiceQuestions.length - 1) {
  //         const nextField = voiceQuestions[currentIndex + 1];
  //         setCurrentVoiceField(nextField.field);

  //         await playQuestionAudio(nextField.question);
  //         startRecording();
  //       } else {
  //         setIsVoiceMode(false);
  //         setCurrentStatus("Voice interaction completed");
  //         setIsDialogOpen(false);
  //       }
  //     } else {
  //       console.error("Speech-to-text API error:", response);
  //       setCurrentStatus("Error converting speech to text");
  //     }
  //   } catch (err) {
  //     console.error("Error sending audio:", err);
  //     setCurrentStatus("Error processing audio");
  //   }
  // };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
    }
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/donate-food", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("Food donation details submitted successfully!");
        // Reset form
        setFormData({
          food_name: "",
          food_desc: "",
          preparation_date_time: "",
          expiry_date_time: "",
          food_type: "",
          serves: "",
          storage: "",
          preferred_pickup_time: "",
        });
      } else {
        alert("Failed to submit donation details");
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("Error submitting donation details");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-6">Food Donation Form</h2>

      {/* Voice Interaction Toggle */}
      <div className="mb-4">
        <Button
          onClick={startVoiceInteraction}
          className="bg-green-500 hover:bg-green-600 text-white"
        >
          Complete Form Using Voice
        </Button>
      </div>

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            stopRecording();
            completeVoiceInteraction();
          }
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Voice Input Progress</DialogTitle>
            <DialogDescription>
              {currentStatus || "Ready to listen..."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4">
            <div className="animate-pulse">
              {isRecording ? (
                <div className="h-16 w-16 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white">🎤</span>
                </div>
              ) : (
                <div className="h-16 w-16 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-gray-500">⏸</span>
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground text-center">
              {currentVoiceField &&
                `Speaking: ${currentVoiceField.replace(/_/g, " ")}`}
            </p>
          </div>
        </DialogContent>
      </Dialog>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Food Name */}
        <div>
          <label className="block mb-2">Food Name</label>
          <Input
            type="text"
            value={formData.food_name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, food_name: e.target.value }))
            }
            disabled={isVoiceMode && currentVoiceField !== "food_name"}
            placeholder="Enter food name"
          />
        </div>

        {/* Food Description */}
        <div>
          <label className="block mb-2">Food Description</label>
          <Textarea
            value={formData.food_desc}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, food_desc: e.target.value }))
            }
            disabled={isVoiceMode && currentVoiceField !== "food_desc"}
            placeholder="Describe the food in detail"
          />
        </div>

        {/* Preparation Date Time */}
        <div>
          <label className="block mb-2">Preparation Date & Time</label>
          <Input
            type="datetime-local"
            value={formData.preparation_date_time}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                preparation_date_time: e.target.value,
              }))
            }
            disabled={
              isVoiceMode && currentVoiceField !== "preparation_date_time"
            }
          />
        </div>

        {/* Expiry Date Time */}
        <div>
          <label className="block mb-2">Expiry Date & Time</label>
          <Input
            type="datetime-local"
            value={formData.expiry_date_time}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                expiry_date_time: e.target.value,
              }))
            }
            disabled={isVoiceMode && currentVoiceField !== "expiry_date_time"}
          />
        </div>

        {/* Food Type */}
        <div>
          <label className="block mb-2">Food Type</label>
          <Select
            value={formData.food_type}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, food_type: value }))
            }
            disabled={isVoiceMode && currentVoiceField !== "food_type"}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select food type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="vegetarian">Vegetarian</SelectItem>
              <SelectItem value="non-vegetarian">Non-Vegetarian</SelectItem>
              <SelectItem value="vegan">Vegan</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Serves */}
        <div>
          <label className="block mb-2">Number of Serves</label>
          <Input
            type="number"
            value={formData.serves}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, serves: e.target.value }))
            }
            disabled={isVoiceMode && currentVoiceField !== "serves"}
            placeholder="How many people can this food serve?"
          />
        </div>

        {/* Storage */}
        <div>
          <label className="block mb-2">Storage Instructions</label>
          <Textarea
            value={formData.storage}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, storage: e.target.value }))
            }
            disabled={isVoiceMode && currentVoiceField !== "storage"}
            placeholder="Provide storage instructions"
          />
        </div>

        {/* Preferred Pickup Time */}
        <div>
          <label className="block mb-2">Preferred Pickup Time</label>
          <Input
            type="datetime-local"
            value={formData.preferred_pickup_time}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                preferred_pickup_time: e.target.value,
              }))
            }
            disabled={
              isVoiceMode && currentVoiceField !== "preferred_pickup_time"
            }
          />
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 text-white"
          disabled={isVoiceMode}
        >
          Submit Food Donation
        </Button>
      </form>
    </div>
  );
}
