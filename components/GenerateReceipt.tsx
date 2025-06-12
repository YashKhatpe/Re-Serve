"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calender";
import { format } from "date-fns";
import { motion } from "framer-motion";
import ReceiptHistory from "./dashboard/ReceiptHistory";
import { toast } from "sonner";

export default function GenerateReceipt() {
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [openStartDate, setOpenStartDate] = useState(false);
  const [openEndDate, setOpenEndDate] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const handleGenerateReceipts = async () => {
    if (!startDate || !endDate) {
      toast("Invalid details", {
        description: "Please select both start and end dates",
      });
      return;
    }

    setLoading(true);
    try {
      const formattedStartDate = format(startDate, "yyyy-MM-dd");
      const formattedEndDate = format(endDate, "yyyy-MM-dd");

      window.open(
        `/api/generate-receipts?startDate=${formattedStartDate}&endDate=${formattedEndDate}`,
        "_blank"
      );
    } catch (error) {
      console.error("Error generating receipts:", error);
      toast("Error!!!", {
        description: "Failed to generate tax receipts. Please try again.",
      });
    }
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="text-lg font-medium text-orange-600">
            Generate Tax Deduction Receipts
          </CardTitle>
          <div className="flex gap-2 mt-2">
            <Button
              variant={showHistory ? "outline" : "default"}
              className={showHistory ? "" : "bg-orange-500 text-white"}
              onClick={() => setShowHistory(false)}
            >
              Generate Receipt
            </Button>
            <Button
              variant={showHistory ? "default" : "outline"}
              className={showHistory ? "bg-orange-500 text-white" : ""}
              onClick={() => setShowHistory(true)}
            >
              Receipt History
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showHistory ? (
            <ReceiptHistory />
          ) : (
            <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap items-stretch sm:items-end">
              {/* Start Date Picker */}
              <div className="flex flex-col gap-2 w-full sm:w-[240px]">
                <label className="text-sm font-medium">Start Date</label>
                <Popover open={openStartDate} onOpenChange={setOpenStartDate}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal border-orange-200 text-orange-600 hover:bg-orange-50"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="rounded-md border w-full min-w-[320px] sm:min-w-[360px]">
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

              {/* End Date Picker */}
              <div className="flex flex-col gap-2 w-full sm:w-[240px]">
                <label className="text-sm font-medium">End Date</label>
                <Popover open={openEndDate} onOpenChange={setOpenEndDate}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal border-orange-200 text-orange-600 hover:bg-orange-50"
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

              {/* Generate Button */}
              <div className="w-full sm:w-auto">
                <Button
                  onClick={handleGenerateReceipts}
                  className="bg-orange-500 hover:bg-orange-600 text-white w-full sm:w-auto"
                  disabled={loading}
                >
                  {loading ? "Generating..." : "Generate Receipts"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
