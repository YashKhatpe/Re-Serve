"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/auth-context";

export function Navbar() {
  const { userType, loading } = useAuth();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  return (
    <>
      {/* Loader overlay when redirecting to dashboard */}
      {isRedirecting && (
  <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-[#F5F3F0] via-[#FDF8F5] to-[#F9F6F3] px-4">
    {/* Orange glow behind center */}
    <div className="absolute w-64 h-64 bg-[#FF6B35] opacity-20 blur-3xl rounded-full z-0"></div>

    {/* Spinning sparkle element */}
    <div className="absolute top-10 right-10 animate-spin-slow z-0 opacity-30">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="48"
        height="48"
        fill="#FF6B35"
        viewBox="0 0 24 24"
      >
        <path d="M12 0l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" />
      </svg>
    </div>

    {/* Main loader content */}
    <div className="relative z-10 flex flex-col items-center text-center space-y-4">
      <div className="h-20 w-20 rounded-full bg-white shadow-lg flex items-center justify-center">
        <Image src="/navlogo.png" alt="Loading logo" width={48} height={48} />
      </div>
      <h2 className="text-2xl font-bold text-[#2D3748]">Redirecting to Dashboard...</h2>
      <p className="text-[#718096]">Please wait a moment.</p>
      <div>
        <svg
          className="h-8 w-8 text-[#FF6B35] animate-spin mx-auto"
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
  </div>
)}


      <nav className="w-full sticky top-0 left-0 z-20 flex items-center justify-between h-20 px-6 bg-gradient-to-br from-orange-50 to-red-50">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center space-x-2"
        >
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">R</span>
          </div>
          <span className="text-2xl font-bold text-gray-800">Re-Serve</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="hidden md:flex items-center space-x-8"
        >
          <Link href="/" className="text-gray-700 hover:text-orange-500 transition-colors">
            Home
          </Link>
          <Link href="/how-it-works" className="text-gray-700 hover:text-orange-500 transition-colors">
            How It Works
          </Link>
          <Link href="/features" className="text-gray-700 hover:text-orange-500 transition-colors">
            Features
          </Link>
          <Link href="/about" className="text-gray-700 hover:text-orange-500 transition-colors">
            About Us
          </Link>

          <div className="flex items-center space-x-2">
            {!loading && (
              <>
                {userType === "donor" && (
                  <Link href="/donate">
                    <Button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-full font-semibold">
                      Donate
                    </Button>
                  </Link>
                )}
                {userType === "ngo" && (
                  <Link href="/food-listing">
                    <Button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-full font-semibold">
                      Request Food
                    </Button>
                  </Link>
                )}
                {!userType ? (
                  <>
                    <Link href="/register">
                      <Button
                        variant="outline"
                        className="border-orange-500 text-orange-500 hover:bg-orange-50 px-6 py-2 rounded-full font-semibold"
                      >
                        Sign up
                      </Button>
                    </Link>
                    <Link href="/login">
                      <Button
                        variant="outline"
                        className="border-orange-500 text-orange-500 hover:bg-orange-50 px-6 py-2 rounded-full font-semibold"
                      >
                        Log In
                      </Button>
                    </Link>
                  </>
                ) : (
                  <Link href="/sign-out">
                    <Button
                      variant="outline"
                      className="border-orange-500 text-orange-500 hover:bg-orange-50 px-6 py-2 rounded-full font-semibold"
                    >
                      Sign Out
                    </Button>
                  </Link>
                )}
                {userType && (
                  <Button
                    onClick={() => {
                      setIsRedirecting(true);
                      setTimeout(() => router.push("/dashboard"), 1200);
                    }}
                    variant="outline"
                    className="border-orange-500 text-orange-500 hover:bg-orange-50 px-6 py-2 rounded-full font-semibold"
                  >
                    Dashboard
                  </Button>
                )}
              </>
            )}
          </div>
        </motion.div>
      </nav>
    </>
  );
}
