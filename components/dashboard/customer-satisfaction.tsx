"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";

const data = [
  { name: "Jan", lastMonth: 65, thisMonth: 78 },
  { name: "Feb", lastMonth: 59, thisMonth: 87 },
  { name: "Mar", lastMonth: 80, thisMonth: 70 },
  { name: "Apr", lastMonth: 81, thisMonth: 90 },
  { name: "May", lastMonth: 56, thisMonth: 75 },
  { name: "Jun", lastMonth: 55, thisMonth: 60 },
  { name: "Jul", lastMonth: 40, thisMonth: 85 },
];

export function CustomerSatisfaction() {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">NGO & Donor Engagement</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12 }} 
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12 }} 
            />
            <Tooltip />
            <Legend 
              iconType="circle" 
              layout="horizontal" 
              verticalAlign="bottom" 
              align="center"
              wrapperStyle={{ fontSize: 12 }}
            />
            <Area 
              type="monotone" 
              dataKey="lastMonth" 
              name="Last Month" 
              stroke="#3b82f6" 
              fill="#dbeafe" 
              activeDot={{ r: 6 }} 
            />
            <Area 
              type="monotone" 
              dataKey="thisMonth" 
              name="This Month" 
              stroke="#10b981" 
              fill="#dcfce7" 
              activeDot={{ r: 6 }} 
            />
          </AreaChart>
        </ResponsiveContainer>
        <div className="flex justify-between mt-2 text-sm">
          <div className="flex flex-col items-center">
            <span className="text-gray-500">Last Month</span>
            <span className="font-bold">3,054</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-gray-500">This Month</span>
            <span className="font-bold">4,504</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}