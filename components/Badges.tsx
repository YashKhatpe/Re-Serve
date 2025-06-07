'use client';

import { JSX, useEffect, useState } from 'react';
import { Share2, Lock, Star, BadgeCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/context/auth-context';

type Badge = {
  title: string;
  description: string;
  required: number;
  icon: JSX.Element;
};

const BADGES: Badge[] = [
  {
    title: 'Bronze Achievement',
    description: 'First milestone reached!',
    required: 100,
    icon: <BadgeCheck className="text-orange-500 w-10 h-10" />,
  },
  {
    title: 'Silver Champion',
    description: 'Making a real difference!',
    required: 250,
    icon: <BadgeCheck className="text-orange-500 w-10 h-10" />,
  },
  {
    title: 'Gold Hero',
    description: 'Community champion!',
    required: 500,
    icon: <Lock className="text-gray-300 w-10 h-10" />,
  },
];

export default function Badges() {
  const { user } = useAuth();
  const donorId = user?.id;

  const [mealsServed, setMealsServed] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!donorId) {
        console.warn('Donor ID not available yet');
        return;
      }

      try {
        const res = await fetch(`/api/donor-dashboard-data?donor_id=${donorId}`);
        if (!res.ok) throw new Error('Failed to fetch badge data');
        const data = await res.json();

        console.log('Fetched badge data:', data); // DEBUG LOG

        // Adjust key if necessary (based on your actual API response structure)
        setMealsServed(data.noOfPeopleServed ?? 0);
      } catch (err: any) {
        console.error('Error fetching badge data:', err.message);
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [donorId]);

  const getBadgeStatus = (badge: Badge) => {
    if (mealsServed === null) return 'loading';
    return mealsServed >= badge.required ? 'unlocked' : 'locked';
  };

  const currentBadgeIndex =
    mealsServed !== null
      ? BADGES.map((b) => b.required).filter((r) => mealsServed >= r).length - 1
      : -1;

  return (
    <div className="mt-10 text-orange-600">
      <h2 className="text-2xl font-bold mb-6 text-center">Your Badges</h2>

      <div className="max-w-xl mx-auto mb-10 text-center">
        {loading && <p className="text-gray-500">Loading your progress...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && (
          <p className="text-xl font-semibold">
            Total Meals Served: <span className="text-orange-700">{mealsServed}</span>
          </p>
        )}
      </div>

      {!loading && !error && mealsServed === 0 && (
        <div className="text-center text-sm text-gray-500 mb-10">
          You haven’t served any meals yet. Start donating to earn your first badge!
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {BADGES.map((badge, index) => {
          const status = getBadgeStatus(badge);
          const isCurrent = index === currentBadgeIndex;
          const progressPercent =
            mealsServed !== null
              ? Math.min((mealsServed / badge.required) * 100, 100)
              : 0;

          return (
            <div
              key={badge.title}
              className={cn(
                'rounded-lg shadow-lg p-6 flex flex-col items-center bg-white border',
                status === 'locked'
                  ? 'border-gray-200 text-gray-400'
                  : 'border-orange-300 text-orange-700',
                isCurrent && 'ring-4 ring-orange-400 relative',
                'transition-transform hover:scale-105'
              )}
              tabIndex={0}
            >
              {isCurrent && (
                <div className="absolute -top-4 bg-orange-500 text-white px-3 py-1 rounded-full flex items-center gap-2 text-sm font-semibold shadow-lg">
                  <Star size={16} /> Current Badge
                </div>
              )}

              <div className="mb-4">{badge.icon}</div>
              <h3 className="text-xl font-bold text-center mb-1">{badge.title}</h3>
              <p className="text-sm text-center mb-4">{badge.description}</p>
              <div className="text-4xl font-extrabold mb-1">{badge.required}</div>
              <div className="text-xs uppercase tracking-wide mb-4">Meals Required</div>

              {status === 'locked' && mealsServed !== null && (
                <>
                  <div className="w-full mb-2 flex justify-between text-xs font-semibold">
                    <span>Progress</span>
                    <span>{Math.floor(progressPercent)}%</span>
                  </div>
                  <Progress value={progressPercent} className="h-3 rounded-lg mb-3" />
                  <p className="text-center text-xs mb-3">
                    {badge.required - mealsServed} more meals to unlock
                  </p>
                  <div className="flex items-center text-gray-400 space-x-1">
                    <Lock className="w-5 h-5" />
                    <span className="text-sm font-medium">Locked</span>
                  </div>
                </>
              )}

              {status === 'unlocked' && (
                <Button
                  variant="secondary"
                  className="mt-auto bg-gradient-to-r from-orange-400 to-yellow-400 text-white font-semibold hover:from-orange-500 hover:to-yellow-500"
                  onClick={() => alert(`Share your achievement: ${badge.title}`)}
                >
                  <Share2 className="w-5 h-5 mr-2" />
                  Share Achievement
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
