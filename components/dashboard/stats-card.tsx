import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  icon: ReactNode;
  iconBg: string;
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
}

export function StatsCard({ icon, iconBg, title, value, change, trend }: StatsCardProps) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className={cn("p-2 rounded-md", iconBg)}>
            {icon}
          </div>
          <div>
            <div className="text-2xl font-bold">{value}</div>
            <div className="text-sm text-gray-500">{title}</div>
            <div className={cn(
              "text-xs mt-1",
              trend === "up" ? "text-green-500" : "text-green-500"
            )}>
              {change}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}