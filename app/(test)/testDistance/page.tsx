'use client';

import { useState } from 'react';

export default function Home() {
  const [distance, setDistance] = useState(null);
  const [error, setError] = useState<String | null>(null);

  const fetchDistance = async () => {
    setError(null);
    setDistance(null);
    
    const url1 = "https://maps.app.goo.gl/vQ7RjSroFAbpqB9S6";
    const url2 = "https://maps.app.goo.gl/pvaAbYpP1Z5yk6t97";

    try {
      const response = await fetch('/api/getDistance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url1, url2 }),
      });

      const data = await response.json();
      if (response.ok) {
        setDistance(data.distance);
      } else {
        setError(data.error || 'Something went wrong');
      }
    } catch (err) {
      setError('Failed to fetch data');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Get Distance</h1>
      <button 
        onClick={fetchDistance} 
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700">
        Get Distance
      </button>
      {distance !== null && (
        <p className="mt-4 text-green-500">Distance: {distance} km</p>
      )}
      {error && (
        <p className="mt-4 text-red-500">Error: {error}</p>
      )}
    </div>
  );
}
