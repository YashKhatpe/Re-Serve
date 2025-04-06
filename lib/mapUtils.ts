/**
 * Extracts latitude and longitude from a Google Maps URL
 * @param url The Google Maps URL
 * @returns Object with the URL and lat/lng coordinates
 */
export function extractLocationFromMapUrl(url: string): {
  mapUrl: string;
  location: { lat: number; lng: number } | null;
} {
  // Check if the URL contains coordinates
  const regex = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
  const match = url.match(regex);

  if (match) {
    console.log("Match found:", match);
    return {
      mapUrl: url,
      location: {
        lat: parseFloat(match[1]),
        lng: parseFloat(match[2])
      }
    };
  }

  // If no coordinates found, return null for location
  return {
    mapUrl: url,
    location: null
  };
}

/**
 * Calculates the distance between two points using the Haversine formula
 * @param lat1 Latitude of first point
 * @param lng1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lng2 Longitude of second point
 * @returns Distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers

  return distance;
}
