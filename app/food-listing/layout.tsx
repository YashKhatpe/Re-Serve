"use client";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";

interface FoodListingProps {
  children: ReactNode;
}

export default function FoodListingLayout({ children }: FoodListingProps) {
  const { user, userType, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || userType === "donor")) {
      router.replace("/register?tab=donor");
    }
  }, [user, userType, loading, router]);

  return <>{children}</>;
}
