"use client";
import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import Footer from "@/components/landing/Footer";

export default function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Restaurant Posts Surplus",
      description:
        "Restaurants list available surplus food with details about quantity, type, and pickup time.",
      icon: "🏪",
      details: [
        "Easy-to-use posting interface",
        "Real-time inventory management",
        "Automated expiry tracking",
        "Quality verification guidelines",
      ],
    },
    {
      number: "02",
      title: "Verification & Matching",
      description:
        "Our system verifies food safety and matches with nearby NGOs based on requirements.",
      icon: "✅",
      details: [
        "AI-powered safety checks",
        "Geographic proximity matching",
        "Dietary requirement filtering",
        "Capacity-based allocation",
      ],
    },
    {
      number: "03",
      title: "Secure Pickup",
      description:
        "NGO confirms pickup with OTP-based verification for secure and tracked collection.",
      icon: "🚚",
      details: [
        "SMS/Email OTP verification",
        "Real-time pickup tracking",
        "Digital receipt generation",
        "Chain of custody documentation",
      ],
    },
    {
      number: "04",
      title: "Impact Created",
      description:
        "Meals reach those in need while restaurants receive tax benefits and impact reports.",
      icon: "🤝",
      details: [
        "Automated tax documentation",
        "Impact measurement dashboard",
        "Monthly impact reports",
        "Social media content generation",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="py-32 bg-gradient-to-br from-orange-50 to-red-50">
        <div className="container mx-auto px-4 md:px-8 lg:px-16 m-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">
              How <span className="text-orange-500">Re-Serve</span> Works
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A simple, secure, and efficient process that transforms surplus
              food into meaningful impact for communities in need
            </p>
          </motion.div>
        </div>
      </section>

      {/* Detailed Steps */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-8 lg:px-16">
          <div className="space-y-20">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={index === 0 ? { opacity: 1, y: 0 } : undefined}
                whileInView={index !== 0 ? { opacity: 1, y: 0 } : undefined}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={index !== 0 ? { once: true } : undefined}
                className={`flex flex-col ${
                  index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
                } items-center gap-12`}
              >
                <div className="flex-1">
                  <div className="flex items-center mb-4">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                      <span className="text-3xl">{step.icon}</span>
                    </div>
                    <div className="text-orange-500 font-bold text-lg">
                      STEP {step.number}
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-800 mb-4">
                    {step.title}
                  </h3>
                  <p className="text-lg text-gray-600 mb-6">
                    {step.description}
                  </p>
                  <ul className="space-y-2">
                    {step.details.map((detail, detailIndex) => (
                      <li
                        key={detailIndex}
                        className="flex items-center text-gray-600"
                      >
                        <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex-1">
                  <div className="bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl p-8 h-80 flex items-center justify-center">
                    <span className="text-6xl">{step.icon}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 md:px-8 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Join our community of restaurants and NGOs making a difference,
              one meal at a time.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button className="bg-orange-500 hover:bg-orange-600 px-8 py-3">
                  Register Your Restaurant
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  variant="outline"
                  className="border-orange-200 text-orange-600 hover:bg-orange-50 px-8 py-3"
                >
                  Register Your NGO
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
