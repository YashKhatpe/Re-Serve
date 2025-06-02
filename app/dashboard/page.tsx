"use client";
import { useAuth } from "@/context/auth-context";
import DonorDashboard from "../(donor)/donor-dashboard/page";
import NgoDashboard from "../(ngo)/ngo-dashboard/page";
import { DashNavbar } from "@/components/DashNavbar";

export default function Dashboard() {
  const { userType } = useAuth();

  return (
    <>
      {/* <DashNavbar /> */}
      {/* <main className="pt-20"> */}
      {/* Adjust 'pt-16' to match your Navbar's height */}
      {userType === "donor" ? <DonorDashboard /> : <NgoDashboard />}
      {/* </main> */}
    </>
  );
}
