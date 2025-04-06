"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sidebar } from "@/components/sidebar";
import { StatsCard } from "@/components/dashboard/stats-card";
import { TotalRevenue } from "@/components/dashboard/total-revenue";
import { VisitorInsights } from "@/components/dashboard/visitor-insights";
import { DollarSign, ShoppingCart, Package, Users, Download, FileText, Calendar } from "lucide-react";
import Link from "next/link";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calender";
import { format } from "date-fns";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [openStartDate, setOpenStartDate] = useState(false);
  const [openEndDate, setOpenEndDate] = useState(false);

  // Generate Batch Receipts Function
  const handleGenerateReceipts = async () => {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates");
      return;
    }

    setLoading(true);
    try {
      // Format dates for API call: YYYY-MM-DD
      const formattedStartDate = format(startDate, "yyyy-MM-dd");
      const formattedEndDate = format(endDate, "yyyy-MM-dd");

      // Open in new tab to download ZIP file
      window.open(
        `/api/generate-receipts?startDate=${formattedStartDate}&endDate=${formattedEndDate}`,
        '_blank'
      );
    } catch (error) {
      console.error("Error generating receipts:", error);
      alert("Failed to generate tax receipts. Please try again.");
    }
    setLoading(false);
  };

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
    <div className="flex h-screen bg-gray-50">
      <div className="w-64 flex-shrink-0">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-medium">Today's Sales</h2>
                <p className="text-sm text-gray-500">Sales summary</p>
              </div>
              <div className="flex gap-3">
                <Link href="/donate">
                  <Button variant="default" className="bg-emerald-600 hover:bg-emerald-700">
                    Donate
                  </Button>
                </Link>
                <Button
                  onClick={handleGenerateLastMonth}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <FileText className="h-4 w-4" />
                  {loading ? "Generating..." : "Last Month's Receipts"}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCard
                icon={<DollarSign className="h-5 w-5 text-white" />}
                iconBg="bg-red-400"
                title="Total Today's Donation"
                value="Rs. 1000"
                change="+4.5% "
                trend="up"
              />
              <StatsCard
                icon={<ShoppingCart className="h-5 w-5 text-white" />}
                iconBg="bg-yellow-400"
                title="Total Donations"
                value="300"
                change="-1.5% "
                trend="down"
              />
              <StatsCard
                icon={<Package className="h-5 w-5 text-white" />}
                iconBg="bg-green-400"
                title="Number of Donors"
                value="5"
                change="+2.5% "
                trend="up"
              />
              <StatsCard
                icon={<Users className="h-5 w-5 text-white" />}
                iconBg="bg-purple-400"
                title="Number of people served"
                value="350"
                change="+0.5% "
                trend="up"
              />
            </div>

            {/* Tax Receipt Generator Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium">Generate Tax Deduction Receipts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 items-end">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Start Date</label>
                    <Popover open={openStartDate} onOpenChange={setOpenStartDate}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-[240px] justify-start text-left font-normal"
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {startDate ? format(startDate, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={startDate}
                          onSelect={(date) => {
                            setStartDate(date);
                            setOpenStartDate(false);
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">End Date</label>
                    <Popover open={openEndDate} onOpenChange={setOpenEndDate}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-[240px] justify-start text-left font-normal"
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {endDate ? format(endDate, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={endDate}
                          onSelect={(date) => {
                            setEndDate(date);
                            setOpenEndDate(false);
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <Button
                    onClick={handleGenerateReceipts}
                    disabled={!startDate || !endDate || loading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {loading ? "Generating..." : "Generate Receipts"}
                  </Button>
                </div>

                <div className="mt-4 text-sm text-gray-500">
                  <p>Generate tax deduction receipts for food donations within a specific date range.</p>
                  <p className="mt-1 text-red-600 font-medium">Note: Once generated, receipts cannot be modified to prevent duplicate tax claims.</p>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TotalRevenue />
              <VisitorInsights />
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}