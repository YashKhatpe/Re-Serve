"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";

const data = [
  { name: "Jan", loyal: 400, new: 240, unique: 320 },
  { name: "Feb", loyal: 300, new: 380, unique: 280 },
  { name: "Mar", loyal: 200, new: 420, unique: 240 },
  { name: "Apr", loyal: 280, new: 380, unique: 300 },
  { name: "May", loyal: 300, new: 280, unique: 320 },
  { name: "Jun", loyal: 400, new: 380, unique: 380 },
  { name: "Jul", loyal: 500, new: 480, unique: 400 },
  { name: "Aug", loyal: 520, new: 520, unique: 450 },
  { name: "Sep", loyal: 450, new: 400, unique: 420 },
  { name: "Oct", loyal: 400, new: 350, unique: 380 },
  { name: "Nov", loyal: 380, new: 320, unique: 350 },
  { name: "Dec", loyal: 350, new: 300, unique: 320 },
];

export function VisitorInsights() {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Active Donors & NGOs</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data}>
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
            <Line 
              type="monotone" 
              dataKey="loyal" 
              stroke="#6366f1" 
              name="Active Donors" 
              strokeWidth={2} 
              dot={false} 
              activeDot={{ r: 6 }} 
            />
            <Line 
              type="monotone" 
              dataKey="new" 
              stroke="#ef4444" 
              name="New Donors" 
              strokeWidth={2} 
              dot={false} 
              activeDot={{ r: 6 }} 
            />
            <Line 
              type="monotone" 
              dataKey="unique" 
              stroke="#10b981" 
              name="Meals Served" 
              strokeWidth={2} 
              dot={false} 
              activeDot={{ r: 6 }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}