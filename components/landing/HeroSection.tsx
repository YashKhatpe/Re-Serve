"use client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-between px-4 md:px-8 lg:px-16 bg-gradient-to-br from-orange-50 to-red-50">
      <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center pb-40">
        {/* Left Content */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="space-y-6"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 leading-tight">
            Small Changes That Change The{" "}
            <span className="text-orange-500">Future</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
            Connect restaurants with surplus food to NGOs and make every meal
            matter. Reduce food waste while serving those in need with our
            secure, verified platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link href="/donate">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-full text-lg font-semibold">
                Start Donating
              </Button>
            </Link>
            <Link href="/register?type=ngo">
              <Button
                variant="outline"
                className="border-orange-500 text-orange-500 hover:bg-orange-50 px-8 py-4 rounded-full text-lg font-semibold"
              >
                Join as NGO
              </Button>
            </Link>
          </div>
          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="flex items-center space-x-8 pt-8"
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">500+</div>
              <div className="text-sm text-gray-600">Meals Served</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">50+</div>
              <div className="text-sm text-gray-600">Partner NGOs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">25+</div>
              <div className="text-sm text-gray-600">Restaurants</div>
            </div>
          </motion.div>
        </motion.div>
        {/* Right Content - Food Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="relative"
        >
          <div className="relative w-full h-96 md:h-[500px] rounded-full bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
            {/* Decorative circles */}
            <div className="absolute inset-0 rounded-full border-4 border-dashed border-orange-300 opacity-50"></div>
            {/* Food items arranged in a circle */}
            <div className="relative w-80 h-80 rounded-full bg-white shadow-2xl flex items-center justify-center overflow-hidden">
              <div className="grid grid-cols-3 gap-4 p-8">
                <div className="w-16 h-16 bg-orange-200 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🍛</span>
                </div>
                <div className="w-16 h-16 bg-red-200 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🍜</span>
                </div>
                <div className="w-16 h-16 bg-yellow-200 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🥘</span>
                </div>
                <div className="w-16 h-16 bg-green-200 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🍲</span>
                </div>
                <div className="w-20 h-20 bg-orange-300 rounded-full flex items-center justify-center">
                  <span className="text-3xl">🍝</span>
                </div>
                <div className="w-16 h-16 bg-purple-200 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🍛</span>
                </div>
                <div className="w-16 h-16 bg-blue-200 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🥗</span>
                </div>
                <div className="w-16 h-16 bg-pink-200 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🍱</span>
                </div>
                <div className="w-16 h-16 bg-indigo-200 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🍽️</span>
                </div>
              </div>
            </div>
            {/* Floating elements */}
            <motion.div
              animate={{ y: [-10, 10, -10] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute top-10 right-10 w-12 h-12 bg-orange-400 rounded-full flex items-center justify-center shadow-lg"
            >
              <span className="text-xl">🎯</span>
            </motion.div>
            <motion.div
              animate={{ y: [10, -10, 10] }}
              transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
              className="absolute bottom-10 left-10 w-12 h-12 bg-red-400 rounded-full flex items-center justify-center shadow-lg"
            >
              <span className="text-xl">❤️</span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
