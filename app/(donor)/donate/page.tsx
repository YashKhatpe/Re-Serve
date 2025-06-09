"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import DonationForm from "@/components/donate/DonationForm";
import ChatAssistant from "@/components/donate/ChatAssistant";
import { Navbar } from "@/components/Navbar";
import { DashNavbar } from "@/components/DashNavbar";

const Donate = () => {
  const [formData, setFormData] = useState({
    foodName: "",
    foodImage: null,
    preparationDate: "",
    expiryDate: "",
    foodType: "",
    storageType: "",
    servings: "",
    pickupTime: "",
  });

  const [isChatOpen, setIsChatOpen] = useState(false);

  const updateFormField = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateImageField = (field: string, file: File | null) => {
    setFormData((prev) => ({
      ...prev,
      [field]: file,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      {/* <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 md:px-8 lg:px-16">
          <div className="flex items-center h-16">
            <Link
              href="/dashboard"
              className="flex items-center space-x-2 text-gray-600 hover:text-orange-500 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </div>
      </header> */}
      <DashNavbar />

      {/* Main Content */}
      <div className="container mx-auto px-4 md:px-8 lg:px-16 py-8 h-[calc(100vh-4rem)]">
        <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto h-full">
          {/* Left Side - Donation Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex-1 lg:max-w-2xl"
          >
            <DonationForm
              formData={formData}
              updateFormField={updateFormField}
              updateImageField={updateImageField}
            />
          </motion.div>

          {/* Right Side - Chat Assistant (Desktop) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hidden lg:block flex-1 lg:max-w-md h-full"
          >
            <div className="h-full">
              <ChatAssistant
                formData={formData}
                updateFormField={updateFormField}
                updateImageField={updateImageField}
                isOpen={true}
                onToggle={() => {}}
              />
            </div>
          </motion.div>

          {/* Mobile Chat Button */}
          <div className="lg:hidden fixed bottom-6 right-6 z-50">
            <button
              onClick={() => setIsChatOpen(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white p-4 rounded-full shadow-lg transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-3.774-.82L3 21l1.82-6.226A8.955 8.955 0 013 12a8 8 0 018-8c4.418 0 8 3.582 8 8z"
                />
              </svg>
            </button>
          </div>

          {/* Mobile Chat Modal */}
          {isChatOpen && (
            <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50">
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 500 }}
                className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl h-3/4 overflow-hidden"
              >
                <ChatAssistant
                  formData={formData}
                  updateFormField={updateFormField}
                  updateImageField={updateImageField}
                  isOpen={true}
                  onToggle={() => {}}
                />
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Donate;
