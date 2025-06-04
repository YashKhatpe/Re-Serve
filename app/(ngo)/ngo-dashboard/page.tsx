"use client";
import React, { useEffect, useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { StatsCard } from "@/components/dashboard/stats-card";
import { VisitorInsights } from "@/components/dashboard/visitor-insights";
import { TotalRevenue } from "@/components/dashboard/total-revenue";
import { CustomerSatisfaction } from "@/components/dashboard/customer-satisfaction";
import { TargetVsReality } from "@/components/dashboard/target-vs-reality";
import { TopProducts } from "@/components/dashboard/top-products";
import { VolumeVsService } from "@/components/dashboard/volume-vs-service";
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  Download,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";

export default function NgoDashboard() {
  const [data, setData] = useState<{
    totalMealsServed: number;
    totalDonations: number;
    uniqueDonors: number;
    newVolunteers: { name: string; phone: string; joined: string }[];
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const ngoId = user?.id;

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/ngo-dashboard-data?ngo_id=${ngoId}`);
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
  }, [ngoId]);

  return (
    <div className="flex">
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">
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
              className="flex justify-between items-center"
            >
              <div>
                <h2 className="text-lg font-medium text-orange-600">
                  Today's Serves
                </h2>
                <p className="text-sm text-gray-500">Serves summary</p>
              </div>
              <div className=" flex gap-3">
                <Link href="/food-listing">
                  <Button
                    variant="default"
                    className="bg-orange-500 hover:bg-orange-600 cursor-pointer"
                  >
                    Request Food
                  </Button>
                </Link>
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
                title="Total Meals Served"
                value={loading ? "..." : `${data?.totalMealsServed ?? 0} Meals`}
                change="+2.5% "
                trend="up"
              />
              <StatsCard
                icon={<ShoppingCart className="h-5 w-5 text-white" />}
                iconBg="bg-orange-400"
                title="Total Donations Received"
                value={
                  loading ? "..." : `${data?.totalDonations ?? 0} Donations`
                }
                change="+1.5% "
                trend="down"
              />
              <StatsCard
                icon={<Package className="h-5 w-5 text-white" />}
                iconBg="bg-orange-300"
                title="Meals Received From"
                value={loading ? "..." : `${data?.uniqueDonors ?? 0} Locations`}
                change="+4.5% "
                trend="up"
              />
              <StatsCard
                icon={<Users className="h-5 w-5 text-white" />}
                iconBg="bg-orange-600"
                title="New Volunteers"
                value={loading ? "..." : `${data?.newVolunteers?.length ?? 0}`}
                change="+0.5% "
                trend="up"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              <TotalRevenue />
              <VisitorInsights />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            ></motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            ></motion.div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
