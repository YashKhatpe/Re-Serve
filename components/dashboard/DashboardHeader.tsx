import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";

const DashboardHeader = () => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white border-b border-gray-200 shadow-sm"
    >
      <div className="px-4 md:px-8 lg:px-16">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Sidebar trigger and Logo */}
          <div className="flex items-center space-x-4">
            <SidebarTrigger className="text-gray-600 hover:text-orange-500 transition-colors" />
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">R</span>
              </div>
              <span className="text-xl font-bold text-gray-800">Re-Serve</span>
            </div>
          </div>

          {/* Navigation - Hidden on smaller screens since sidebar handles it */}
          <nav className="hidden lg:flex items-center space-x-8">
            <a
              href="#donations"
              className="text-gray-600 hover:text-orange-500 transition-colors"
            >
              Donations
            </a>
            <a
              href="#ngos"
              className="text-gray-600 hover:text-orange-500 transition-colors"
            >
              NGOs
            </a>
            <a
              href="#reports"
              className="text-gray-600 hover:text-orange-500 transition-colors"
            >
              Reports
            </a>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              className="hidden sm:flex border-orange-200 text-orange-600 hover:bg-orange-50"
            >
              View Profile
            </Button>
            <Button className="bg-orange-500 hover:bg-orange-600">
              New Donation
            </Button>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default DashboardHeader;
