"use client";
import { useAuth } from "@/context/auth-context";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

interface DonationLayoutProps {
  children: ReactNode;
}

export default function DonationLayout({ children }: DonationLayoutProps) {
  const { user, userType } = useAuth();

  if (!user || userType == "ngo") {
    redirect("/register?tab=donor");
  }

  return <>{children}</>;
}
