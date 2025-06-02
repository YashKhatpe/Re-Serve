import { Button } from "@/components/ui/button";
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

export default function NgoDashboard() {
  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-64 flex-shrink-0">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* <Header /> */}
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
                {/* <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button> */}
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
                value="500 Meals"
                change="+2.5% "
                trend="up"
              />
              <StatsCard
                icon={<ShoppingCart className="h-5 w-5 text-white" />}
                iconBg="bg-orange-400"
                title="Total Donations Received"
                value="300 Donations"
                change="+1.5% "
                trend="down"
              />
              <StatsCard
                icon={<Package className="h-5 w-5 text-white" />}
                iconBg="bg-orange-300"
                title="Meals Received From"
                value="5 Locations"
                change="+4.5% "
                trend="up"
              />
              <StatsCard
                icon={<Users className="h-5 w-5 text-white" />}
                iconBg="bg-orange-600"
                title="New Volunteers"
                value="8"
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
            >
              {/* <CustomerSatisfaction /> */}
              {/* <TargetVsReality /> */}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* <TopProducts /> */}
              {/* <SalesMapping /> */}
              {/* <VolumeVsService /> */}
            </motion.div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
