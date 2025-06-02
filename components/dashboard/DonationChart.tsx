import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from "recharts";

interface DonationChartProps {
  dateRange: string;
}

const DonationChart = ({ dateRange }: DonationChartProps) => {
  // Sample data - in real app, this would come from Supabase
  const data = [
    { date: "2024-01-01", donations: 45, meals: 180 },
    { date: "2024-01-02", donations: 52, meals: 208 },
    { date: "2024-01-03", donations: 38, meals: 152 },
    { date: "2024-01-04", donations: 67, meals: 268 },
    { date: "2024-01-05", donations: 49, meals: 196 },
    { date: "2024-01-06", donations: 73, meals: 292 },
    { date: "2024-01-07", donations: 61, meals: 244 },
  ];

  const chartConfig = {
    donations: {
      label: "Donations",
      color: "#fb923c",
    },
    meals: {
      label: "Meals Served",
      color: "#fdba74",
    },
  };

  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-800">
          Donation Trends
        </CardTitle>
        <p className="text-sm text-gray-600">
          Daily donations and meals served over the past {dateRange}
        </p>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorDonations" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#fb923c" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#fb923c" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorMeals" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#fdba74" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#fdba74" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#6b7280" }}
                tickFormatter={(value) =>
                  new Date(value).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                }
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#6b7280" }}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="meals"
                stroke="#fdba74"
                fillOpacity={1}
                fill="url(#colorMeals)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="donations"
                stroke="#fb923c"
                fillOpacity={1}
                fill="url(#colorDonations)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default DonationChart;
