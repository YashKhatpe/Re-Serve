"use client";
import React, { useState } from "react";
import { useAuth } from "@/context/auth-context";
import DonorDashboard from "../(donor)/donor-dashboard/page";
import NgoDashboard from "../(ngo)/ngo-dashboard/page";
import { DashNavbar } from "@/components/DashNavbar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import {
  Settings,
  Users,
  Package,
  LineChart,
  CreditCard,
  Building,
} from "lucide-react";
import DashOrderDetails from "@/components/DashOrderDetails";
import { SidebarProvider } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const { userType } = useAuth();
  const [activeComponent, setActiveComponent] = useState<string>(
    userType === "donor" ? "donor-dashboard" : "ngo-dashboard"
  );

  return (
    <>
      {/* <DashNavbar /> */}
      <div className="flex h-screen overflow-hidden">
        <SidebarProvider>
          <AppSidebar
            setActiveComponent={setActiveComponent}
            userType={userType}
          />
        </SidebarProvider>
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-6">
            {activeComponent === "dashboard" && userType === "donor" && (
              <DonorDashboard />
            )}
            {activeComponent === "dashboard" && userType === "ngo" && (
              <NgoDashboard />
            )}
            {activeComponent === "generate-receipt" && (
              <div>Generate Receipt Component</div>
            )}
            {activeComponent === "orders" && <DashOrderDetails />}
            {/* Add other components based on activeComponent state */}
          </div>
        </main>
      </div>
    </>
  );
}
