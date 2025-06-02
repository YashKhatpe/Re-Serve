"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BarChart2,
  ShoppingCart,
  Package,
  FileBarChart,
  MessageSquare,
  Settings,
  LogOut,
} from "lucide-react";
import Image from "next/image";

const sidebarItems = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Order",
    href: "/order-details",
    icon: ShoppingCart,
  },
  {
    name: "Sales Report",
    href: "/sales-report",
    icon: FileBarChart,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-screen flex-col bg-white border-r">
      <div className="flex h-14 items-center border-b px-4">
        <div className="flex items-center gap-2">
          <Image src="/navlogo.png" width={50} height={50} alt="ReServe" />
          <span className="font-bold text-lg">ReServe</span>
        </div>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-2 gap-1">
          {sidebarItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Link
                key={index}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-indigo-600",
                  pathname === item.href
                    ? "bg-indigo-600 text-white hover:text-white"
                    : "text-gray-500"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="mt-auto p-4">
        <Link
          href="/sign-out"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-500 transition-all hover:text-indigo-600"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Link>
      </div>
    </div>
  );
}
