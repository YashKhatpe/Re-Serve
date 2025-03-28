"use client";

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';


export function Navbar() {
  const { userType, loading } = useAuth();
  // console.log("User Type is : ", userType)

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* <Heart className="h-5 w-5" /> */}
          <Image
            src="/navlogo.png"
            alt="Food donation"
            width={50}
            height={50}
            className=""
            priority
          />
          <span className="font-bold text-lg">ReServe</span>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <a href="#how-it-works" className="text-lg font-medium">How it works</a>
          <a href="#impact" className="text-lg font-medium">Impact</a>
          <a href="#benefits" className="text-lg font-medium">Benefits</a>
        </nav>

        <div className="flex items-center gap-2">
          {!loading && (
            <>

              {userType === "donor" && (

                <Link href="/donate">
                  <Button variant="default" className="bg-emerald-600 hover:bg-emerald-700 cursor-pointer">Donate</Button>
                </Link>
              )}
              {userType === 'ngo' && (
                <Link href="/food-listing">
                  <Button variant="default" className="bg-emerald-600 hover:bg-emerald-700 cursor-pointer">Request Food</Button>
                </Link>

              )}


              {!userType ? (
                <>
                  <Link href="/register">
                    <Button variant="outline" className="bg-stone-100 hover:bg-stone-200 cursor-pointer">Sign up</Button>
                  </Link>
                  <Link href="/login">
                    <Button variant="outline" className="bg-stone-100 hover:bg-stone-200 cursor-pointer">Log In</Button>
                  </Link>
                </>

              ) : (

                <Link href="/sign-out">
                  <Button variant="outline" className="bg-stone-100 hover:bg-stone-200 cursor-pointer">Sign Out</Button>
                </Link>
              )
              }
            </>

          )}
        </div>
      </div>
    </header>
  )
}