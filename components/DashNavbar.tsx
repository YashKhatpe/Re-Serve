"use client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";

export function DashNavbar() {
  const { userType, loading } = useAuth();

  return (
    <nav className="w-full top-0 left-0 right-0 z-20 flex items-center justify-between p-6">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center space-x-1.5"
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
        <Link
          href="/"
          className="text-gray-700 hover:text-orange-500 transition-colors"
        >
          Home
        </Link>
        <Link
          href="#how-it-works"
          className="text-gray-700 hover:text-orange-500 transition-colors"
        >
          How It Works
        </Link>
        <Link
          href="#features"
          className="text-gray-700 hover:text-orange-500 transition-colors"
        >
          Features
        </Link>
        <Link
          href="#about"
          className="text-gray-700 hover:text-orange-500 transition-colors"
        >
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
                <Link href="/dashboard">
                  <Button
                    variant="outline"
                    className="border-orange-500 text-orange-500 hover:bg-orange-50 px-6 py-2 rounded-full font-semibold"
                  >
                    Dashboard
                  </Button>
                </Link>
              )}
            </>
          )}
        </div>
      </motion.div>
    </nav>
  );
}
