"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sidebar } from "@/components/sidebar";
import { StatsCard } from "@/components/dashboard/stats-card";
import { TotalRevenue } from "@/components/dashboard/total-revenue";
import { VisitorInsights } from "@/components/dashboard/visitor-insights";
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  Download,
  FileText,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calender";
import { format } from "date-fns";
import { motion } from "framer-motion";
import GenerateReceipt from "@/components/GenerateReceipt";
import { useAuth } from "@/context/auth-context";

type DashboardData = {
  todayTotalDonation: number;
  noOfPeopleServedToday: number;
  totalDonationCount: number;
  noOfNgos: number;
  noOfPeopleServed: number;
};
export default function DonorDashboard() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DashboardData | null>(null);
  const { user } = useAuth();
  const donorId = user?.id;
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(
          `/api/donor-dashboard-data?donor_id=${donorId}`
        );
        if (!res.ok) throw new Error("Failed to fetch");
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [donorId]);

  // Generate Last Month's Receipts (Quick Access)
  const handleGenerateLastMonth = async () => {
    setLoading(true);
    try {
      const today = new Date();
      const lastMonth = new Date();
      lastMonth.setMonth(today.getMonth() - 1);

      const formattedStartDate = format(
        new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1),
        "yyyy-MM-dd"
      );
      const formattedEndDate = format(
        new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0),
        "yyyy-MM-dd"
      );

      const previewUrl = `/api/generate-receipts?startDate=${formattedStartDate}&endDate=${formattedEndDate}`;

      // Fetch first to check response
      const response = await fetch(previewUrl);

      if (response.status === 200) {
        window.open(previewUrl, "_blank");
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to generate receipts.");
      }
    } catch (error) {
      console.error("Error generating receipts:", error);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0"
      >
        {/* Title & Subtitle */}
        <div>
          <h2 className="text-lg font-medium text-orange-600">Today's Sales</h2>
          <p className="text-sm text-gray-500">Sales summary</p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Link href="/donate" className="w-full sm:w-auto">
            <Button
              variant="default"
              className="bg-orange-500 hover:bg-orange-600 w-full sm:w-auto"
            >
              Donate
            </Button>
          </Link>
          <Button
            onClick={handleGenerateLastMonth}
            variant="outline"
            size="sm"
            className="gap-2 border-orange-200 text-orange-600 hover:bg-orange-50 w-full sm:w-auto"
          >
            <FileText className="h-4 w-4" />
            {loading ? "Generating..." : "Last Month's Receipts"}
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatsCard
          icon={<DollarSign className="h-5 w-5 text-white" />}
          iconBg="bg-orange-500"
          title="Total Today's Donation"
          value={loading ? "..." : `Rs. ${data?.todayTotalDonation ?? 0}`}
          change="+4.5% "
          trend="up"
        />
        <StatsCard
          icon={<ShoppingCart className="h-5 w-5 text-white" />}
          iconBg="bg-orange-400"
          title="Total Donations"
          value={loading ? "..." : `${data?.totalDonationCount ?? 0}`}
          change="-1.5% "
          trend="down"
        />
        <StatsCard
          icon={<Package className="h-5 w-5 text-white" />}
          iconBg="bg-orange-300"
          title="Number of Ngos"
          value={loading ? "..." : `${data?.noOfNgos ?? 0}`}
          change="+2.5% "
          trend="up"
        />
        <StatsCard
          icon={<Users className="h-5 w-5 text-white" />}
          iconBg="bg-orange-600"
          title="Number of people served"
          value={loading ? "..." : `${data?.noOfPeopleServed ?? 0}`}
          change="+0.5% "
          trend="up"
        />
      </motion.div>

      <GenerateReceipt />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <TotalRevenue />
        <VisitorInsights />
      </motion.div>
    </motion.div>
  );
}
