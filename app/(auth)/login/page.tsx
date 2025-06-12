'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
      {isRedirecting && (
        <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-50 space-y-6 text-center px-4">
          <Image
            src="/navlogo.png"
            alt="Login Illustration"
            width={64}
            height={64}
          />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Logging you in...</h2>
            <p className="text-gray-600">
              Please wait while we log you into your dashboard.
            </p>
          </div>
          <div className="h-6 w-6 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      <div className="min-h-screen bg-gradient-to-br from-[#F5F3F0] via-[#FDF8F5] to-[#F9F6F3] flex items-center justify-center">
        <div className="container mx-auto px-6 py-12">
          <div className="flex flex-col lg:flex-row gap-12 items-center justify-around min-h-[70vh]">
            {/* Left Side - Hero Content */}
            <div className="hidden lg:block w-full lg:w-1/2 space-y-6">
              <div className="space-y-2">
                <h1 className="text-4xl lg:text-5xl font-bold text-[#2D3748] leading-tight">
                  Welcome Back to <span className="text-[#FF6B35]">Re-Serve</span>
                </h1>
                <p className="text-lg text-[#718096] leading-relaxed max-w-lg">
                  Continue your mission of reducing food waste and serving those in
                  need. Together, we make every meal matter.
                </p>
                <div className="mt-4 text-sm text-gray-600">
                  New here?{" "}
                  <Link href="/register">
                    <button className="w-24 h-8 bg-[#FF6B35] text-white hover:bg-[#E55A2B] rounded-xl font-medium text-base shadow-lg hover:shadow-xl transition-all">
                      Register
                    </button>
                  </Link>
                </div>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#FF6B35]">500+</div>
                  <div className="text-sm text-[#718096]">Meals Served</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#FF6B35]">50+</div>
                  <div className="text-sm text-[#718096]">Partner NGOs</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#FF6B35]">25+</div>
                  <div className="text-sm text-[#718096]">Restaurants</div>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="relative hidden lg:block">
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-[#FED7D7] rounded-full opacity-60"></div>
                <div className="absolute top-8 -right-8 w-8 h-8 bg-[#C6F6D5] rounded-full opacity-80"></div>
                <div className="absolute -top-8 right-4 w-12 h-12 bg-[#FEFCBF] rounded-full opacity-70"></div>
              </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 max-w-md mx-auto">
              <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl font-bold text-[#2D3748]">
                    Login
                  </CardTitle>
                  <CardDescription className="text-[#718096]">
                    Sign in to your account to continue your mission
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[#4A5568] font-medium">
                              Email
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter your email"
                                {...field}
                                className="rounded-xl border-[#E8E5E1] bg-white/70 focus:border-[#FF6B35] focus:ring-[#FF6B35] transition-colors"
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
                            <FormLabel className="text-[#4A5568] font-medium">
                              Password
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Enter your password"
                                {...field}
                                className="rounded-xl border-[#E8E5E1] bg-white/70 focus:border-[#FF6B35] focus:ring-[#FF6B35] transition-colors"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        className="w-full bg-[#FF6B35] text-white hover:bg-[#E55A2B] rounded-xl font-medium text-base shadow-lg hover:shadow-xl transition-all"
                        disabled={isLoading}
                      >
                        {isLoading ? "Logging in..." : "Login"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
