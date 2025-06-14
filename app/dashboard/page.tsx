"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import DonorDashboard from "../(donor)/donor-dashboard/page";
import NgoDashboard from "../(ngo)/ngo-dashboard/page";
import { DashNavbar } from "@/components/DashNavbar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import DashOrderDetails from "@/components/DashOrderDetails";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Navbar } from "@/components/Navbar";
import { useIsMobile } from "@/lib/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import GenerateReceipt from "@/components/GenerateReceipt";
import Badges from "@/components/Badges";
import ReceiptHistory from "@/components/dashboard/ReceiptHistory";
import CurrentOrders from "@/components/CurrentOrders";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const { user, userType } = useAuth();
  const [activeComponent, setActiveComponent] = useState<string>("dashboard");
  const isMobile = useIsMobile();
  const router = useRouter();
  useEffect(() => {
    if (!user) router.replace("/login");
  }, []);
  return (
    <div className="bg-gray-50">
      <DashNavbar />
      <div className="flex h-screen overflow-hidden">
        {isMobile ? (
          <SidebarProvider>
            <Sheet>
              <SheetTrigger asChild>
                <button className="p-2 m-2">
                  <Menu />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64">
                <div className="h-full overflow-y-auto">
                  <AppSidebar
                    setActiveComponent={setActiveComponent}
                    userType={userType}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </SidebarProvider>
        ) : (
          <SidebarProvider>
            <AppSidebar
              setActiveComponent={setActiveComponent}
              userType={userType}
            />
          </SidebarProvider>
        )}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="px-6 pb-6">
            {activeComponent === "dashboard" && userType === "donor" && (
              <DonorDashboard />
            )}
            {activeComponent === "dashboard" && userType === "ngo" && (
              <NgoDashboard />
            )}
            {activeComponent === "generate-receipt" && userType === "donor" && (
              <GenerateReceipt />
            )}
            {activeComponent === "orders" && <DashOrderDetails />}
            {activeComponent === "current-orders" && <CurrentOrders />}
            {activeComponent === "badges" && userType === "donor" && <Badges />}
            {activeComponent === "receipts" && <ReceiptHistory />}
          </div>
        </main>
      </div>
    </div>
  );
}
