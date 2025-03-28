'use client';

import dynamic from 'next/dynamic';
import { Donation, useDonation } from "@/context/donation-context";

// Import the map component dynamically
const DonationMapWithNoSSR = dynamic(
  () => import('./DonationMap'),
  { 
    ssr: false,
    loading: () => <div className="h-[600px] w-full bg-gray-100 flex items-center justify-center">Loading map...</div>
  }
);

interface MapClientWrapperProps {
  donations: Donation[];
}

export default function MapClientWrapper({ donations }: MapClientWrapperProps) {
  return <DonationMapWithNoSSR donations={donations} />;
} 