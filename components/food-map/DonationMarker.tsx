import { useState, useEffect } from 'react';
import { Marker, InfoWindow } from '@react-google-maps/api';
import { Donation, useDonation } from "@/context/donation-context";

interface DonationMarkerProps {
  donation: Donation;
}

export default function DonationMarker({ donation }: DonationMarkerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [icon, setIcon] = useState<google.maps.Icon | null>(null);

  useEffect(() => {
    // Set the icon only after the component is mounted in the browser
    if (typeof window !== 'undefined') {
      setIcon({
        url: '/food-marker.png',
        scaledSize: new google.maps.Size(32, 32),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(16, 32)
      });
    }
  }, []);

  return (
    <Marker 
      position={{ lat: donation.location.lat, lng: donation.location.lng }}
      onClick={() => setIsOpen(true)}
      onMouseOver={() => setIsOpen(true)}
      onMouseOut={() => setIsOpen(false)}
      icon={icon || undefined}
    >
      {isOpen && (
        <InfoWindow
          position={{ lat: donation.location.lat, lng: donation.location.lng }}
          onCloseClick={() => setIsOpen(false)}
        >
          <div className="donation-popup p-2 text-black">
            <h3 className="text-lg font-bold">{donation.name}</h3>
            <p className="text-sm">{donation.description}</p>
            <div className="mt-2">
              <p><span className="font-semibold">Food Type:</span> {donation.foodType}</p>
              <p><span className="font-semibold">Quantity:</span> {donation.quantity}</p>
              <p><span className="font-semibold">Expiry Date:</span> {donation.expiryDate}</p>
              <p><span className="font-semibold">Address:</span> {donation.location.address}</p>
              <p><span className="font-semibold">Contact:</span> {donation.contactInfo}</p>
            </div>
          </div>
        </InfoWindow>
      )}
    </Marker>
  );
} 