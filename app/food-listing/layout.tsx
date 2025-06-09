"use client";
import { useAuth } from "@/context/auth-context";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

interface FoodListingProps {
  children: ReactNode;
}

export default function FoodListingLayout({ children }: FoodListingProps) {
  const { user, userType } = useAuth();

  if (!user || userType == "donor") {
    redirect("/register?tab=ngo");
  }

  return <>{children}</>;
}
