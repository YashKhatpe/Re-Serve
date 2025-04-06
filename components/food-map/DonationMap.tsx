import { useState, useCallback, useMemo } from 'react';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import { Donation, useDonation } from "@/context/donation-context";
import DonationMarker from './DonationMarker';

interface DonationMapProps {
  donations: Donation[];
}

// Set the API key and libraries to load
const libraries = ['places'];

// Set default map options
const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

export default function DonationMap({ donations }: DonationMapProps) {
  // Group donations by location
  const groupedDonations = useMemo(() => {
    const groups: { [key: string]: Donation[] } = {};

    donations.forEach(donation => {
      // Create a key based on lat/lng with limited precision to group nearby points
      const key = `${donation.location.lat.toFixed(5)},${donation.location.lng.toFixed(5)}`;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(donation);
    });

    return groups;
  }, [donations]);

  // Calculate center point from all markers (average lat/lng)
  const center = donations.length > 0
    ? {
        lat: donations.reduce((sum, d) => sum + d.location.lat, 0) / donations.length,
        lng: donations.reduce((sum, d) => sum + d.location.lng, 0) / donations.length
      }
    : { lat: 20.5937, lng: 78.9629 }; // Default center (India)

  // Load the Google Maps JavaScript API
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: libraries as any
  });

  // Save the map instance when it's loaded
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Handle API loading error
  if (loadError) {
    return <div className="h-full flex items-center justify-center">Error loading maps</div>;
  }

  // Show loading state while API is loading
  if (!isLoaded) {
    return <div className="h-full flex items-center justify-center">Loading maps...</div>;
  }

  return (
    <div className="h-[600px] w-full rounded-lg overflow-hidden shadow-lg">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={13}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true,
        }}
      >
        {Object.entries(groupedDonations).map(([locationKey, donationsAtLocation]) => {
          const [lat, lng] = locationKey.split(',').map(Number);
          return (
            <DonationMarker
              key={locationKey}
              position={{ lat, lng }}
              donations={donationsAtLocation}
            />
          );
        })}
      </GoogleMap>
    </div>
  );
}