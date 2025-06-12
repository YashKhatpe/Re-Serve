"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/context/auth-context";

export default function SignOut() {
  const { signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const logout = async () => {
      const { error } = await signOut();

      if (error) {
        console.error("Error signing out:", error);
      }

      // Redirect after sign out regardless of error
      router.replace("/login");
    };

    logout();
  }, [router]);
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-[#F5F3F0] via-[#FDF8F5] to-[#F9F6F3] px-4">
      {/* Glow and spinner UI stays the same */}
      <div className="relative z-10 flex flex-col items-center text-center space-y-4">
        <div className="h-20 w-20 rounded-full bg-white shadow-lg flex items-center justify-center">
          <Image src="/navlogo.png" alt="Signing out" width={48} height={48} />
        </div>
        <h2 className="text-2xl font-bold text-[#2D3748]">Signing out...</h2>
        <p className="text-[#718096]">Please wait while we sign you out.</p>
        <svg
          className="h-8 w-8 text-[#FF6B35] animate-spin mx-auto mt-6"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
          />
        </svg>
      </div>
    </div>
  );
}
