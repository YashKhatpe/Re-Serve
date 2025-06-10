import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, X, Check, RotateCcw, Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
// import { ScrollArea } from "@radix-ui/react-scroll-area";
import { Input } from "../ui/input";
import { v4 as uuidv4 } from "uuid";

interface ChatAssistantProps {
  formData: any;
  updateFormField: (field: string, value: string) => void;
  updateImageField: (field: string, file: File | null) => void;
  isOpen: boolean;
  onToggle: () => void;
}

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  isConfirmation?: boolean;
  showOptions?: boolean;
  showCalendar?: boolean;
  showImageUpload?: boolean;
  field?: string;
}

const questions = [
  {
    field: "foodName",
    question:
      "Hi! I'm here to help you donate food. What's the name of the food you'd like to donate?",
  },
  {
    field: "foodImage",
    question: "Great! Now please upload an image of the food.",
    showImageUpload: true,
  },
  {
    field: "foodType",
    question: "What type of food is this?",
    showOptions: true,
  },
  {
    field: "servings",
    question: "How many people do you think this food can serve?",
  },
  {
    field: "preparationDate",
    question: "When was this food prepared? Please select the date and time.",
    showCalendar: true,
  },
  // {
  //   field: "expiryDate",
  //   question: "When does this food expire? Please select the date and time.",
  //   showCalendar: true,
  // },
  {
    field: "storageType",
    question: "How should this food be stored?",
    showOptions: true,
  },
  {
    field: "pickupTime",
    question:
      "When would be the best time for pickup? For example, today between 5-7 PM?",
  },
];

const foodTypeOptions = [
  { value: "veg", label: "Vegetarian" },
  { value: "non-veg", label: "Non-Vegetarian" },
  { value: "jain", label: "Jain" },
];

const storageTypeOptions = [
  { value: "refrigerated", label: "Refrigerated" },
  { value: "frozen", label: "Frozen" },
  { value: "room_temp", label: "Room Temperature" },
];

// Audio buffer to WAV conversion utility
const audioBufferToWav = (buffer: AudioBuffer): ArrayBuffer => {
  const length = buffer.length;
  const arrayBuffer = new ArrayBuffer(44 + length * 2);
  const view = new DataView(arrayBuffer);
  const channelData = buffer.getChannelData(0);

  // WAV header
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(0, "RIFF");
  view.setUint32(4, 36 + length * 2, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, buffer.sampleRate, true);
  view.setUint32(28, buffer.sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, "data");
  view.setUint32(40, length * 2, true);

  // Convert float samples to 16-bit PCM
  let offset = 44;
  for (let i = 0; i < length; i++) {
    const sample = Math.max(-1, Math.min(1, channelData[i]));
    view.setInt16(offset, sample * 0x7fff, true);
    offset += 2;
  }

  return arrayBuffer;
};

const ChatAssistant: React.FC<ChatAssistantProps> = ({
  formData,
  updateFormField,
  updateImageField,
  isOpen,
  onToggle,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingResponse, setPendingResponse] = useState<string | null>(null);
  const [waitingForConfirmation, setWaitingForConfirmation] = useState(false);
  const [waitingForSelection, setWaitingForSelection] = useState(false);
  const [waitingForDate, setWaitingForDate] = useState(false);
  const [waitingForImage, setWaitingForImage] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const SAMPLE_RATE = 16000;

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      askQuestion(0);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const askQuestion = async (questionIndex: number) => {
    if (questionIndex >= questions.length) {
      const completionMessage =
        "Perfect! I've helped you fill out all the details for your food donation. You can now review the form and submit your donation. Thank you for helping fight food waste!";
      await typeMessage(completionMessage, true);
      // speakText(completionMessage);
      return;
    }

    setIsTyping(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const question = questions[questionIndex];
    const messageObj: Message = {
      id: Date.now().toString(),
      text: question.question,
      isBot: true,
      timestamp: new Date(),
      showOptions: question.showOptions,
      showCalendar: question.showCalendar,
      showImageUpload: question.showImageUpload,
      field: question.field,
    };

    await typeMessage(
      question.question,
      true,
      question.showOptions,
      question.showCalendar,
      question.showImageUpload,
      question.field
    );
    setIsTyping(false);
    // speakText(question.question);

    if (question.showOptions) {
      setWaitingForSelection(true);
    } else if (question.showCalendar) {
      setWaitingForDate(true);
    } else if (question.showImageUpload) {
      setWaitingForImage(true);
    }
  };

  const validateResponse = (field: string, response: string): boolean => {
    const lowercaseResponse = response.toLowerCase();

    switch (field) {
      case "foodType":
        return ["veg", "non-veg", "jain"].some(
          (type) =>
            lowercaseResponse.includes(type) ||
            (type === "non-veg" &&
              (lowercaseResponse.includes("nonveg") ||
                lowercaseResponse.includes("non veg")))
        );

      case "storageType":
        return ["refrigerated", "frozen", "room temperature"].some(
          (type) =>
            lowercaseResponse.includes(type.toLowerCase()) ||
            (type === "refrigerated" &&
              (lowercaseResponse.includes("fridge") ||
                lowercaseResponse.includes("cold"))) ||
            (type === "room temperature" &&
              (lowercaseResponse.includes("room") ||
                lowercaseResponse.includes("normal")))
        );

      default:
        return true;
    }
  };

  const processResponse = (field: string, response: string): string => {
    const lowercaseResponse = response.toLowerCase();

    switch (field) {
      case "foodType":
        if (
          lowercaseResponse.includes("veg") &&
          !lowercaseResponse.includes("non")
        )
          return "veg";
        if (
          lowercaseResponse.includes("non-veg") ||
          lowercaseResponse.includes("nonveg") ||
          lowercaseResponse.includes("non veg")
        )
          return "non-veg";
        if (lowercaseResponse.includes("jain")) return "jain";
        return response;

      case "storageType":
        if (
          lowercaseResponse.includes("refrigerat") ||
          lowercaseResponse.includes("fridge") ||
          lowercaseResponse.includes("cold")
        ) {
          return "refrigerated";
        } else if (
          lowercaseResponse.includes("freez") ||
          lowercaseResponse.includes("frozen")
        ) {
          return "frozen";
        } else if (
          lowercaseResponse.includes("room") ||
          lowercaseResponse.includes("normal")
        ) {
          return "room_temp";
        }
        return response;

      case "servings":
        const numberMatch = response.match(/\d+/);
        if (numberMatch) {
          return numberMatch[0];
        }
        return response;

      default:
        return response;
    }
  };

  const typeMessage = (
    text: string,
    isBot: boolean,
    showOptions?: boolean,
    showCalendar?: boolean,
    showImageUpload?: boolean,
    field?: string
  ): Promise<void> => {
    return new Promise((resolve) => {
      const newMessage: Message = {
        id: uuidv4(),
        text: "",
        isBot,
        timestamp: new Date(),
        showOptions,
        showCalendar,
        showImageUpload,
        field,
      };

      setMessages((prev) => [...prev, newMessage]);

      let currentIndex = 0;
      const typeInterval = setInterval(() => {
        if (currentIndex < text.length) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === newMessage.id
                ? { ...msg, text: text.slice(0, currentIndex + 1) }
                : msg
            )
          );
          currentIndex++;
        } else {
          clearInterval(typeInterval);
          resolve();
        }
      }, 30);
    });
  };

  // const speakText = async (text: string) => {
  //   try {
  //     const response = await fetch("/api/text-to-speech", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({ text }),
  //     });

  //     if (!response.ok) {
  //       throw new Error("Failed to generate speech");
  //     }

  //     const data = await response.json();
  //     const audioSrc = `data:audio/mp3;base64,${data.audioContent}`;
  //     const audio = new Audio(audioSrc);
  //     await new Promise<void>((resolve) => {
  //       audio.onended = () => resolve();
  //       audio.play();
  //     });
  //   } catch (error) {
  //     console.error("Error with text-to-speech:", error);
  //   }
  // };

  const startRecording = async (): Promise<void> => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: SAMPLE_RATE,
        },
      });

      const audioContext = new AudioContext({
        sampleRate: SAMPLE_RATE,
      });
      const source = audioContext.createMediaStreamSource(stream);
      const destination = audioContext.createMediaStreamDestination();
      source.connect(destination);

      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      recorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      recorder.onstop = () => {
        console.log("Audio chunks: ", audioChunksRef);
        sendAudioToBackend();
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      setIsListening(true);

      // Automatically stop recording after 5 seconds
      setTimeout(() => {
        if (
          mediaRecorderRef.current &&
          mediaRecorderRef.current.state === "recording"
        ) {
          stopRecording();
        }
      }, 5000);
    } catch (error) {
      console.error("Error capturing audio:", error);
      setError("Error accessing microphone");
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
    }
    setIsListening(false);
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
          handleUserResponse(result.transcript);
          audioChunksRef.current = [];
        } else {
          setError("Error uploading audio to server");
        }
      };
    } catch (err) {
      console.error("Error sending audio:", err);
      setError("Error processing or sending audio");
    }
  };

  const handleUserResponse = async (transcript: string) => {
    setIsListening(false);

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: transcript,
      isBot: false,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Store the response and ask for confirmation
    setPendingResponse(transcript);
    setWaitingForConfirmation(true);

    // Add confirmation message
    await new Promise((resolve) => setTimeout(resolve, 500));
    const confirmationMessage = `I heard: "${transcript}". Is this correct?`;
    const confirmationMessageObj: Message = {
      id: (Date.now() + 1).toString(),
      text: confirmationMessage,
      isBot: true,
      timestamp: new Date(),
      isConfirmation: true,
    };
    setMessages((prev) => [...prev, confirmationMessageObj]);
    // speakText(confirmationMessage);
  };

  const handleOptionSelection = async (value: string) => {
    setWaitingForSelection(false);

    // Add user selection message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: value,
      isBot: false,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Process the selection immediately (no confirmation needed for button selections)
    if (currentQuestionIndex < questions.length) {
      const currentQuestion = questions[currentQuestionIndex];
      updateFormField(currentQuestion.field, value);

      // Confirmation message
      await new Promise((resolve) => setTimeout(resolve, 500));
      const successMessage = `Perfect! I've recorded that information. Let me ask you the next question.`;
      await typeMessage(successMessage, true);

      // Move to next question
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);

      setTimeout(() => {
        askQuestion(nextIndex);
      }, 1500);
    }
  };

  const handleDateTimeSelection = async (dateTime: string, field: string) => {
    if (!dateTime) return;

    setWaitingForDate(false);

    // Add user selection message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: `Selected: ${new Date(dateTime).toLocaleString()}`,
      isBot: false,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Update form field
    updateFormField(field, dateTime);

    // Confirmation message
    await new Promise((resolve) => setTimeout(resolve, 500));
    const successMessage = `Perfect! I've recorded the date and time. Let me ask you the next question.`;
    await typeMessage(successMessage, true);

    // Move to next question
    const nextIndex = currentQuestionIndex + 1;
    setCurrentQuestionIndex(nextIndex);

    setTimeout(() => {
      askQuestion(nextIndex);
    }, 1500);
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setWaitingForImage(false);

    // Add user selection message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: `Uploaded: ${file.name}`,
      isBot: false,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Update form field
    updateImageField("foodImage", file);

    // Confirmation message
    await new Promise((resolve) => setTimeout(resolve, 500));
    const successMessage = `Great! I've uploaded your image. Let me ask you the next question.`;
    await typeMessage(successMessage, true);

    // Move to next question
    const nextIndex = currentQuestionIndex + 1;
    setCurrentQuestionIndex(nextIndex);

    setTimeout(() => {
      askQuestion(nextIndex);
    }, 1500);
  };

  const handleConfirmation = async (isCorrect: boolean) => {
    setWaitingForConfirmation(false);

    if (!isCorrect || !pendingResponse) {
      // Ask the question again
      setPendingResponse(null);
      await new Promise((resolve) => setTimeout(resolve, 500));
      const retryMessage = "Let me ask the question again.";
      await typeMessage(retryMessage, true);
      // speakText(retryMessage);

      setTimeout(() => {
        askQuestion(currentQuestionIndex);
      }, 2000);
      return;
    }

    // Process the confirmed response
    if (currentQuestionIndex < questions.length) {
      const currentQuestion = questions[currentQuestionIndex];

      // Validate the response for specific fields
      if (!validateResponse(currentQuestion.field, pendingResponse)) {
        setPendingResponse(null);
        await new Promise((resolve) => setTimeout(resolve, 500));
        const invalidMessage = `Sorry, I didn't understand that option. ${currentQuestion.question}`;
        await typeMessage(invalidMessage, true);
        // speakText(invalidMessage);
        return;
      }

      const processedValue = processResponse(
        currentQuestion.field,
        pendingResponse
      );
      updateFormField(currentQuestion.field, processedValue);

      // Confirmation message
      await new Promise((resolve) => setTimeout(resolve, 500));
      const successMessage = `Perfect! I've recorded that information. Let me ask you the next question.`;
      await typeMessage(successMessage, true);

      // Move to next question
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      setPendingResponse(null);

      setTimeout(() => {
        askQuestion(nextIndex);
      }, 1500);
    }
  };

  const renderDateTimeInput = (field: string) => {
    return (
      <div className="mt-3">
        <Input
          type="datetime-local"
          onChange={(e) => {
            if (e.target.value) {
              handleDateTimeSelection(e.target.value, field);
            }
          }}
          className="w-full"
          placeholder="Select date and time"
        />
      </div>
    );
  };

  const renderImageUpload = () => {
    return (
      <div className="mt-3">
        <Button
          onClick={() => fileInputRef.current?.click()}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white"
        >
          <Upload className="mr-2 h-4 w-4" />
          Upload Image
        </Button>
        <Input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>
    );
  };

  const renderOptionButtons = (field: string) => {
    if (field === "foodType") {
      return (
        <div className="flex flex-col gap-2 mt-3">
          {foodTypeOptions.map((option) => (
            <Button
              key={option.value}
              onClick={() => handleOptionSelection(option.value)}
              className="bg-orange-500 hover:bg-orange-600 text-white text-sm py-2"
            >
              {option.label}
            </Button>
          ))}
        </div>
      );
    }

    if (field === "storageType") {
      return (
        <div className="flex flex-col gap-2 mt-3">
          {storageTypeOptions.map((option) => (
            <Button
              key={option.value}
              onClick={() => handleOptionSelection(option.value)}
              className="bg-orange-500 hover:bg-orange-600 text-white text-sm py-2"
            >
              {option.label}
            </Button>
          ))}
        </div>
      );
    }

    return null;
  };

  if (!isOpen) return null;

  return (
    <Card className="h-full flex flex-col shadow-xl">
      <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            AI Donation Assistant
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="text-white hover:bg-white/20 lg:hidden"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages Area with ScrollArea */}
        <ScrollArea className="flex-1 max-h-[calc(100vh-20rem)]">
          <div className="flex flex-col p-4 space-y-4 bg-gray-50">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${
                    message.isBot ? "justify-start" : "justify-end"
                  }`}
                >
                  <div
                    className={`max-w-xs lg:max-w-sm px-4 py-3 rounded-2xl ${
                      message.isBot
                        ? "bg-white text-gray-800 shadow-sm"
                        : "bg-orange-500 text-white"
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    {message.isConfirmation && waitingForConfirmation && (
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          onClick={() => handleConfirmation(true)}
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 text-xs"
                        >
                          <Check className="w-3 h-3 mr-1" />
                          Yes
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleConfirmation(false)}
                          className="px-3 py-1 text-xs"
                        >
                          <RotateCcw className="w-3 h-3 mr-1" />
                          No, ask again
                        </Button>
                      </div>
                    )}
                    {message.showOptions &&
                      waitingForSelection &&
                      message.field &&
                      renderOptionButtons(message.field)}
                    {message.showCalendar &&
                      waitingForDate &&
                      message.field &&
                      renderDateTimeInput(message.field)}
                    {message.showImageUpload &&
                      waitingForImage &&
                      renderImageUpload()}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="bg-white px-4 py-3 rounded-2xl shadow-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Controls */}
        <div className="p-4 bg-white border-t">
          {error && (
            <div className="text-red-500 text-xs text-center mb-2">{error}</div>
          )}
          <div className="flex items-center justify-center space-x-4">
            <Button
              onClick={isListening ? stopRecording : startRecording}
              disabled={
                isTyping ||
                waitingForConfirmation ||
                waitingForSelection ||
                waitingForDate ||
                waitingForImage
              }
              className={`w-16 h-16 rounded-full ${
                isListening
                  ? "bg-red-500 hover:bg-red-600 animate-pulse"
                  : "bg-orange-500 hover:bg-orange-600"
              } text-white transition-all duration-200 ${
                isTyping ||
                waitingForConfirmation ||
                waitingForSelection ||
                waitingForDate ||
                waitingForImage
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              {isListening ? (
                <MicOff className="w-6 h-6" />
              ) : (
                <Mic className="w-6 h-6" />
              )}
            </Button>
          </div>
          <p className="text-center text-xs text-gray-500 mt-2">
            {waitingForSelection
              ? "Please select an option above"
              : waitingForDate
              ? "Please select a date above"
              : waitingForImage
              ? "Please upload an image above"
              : waitingForConfirmation
              ? "Please confirm if the response is correct"
              : isListening
              ? "Listening... Speak now!"
              : "Click the mic to answer"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatAssistant;
