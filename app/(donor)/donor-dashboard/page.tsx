"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sidebar } from "@/components/sidebar";
import { StatsCard } from "@/components/dashboard/stats-card";
import { TotalRevenue } from "@/components/dashboard/total-revenue";
import { VisitorInsights } from "@/components/dashboard/visitor-insights";
import { DollarSign, ShoppingCart, Package, Users, Download } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const [loading, setLoading] = useState(false);

  // ✅ Export Orders Function (Excel)
  const handleExport = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3000/api/excelExport");

      if (!response.ok) {
        console.error("Failed to download Excel file", response);
        throw new Error(`Failed to download Excel file: ${response}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "orders.xlsx";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading Excel:", error);
    }
    setLoading(false);
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
                <Button onClick={handleExport} variant="outline" size="sm" className="gap-2">
                  <Download className="h-4 w-4" />
                  {loading ? "Exporting..." : "Export to Excel"}
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
