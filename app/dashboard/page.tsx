"use client";
import { useAuth } from "@/context/auth-context";
import DonorDashboard from "../(donor)/donor-dashboard/page";
import NgoDashboard from "../(ngo)/ngo-dashboard/page";
export default function Dashboard() {
    const { userType } = useAuth();

    if (userType == "donor") {
        return <DonorDashboard />;
    } else {
        return <NgoDashboard />;
    }
}
