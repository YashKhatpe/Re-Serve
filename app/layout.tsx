import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { DonationProvider } from "@/context/donation-context";
import { AuthProvider } from '@/context/auth-context'
import { SidebarProvider } from "@/components/ui/sidebar";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Donation Hub - Donate Food to Those in Need",
  description:
    "Donate your excess food to help those in need in your community. Easy, tax-deductible, and makes a real difference.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <DonationProvider>
              <SidebarProvider>
                {children}

              </SidebarProvider>
            </DonationProvider>
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
