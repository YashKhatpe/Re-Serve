"use client";

import { JSX, useEffect, useRef, useState } from "react";
import { Share2, Lock, Star, BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/context/auth-context";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Certificate from "@/components/Certificate";

type Badge = {
  title: string;
  description: string;
  required: number;
  icon: JSX.Element;
};

const BADGES: Badge[] = [
  {
    title: "Bronze Achievement",
    description: "First milestone reached!",
    required: 100,
    icon: <BadgeCheck size={40} color="#f97316" />, // orange-500
  },
  {
    title: "Silver Champion",
    description: "Making a real difference!",
    required: 250,
    icon: <BadgeCheck size={40} color="#f97316" />,
  },
  {
    title: "Gold Hero",
    description: "Community champion!",
    required: 500,
    icon: <Lock size={40} color="#d1d5db" />, // gray-300
  },
];

// Helper to recursively override oklch variables on all descendants
function overrideOklchVars(root: HTMLElement) {
  const elements = [
    root,
    ...Array.from(root.querySelectorAll<HTMLElement>("*")),
  ];
  const prevVarsMap = new Map<HTMLElement, { [key: string]: string }>();

  elements.forEach((el) => {
    const style = getComputedStyle(el);
    const prevVars: { [key: string]: string } = {};
    for (let i = 0; i < style.length; i++) {
      const prop = style[i];
      const value = style.getPropertyValue(prop);
      if (value.includes("oklch")) {
        prevVars[prop] = el.style.getPropertyValue(prop);
        if (prop.includes("background") || prop.includes("card")) {
          el.style.setProperty(prop, "#fff");
        } else if (prop.includes("foreground") || prop.includes("text")) {
          el.style.setProperty(prop, "#1f2937");
        } else if (prop.includes("border")) {
          el.style.setProperty(prop, "#e5e7eb");
        } else {
          el.style.setProperty(prop, "#fff");
        }
      }
    }
    if (Object.keys(prevVars).length > 0) {
      prevVarsMap.set(el, prevVars);
    }
  });

  return prevVarsMap;
}

// Helper to restore previous variables
function restoreOklchVars(
  prevVarsMap: Map<HTMLElement, { [key: string]: string }>
) {
  prevVarsMap.forEach((prevVars, el) => {
    for (const prop in prevVars) {
      el.style.setProperty(prop, prevVars[prop]);
    }
  });
}

// Helper to aggressively override all oklch color values on all descendants and on body/html
function overrideOklchAllColors(root: HTMLElement) {
  const elements = [
    root,
    ...Array.from(root.querySelectorAll<HTMLElement>("*")),
  ];
  const prevStyles = new Map<HTMLElement, { [key: string]: string }>();

  elements.forEach((el) => {
    const computed = getComputedStyle(el);
    const prev: { [key: string]: string } = {};

    // Patch backgroundColor
    if (computed.backgroundColor.includes("oklch")) {
      prev.backgroundColor = el.style.backgroundColor;
      el.style.backgroundColor = "#fff";
    }
    // Patch color
    if (computed.color.includes("oklch")) {
      prev.color = el.style.color;
      el.style.color = "#1f2937";
    }
    // Patch borderColor
    if (computed.borderColor && computed.borderColor.includes("oklch")) {
      prev.borderColor = el.style.borderColor;
      el.style.borderColor = "#e5e7eb";
    }

    // Patch all CSS variables as before
    for (let i = 0; i < computed.length; i++) {
      const prop = computed[i];
      const value = computed.getPropertyValue(prop);
      if (value.includes("oklch")) {
        prev[prop] = el.style.getPropertyValue(prop);
        el.style.setProperty(prop, "#fff");
      }
    }

    if (Object.keys(prev).length > 0) {
      prevStyles.set(el, prev);
    }
  });

  // Patch body and html if needed
  ["body", "html"].forEach((selector) => {
    const el = document.querySelector(selector) as HTMLElement | null;
    if (el) {
      const computed = getComputedStyle(el);
      const prev: { [key: string]: string } = {};
      if (computed.backgroundColor.includes("oklch")) {
        prev.backgroundColor = el.style.backgroundColor;
        el.style.backgroundColor = "#fff";
      }
      if (computed.color.includes("oklch")) {
        prev.color = el.style.color;
        el.style.color = "#1f2937";
      }
      if (Object.keys(prev).length > 0) {
        prevStyles.set(el, prev);
      }
    }
  });

  return prevStyles;
}

function restoreOklchAllColors(
  prevStyles: Map<HTMLElement, { [key: string]: string }>
) {
  prevStyles.forEach((prev, el) => {
    for (const prop in prev) {
      el.style[prop as any] = prev[prop];
    }
  });
}

export default function Badges() {
  const { user } = useAuth();
  const donorId = user?.id;

  const [mealsServed, setMealsServed] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const certificateRef = useRef<HTMLDivElement>(null);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!donorId) {
        console.warn("Donor ID not available yet");
        return;
      }

      try {
        const res = await fetch(
          `/api/donor-dashboard-data?donor_id=${donorId}`
        );
        if (!res.ok) throw new Error("Failed to fetch badge data");
        const data = await res.json();

        setMealsServed(data.noOfPeopleServed ?? 0);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [donorId]);

  const getBadgeStatus = (badge: Badge) => {
    if (mealsServed === null) return "loading";
    return mealsServed >= badge.required ? "unlocked" : "locked";
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
            Total Meals Served:{" "}
            <span className="text-orange-700">{mealsServed}</span>
          </p>
        )}
      </div>

      {!loading && !error && mealsServed === 0 && (
        <div className="text-center text-sm text-gray-500 mb-10">
          You haven't served any meals yet. Start donating to earn your first
          badge!
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
                "rounded-lg shadow-lg p-6 flex flex-col items-center bg-white border",
                status === "locked"
                  ? "border-gray-200 text-gray-400"
                  : "border-orange-300 text-orange-700",
                isCurrent && "ring-4 ring-orange-400 relative",
                "transition-transform hover:scale-105"
              )}
              tabIndex={0}
            >
              {isCurrent && (
                <div className="absolute -top-4 bg-orange-500 text-white px-3 py-1 rounded-full flex items-center gap-2 text-sm font-semibold shadow-lg">
                  <Star size={16} /> Current Badge
                </div>
              )}

              <div className="mb-4">{badge.icon}</div>
              <h3 className="text-xl font-bold text-center mb-1">
                {badge.title}
              </h3>
              <p className="text-sm text-center mb-4">{badge.description}</p>
              <div className="text-4xl font-extrabold mb-1">
                {badge.required}
              </div>
              <div className="text-xs uppercase tracking-wide mb-4">
                Meals Required
              </div>

              {status === "locked" && mealsServed !== null && (
                <>
                  <div className="w-full mb-2 flex justify-between text-xs font-semibold">
                    <span>Progress</span>
                    <span>{Math.floor(progressPercent)}%</span>
                  </div>
                  <Progress
                    value={progressPercent}
                    className="h-3 rounded-lg mb-3"
                  />
                  <p className="text-center text-xs mb-3">
                    {badge.required - mealsServed} more meals to unlock
                  </p>
                  <div className="flex items-center text-gray-400 space-x-1">
                    <Lock className="w-5 h-5" />
                    <span className="text-sm font-medium">Locked</span>
                  </div>
                </>
              )}

              {status === "unlocked" && (
                <div className="flex flex-col gap-2 w-full">
                  <Button
                    variant="secondary"
                    className="mt-auto bg-gradient-to-r from-orange-400 to-yellow-400 text-white font-semibold hover:from-orange-500 hover:to-yellow-500"
                    onClick={async () => {
                      setSelectedBadge(badge);
                      setTimeout(async () => {
                        if (!certificateRef.current) return;
                        const certEl = certificateRef.current;
                        const prevStyles = overrideOklchAllColors(certEl);
                        const canvas = await html2canvas(certEl, {
                          scale: 2, // higher quality
                          useCORS: true,
                        });
                        const imgData = canvas.toDataURL("image/png");
                        restoreOklchAllColors(prevStyles);
                        const pdf = new jsPDF({
                          orientation: "landscape", // 'portrait' or 'landscape'
                          unit: "px",
                          format: [canvas.width, canvas.height],
                        });
                        pdf.addImage(
                          imgData,
                          "PNG",
                          0,
                          0,
                          canvas.width,
                          canvas.height
                        );
                        pdf.save(`${badge.title}-certificate.pdf`);
                      }, 300); // allow render
                    }}
                  >
                    <Share2 className="w-5 h-5 mr-2" />
                    Share Achievement
                  </Button>
                  <Button
                    variant="outline"
                    className="border-orange-400 text-orange-600 hover:bg-orange-50"
                    onClick={() => {
                      setSelectedBadge(badge);
                      setShowPreview(true);
                    }}
                  >
                    Preview Certificate
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Certificate Preview Modal */}
      {showPreview && selectedBadge && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 relative max-w-3xl w-full flex flex-col items-center">
            <button
              className="absolute top-2 right-2 text-gray-500 text-2xl"
              onClick={() => setShowPreview(false)}
              aria-label="Close preview"
            >
              ×
            </button>
            <Certificate
              userName={user?.email?.split("@")[0] || "Valued Donor"}
              badge={selectedBadge}
              mealsServed={mealsServed ?? 0}
            />
          </div>
        </div>
      )}
      {/* Hidden Certificate for PDF generation */}
      {selectedBadge && (
        <div
          style={{
            position: "absolute",
            left: "-9999px",
            top: 0,
            width: 0,
            height: 0,
            overflow: "hidden",
          }}
        >
          <Certificate
            ref={certificateRef}
            userName={user?.email?.split("@")[0] || "Valued Donor"}
            badge={selectedBadge}
            mealsServed={mealsServed ?? 0}
          />
        </div>
      )}
    </div>
  );
}
