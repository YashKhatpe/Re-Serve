import { useState, useEffect } from 'react';
import { Marker, InfoWindow } from '@react-google-maps/api';
import { Donation, useDonation } from "@/context/donation-context";
import { format } from 'date-fns';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface DonationMarkerProps {
  donations: Donation[];
  position: { lat: number; lng: number };
}

export default function DonationMarker({ donations, position }: DonationMarkerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [icon, setIcon] = useState<google.maps.Icon | null>(null);
  const { setSelectedDonation } = useDonation();
  const router = useRouter();

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

  const handleDonationClick = (donation: Donation) => {
    setSelectedDonation(donation);
    router.push('/products');
  };

  return (
    <Marker
      position={position}
      onClick={() => setIsOpen(true)}
      onMouseOver={() => setIsOpen(true)}
      icon={icon || undefined}
    >
      {isOpen && (
        <InfoWindow
          position={position}
          onCloseClick={() => setIsOpen(false)}
        >
          <div className="donation-popup p-3 text-black max-w-xs">
            <h3 className="text-lg font-bold mb-2">{donations.length > 1 ? `${donations.length} Food Items Available` : donations[0].food_name}</h3>

            <div className="max-h-80 pr-1">
              {donations.map((donation) => (
                <div key={donation.id} className="mb-4 pb-3 border-b border-gray-200 last:border-0 last:mb-0 last:pb-0">
                  <div className="w-full h-32 relative mb-2 rounded-md overflow-hidden">
                    <Image
                      src={donation.food_image}
                      alt={donation.food_name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <h4 className="font-semibold text-base">{donation.food_name}</h4>
                  <div className="mt-1 text-sm">
                    <p><span className="font-semibold">Food Type:</span> {donation.food_type}</p>
                    <p><span className="font-semibold">Serves:</span> {donation.serves} people</p>
                    <p><span className="font-semibold">Storage:</span> {donation.storage}</p>
                    <p><span className="font-semibold">Expiry:</span> {format(new Date(donation.expiry_date_time), 'PPP')}</p>
                  </div>

                  <button
                    onClick={() => handleDonationClick(donation)}
                    className="mt-2 px-3 py-1 bg-emerald-600 text-white text-xs rounded hover:bg-emerald-700 transition-colors"
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          </div>
        </InfoWindow>
      )}
    </Marker>
  );
}