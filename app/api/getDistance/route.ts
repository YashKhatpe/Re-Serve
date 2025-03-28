import type { NextRequest } from "next/server";
import axios from "axios";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    console.log("Request body:", body);
    const { url1, url2 } = JSON.parse(body);

    const res1 = await axios.get(url1, { maxRedirects: 0, validateStatus: null });
    const res2 = await axios.get(url2, { maxRedirects: 0, validateStatus: null });

    const longUrl1 = res1.headers.location;
    const longUrl2 = res2.headers.location;

    const extractLatLng = (url: string) => {
      const regex = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
      const match = url.match(regex);
      if (match) {
        return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
      }
      return null;
    };

    const loc1 = extractLatLng(longUrl1);
    const loc2 = extractLatLng(longUrl2);


    if (!loc1 || !loc2) {
      return new Response(JSON.stringify({ error: `Invalid URLs ${body} ${loc1 ? loc1.lat : 'unknown'} ${loc2 ? loc2.lat : 'unknown'}` }), { status: 400 });
    }

    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 6371; // Radius of the Earth in kilometers
      const dLat = (lat2 - lat1) * (Math.PI / 180);
      const dLon = (lon2 - lon1) * (Math.PI / 180);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c; // Distance in kilometers
      return distance;
    };

    const distance = calculateDistance(loc1.lat, loc1.lng, loc2.lat, loc2.lng);

    return new Response(JSON.stringify({ distance }), { status: 200 });
  } catch (error) {
    console.error("Error parsing request body:", error);
    return new Response(JSON.stringify({ error: "Invalid request body" }), { status: 400 });
  }
}
