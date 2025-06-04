"use client";
import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  Shield,
  MapPin,
  Lock,
  DollarSign,
  BarChart,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import Footer from "@/components/landing/Footer";

export default function Features() {
  const features = [
    {
      title: "Food Safety Verification",
      description:
        "Automated safety checks and quality verification ensure only safe food is donated.",
      icon: Shield,
      color: "green",
      benefits: [
        "AI-powered quality assessment",
        "Temperature monitoring alerts",
        "Expiry date verification",
        "Hygiene compliance checks",
      ],
    },
    {
      title: "Impact Analytics",
      description:
        "Detailed insights on meals served, waste reduced, and community impact created.",
      icon: BarChart,
      color: "red",
      benefits: [
        "Real-time impact dashboard",
        "Monthly impact reports",
        "Waste reduction metrics",
        "Community reach analytics",
      ],
    },
    {
      title: "OTP-Based Pickup",
      description:
        "Secure pickup process with OTP verification for both restaurants and NGOs.",
      icon: Lock,
      color: "blue",
      benefits: [
        "Two-factor authentication",
        "SMS and email verification",
        "Fraud prevention measures",
        "Secure handover documentation",
      ],
    },
    {
      title: "Tax Benefits",
      description:
        "Automatic generation of tax-deductible donation receipts and impact reports.",
      icon: DollarSign,
      color: "purple",
      benefits: [
        "Automated receipt generation",
        "Tax-compliant documentation",
        "Annual tax summary reports",
        "Financial impact tracking",
      ],
    },
    {
      title: "24/7 Support",
      description:
        "Round-the-clock support for both restaurants and NGOs to ensure smooth operations.",
      icon: Clock,
      color: "teal",
      benefits: [
        "Live chat support",
        "Emergency pickup assistance",
        "Technical issue resolution",
        "Training and onboarding help",
      ],
    },
    {
      title: "Location Based Filtering",
      description:
        "Filter donations based on location, ensuring that the food reaches the needy in the right place.",
      icon: MapPin,
      color: "orange",
      benefits: [
        "Improves delivery efficiency by matching donations with nearby NGOs.",
        "Reduces food waste by minimizing travel time.",
        "Ensures timely pickup and distribution to those in need.",
        "Promotes hyperlocal impact, reaching communities faster and effectively.",
      ],
    },
  ];

  const getColorClasses = (color: string) => {
    const colorMap = {
      orange: "bg-orange-100 text-orange-600 border-orange-200",
      green: "bg-green-100 text-green-600 border-green-200",
      blue: "bg-blue-100 text-blue-600 border-blue-200",
      purple: "bg-purple-100 text-purple-600 border-purple-200",
      red: "bg-red-100 text-red-600 border-red-200",
      teal: "bg-teal-100 text-teal-600 border-teal-200",
    };
    return (
      colorMap[color as keyof typeof colorMap] ||
      "bg-gray-100 text-gray-600 border-gray-200"
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-orange-50 to-red-50">
        <div className="container mx-auto px-4 md:px-8 lg:px-16 m-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-gray-800 m-6">
              Powerful <span className="text-orange-500">Features</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to make food donation seamless, secure, and
              impactful for everyone involved
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-8 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true, amount: 0.3 }} // reduced amount helps early trigger
                className="group"
              >
                <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:-translate-y-2">
                  <div
                    className={`inline-flex items-center justify-center w-16 h-16 rounded-xl border-2 mb-6 ${getColorClasses(
                      feature.color
                    )}`}
                  >
                    <feature.icon className="w-8 h-8" />
                  </div>

                  <h3 className="text-2xl font-semibold text-gray-800 mb-4 group-hover:text-orange-500 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    {feature.description}
                  </p>

                  <ul className="space-y-3">
                    {feature.benefits.map((benefit, benefitIndex) => (
                      <li
                        key={benefitIndex}
                        className="flex items-center text-gray-600"
                      >
                        <div className="w-2 h-2 bg-orange-500 rounded-full mr-3 flex-shrink-0"></div>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 md:px-8 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Proven <span className="text-orange-500">Results</span>
            </h2>
            <p className="text-lg text-gray-600">
              Our features deliver measurable impact for our community
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="text-4xl font-bold text-orange-500 mb-2">
                99.8%
              </div>
              <div className="text-gray-600">Platform Uptime</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="text-4xl font-bold text-orange-500 mb-2">
                15min
              </div>
              <div className="text-gray-600">Average Pickup Time</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="text-4xl font-bold text-orange-500 mb-2">
                100%
              </div>
              <div className="text-gray-600">Food Safety Compliance</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="text-4xl font-bold text-orange-500 mb-2">
                24/7
              </div>
              <div className="text-gray-600">Support Available</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-8 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-8 md:p-12 text-white">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                Experience These Features Today
              </h3>
              <p className="text-lg mb-6 opacity-90">
                Join hundreds of restaurants and NGOs already benefiting from
                our comprehensive platform
              </p>
              <Link href="/register">
                <Button className="bg-white text-orange-500 hover:bg-gray-100 px-8 py-3 cursor-pointer">
                  Start Your Free Trial
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
