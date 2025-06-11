"use client";
import { useState } from "react";
import { redirect, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useAuth } from "@/context/auth-context";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";


const loginFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const { user } = useAuth();
  useEffect(() => {
    if (!isLoading && user) {
      router.push("/");
    }
  }, [isLoading, user]);


  const form = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: z.infer<typeof loginFormSchema>) {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) throw error;

      toast("Login Successful", {
        description: "You are now logged in.",
      });

      setIsRedirecting(true);

      setTimeout(async () => {
        const { data: donorData } = await supabase
          .from("donor")
          .select("id")
          .eq("email", data.email)
          .single();

        if (donorData) {
          router.push("/");
        } else {
          const { data: ngoData } = await supabase
            .from("ngo")
            .select("id")
            .eq("email", data.email)
            .single();

          if (ngoData) {
            router.push("/");
          } else {
            router.push("/");
          }
        }
      }, 1500);
    } catch (error: any) {
      toast("Login Failed", {
        description: error.message || "Invalid email or password.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      {/* Full-screen Loader during redirect */}
      {isRedirecting && (
  <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-[#F5F3F0] via-[#FDF8F5] to-[#F9F6F3] px-4">
    {/* Orange glow effect behind logo */}
    <div className="absolute w-64 h-64 bg-[#FF6B35] opacity-20 blur-3xl rounded-full z-0"></div>

    {/* Spinning sparkle in the top right corner */}
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

    <div className="relative z-10 flex flex-col items-center text-center space-y-4">
      <div className="h-20 w-20 rounded-full bg-white shadow-lg flex items-center justify-center">
        <Image src="/navlogo.png" alt="Logo" width={48} height={48} priority />
      </div>
      <h2 className="text-2xl font-bold text-[#2D3748] mt-2">Logging you in...</h2>
      <p className="text-[#718096]">Please wait while we log you into your dashboard.</p>

      {/* Rotating arrow loader */}
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
)}


      <div className="min-h-screen bg-gradient-to-br from-[#F5F3F0] via-[#FDF8F5] to-[#F9F6F3] flex flex-col">

        {/* Main content */}
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="flex flex-col md:flex-row gap-8 items-center justify-center max-w-4xl w-full">
            <div className="w-full md:w-1/2 hidden md:block">
              <div className="relative h-[400px] w-full rounded-lg overflow-hidden shadow-lg">
                <Image
                  src="/login.png"
                  alt="Food donation"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                  <h2 className="text-white text-2xl font-bold">
                    Making a difference, one donation at a time
                  </h2>
                </div>
              </div>
            </div>

            <div className="w-full md:w-1/2">
              <Card className="border shadow-md">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl font-bold">
                    Welcome Back
                  </CardTitle>
                  <CardDescription>
                    Sign in to your account to continue your mission
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="space-y-4"
                    >
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter your email"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Enter your password"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        className="w-full bg-[#FF6B35] hover:bg-[#E55A2B] text-white rounded-xl py-2 font-medium text-base shadow-md hover:shadow-lg transition-all"
                        disabled={isLoading}
                      >
                        {isLoading ? "Signing in..." : "Sign In"}
                      </Button>
                    </form>
                  </Form>

                  <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                      Don't have an account?{" "}
                      <Link
                        href="/register"
                        className="text-[#FF6B35] font-medium hover:underline"
                      >
                        Register here
                      </Link>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
