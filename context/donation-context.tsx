"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export type Donation = {
  id: string;
  food_name: string;
  food_image: string;
  food_type: string;
  preparation_date_time: string;
  address_map_link: string;
  serves: number;
  storage: string;
  preferred_pickup_time: string;
  distance: number;
  donor_id: number;
  location: {
    lat: number;
    lng: number;
  };
};

type DonationContextType = {
  selectedDonation: Donation | null;
  setSelectedDonation: (donation: Donation | null) => void;
};

// Create the context with default values
const DonationContext = createContext<DonationContextType>({
  selectedDonation: null,
  setSelectedDonation: () => {},
});

// Create a provider component
export function DonationProvider({ children }: { children: ReactNode }) {
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(
    null
  );

  return (
    <DonationContext.Provider value={{ selectedDonation, setSelectedDonation }}>
      {children}
    </DonationContext.Provider>
  );
}

// Create a custom hook to use the context
export function useDonation() {
  return useContext(DonationContext);
}
