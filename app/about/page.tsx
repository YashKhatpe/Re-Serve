"use client";
import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Heart, Users, Target, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import Footer from "@/components/landing/Footer";

export default function AboutUs() {
  const values = [
    {
      icon: Heart,
      title: "Compassion",
      description:
        "We believe every person deserves access to nutritious food and every effort to reduce waste matters.",
    },
    {
      icon: Users,
      title: "Community",
      description:
        "Building bridges between businesses and non-profits to create stronger, more connected communities.",
    },
    {
      icon: Target,
      title: "Impact",
      description:
        "Focused on measurable outcomes that create real change in food security and waste reduction.",
    },
    {
      icon: Award,
      title: "Excellence",
      description:
        "Committed to providing the highest quality platform with innovative features and reliable service.",
    },
  ];

  const team = [
    {
      name: "Yash Khatpe",
      role: "Student DBIT",
      bio: "Web Dev",
      // avatar: "👩‍💼",
      avatar: "👨‍💻",
    },
    {
      name: "Abdullah Ansari",
      role: "Student DBIT",
      bio: "Web Dev",
      // avatar: "👩‍💼",
      avatar: "👨‍💻",
    },
    {
      name: "Krishna Shirsath",
      role: "Student DBIT",
      bio: "Web Dev",
      // avatar: "👩‍💼",
      avatar: "👨‍💻",
    },
    {
      name: "Riyaz Memon",
      role: "Student DBIT",
      bio: "Web Dev",
      // avatar: "👩‍💼",
      avatar: "👨‍💻",
    },

    // {
    //   name: "Priya Patel",
    //   role: "Head of Partnerships",
    //   bio: "NGO veteran with extensive experience building relationships between nonprofits and corporate partners.",
    //   avatar: "👩‍🤝‍👨",
    // },
    // {
    //   name: "David Kim",
    //   role: "Head of Operations",
    //   bio: "Supply chain expert focused on optimizing food distribution networks for maximum efficiency.",
    //   avatar: "👨‍🔧",
    // },
  ];

  const milestones = [
    {
      year: "2025",
      title: "Founded",
      description:
        "Re-Serve was born from a shared vision to eliminate food waste while addressing hunger.",
    },
    {
      year: "2025",
      title: "First Partnerships",
      description:
        "Launched with 10 restaurants and 5 NGOs, serving our first 1,000 meals.",
    },
    {
      year: "2025",
      title: "Rapid Growth",
      description:
        "Expanded to 150+ restaurants and 75+ NGOs, serving over 100,000 meals.",
    },
    {
      year: "2025",
      title: "National Recognition",
      description:
        "Awarded 'Best Social Impact Startup' and featured in major sustainability publications.",
    },
  ];

  const missionRef = useRef(null);
  const isInView = useInView(missionRef, {
    once: true,
    margin: "-100px", // optional: triggers earlier
  });

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-orange-50 to-red-50">
        <div className="container mx-auto px-4 md:px-8 lg:px-16 m-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">
              About <span className="text-orange-500">Re-Serve</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're on a mission to eliminate food waste and hunger by
              connecting restaurants with surplus food to NGOs serving
              communities in need.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-8 lg:px-16">
          <motion.div
            ref={missionRef}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
              Our Mission
            </h2>
            <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
              In a world where millions go hungry while perfectly good food goes
              to waste, we saw an opportunity to make a difference. Re-Serve
              bridges the gap between food surplus and food insecurity, creating
              a sustainable ecosystem where businesses can reduce waste while
              making a meaningful social impact.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true, amount: 0.2 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story Timeline */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 md:px-8 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Our Journey
            </h2>
            <p className="text-lg text-gray-600">
              From a simple idea to a growing movement
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            {milestones.map((milestone, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className={`flex items-center mb-12 ${
                  index % 2 === 0 ? "flex-row" : "flex-row-reverse"
                }`}
              >
                <div
                  className={`flex-1 ${
                    index % 2 === 0 ? "text-right pr-8" : "text-left pl-8"
                  }`}
                >
                  <div className="text-orange-500 font-bold text-xl mb-2">
                    {milestone.year}
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                    {milestone.title}
                  </h3>
                  <p className="text-gray-600">{milestone.description}</p>
                </div>
                <div className="w-4 h-4 bg-orange-500 rounded-full relative">
                  {index < milestones.length - 1 && (
                    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-0.5 h-20 bg-orange-200"></div>
                  )}
                </div>
                <div className="flex-1"></div>
              </motion.div>
            ))}
            <p className="px-16">
              Note: The above milestones are illustrative and used solely for
              design and demonstration purposes.
            </p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-8 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Meet Our Team
            </h2>
            <p className="text-lg text-gray-600">
              Passionate individuals united by a common goal
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">{member.avatar}</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-1">
                  {member.name}
                </h3>
                <div className="text-orange-500 font-medium mb-3">
                  {member.role}
                </div>
                <p className="text-gray-600 text-sm">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-20 bg-gradient-to-r from-orange-500 to-red-500">
        <div className="container mx-auto px-4 md:px-8 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Our Impact So Far
            </h2>
            <p className="text-lg text-white opacity-90">
              Making a real difference in communities across the country
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <div className="text-4xl font-bold mb-2">250K+</div>
              <div className="opacity-90">Meals Served</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="opacity-90">Partner Restaurants</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <div className="text-4xl font-bold mb-2">200+</div>
              <div className="opacity-90">NGO Partners</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <div className="text-4xl font-bold mb-2">50</div>
              <div className="opacity-90">Cities Served</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Join Us CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-8 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
              Join Our Mission
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Whether you're a restaurant looking to reduce waste or an NGO
              seeking reliable food sources, we'd love to have you as part of
              our growing community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-orange-500 hover:bg-orange-600 px-8 py-3">
                Partner With Us
              </Button>
              <Button
                variant="outline"
                className="border-orange-200 text-orange-600 hover:bg-orange-50 px-8 py-3"
              >
                Contact Our Team
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
