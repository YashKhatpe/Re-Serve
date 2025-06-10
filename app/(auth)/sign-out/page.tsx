"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";

export default function SignOut() {
  const router = useRouter();

  useEffect(() => {
    const signOut = async () => {
      await supabase.auth.signOut();
      // Redirect to login page after sign out
      router.push("/login");
    };

    signOut();
  }, [router]);

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 p-8">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="mb-4 h-48 w-48 rounded-full flex items-center justify-center">
            <Image
              src="/navlogo.png"
              alt="Food donation"
              width={70}
              height={70}
              className=""
              priority
            />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Signing out...</h2>
          <p className="mt-2 text-gray-600">
            Please wait while we sign you out.
          </p>
          <div className="mt-8">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto" />
          </div>
        </div>
      </div>
    </div>
  );
}
