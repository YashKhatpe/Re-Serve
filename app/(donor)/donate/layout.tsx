"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";

interface DonationLayoutProps {
  children: ReactNode;
}
export default function DonationLayout({ children }: DonationLayoutProps) {
  const { user, userType, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || userType === "ngo")) {
      router.replace("/register?tab=donor");
    }
  }, [user, userType, loading, router]);

  return <>{children}</>;
}
