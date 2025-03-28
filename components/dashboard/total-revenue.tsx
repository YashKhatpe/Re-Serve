"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";

const data = [
  { name: "Monday", online: 15, offline: 20 },
  { name: "Tuesday", online: 25, offline: 18 },
  { name: "Wednesday", online: 30, offline: 12 },
  { name: "Thursday", online: 20, offline: 15 },
  { name: "Friday", online: 18, offline: 22 },
  { name: "Saturday", online: 25, offline: 15 },
  { name: "Sunday", online: 28, offline: 20 },
];

export function TotalRevenue() {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Total Meals Served Per Day</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data}>
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
            
            <Bar 
              dataKey="offline" 
              name="Number of meals" 
              fill="#10b981" 
              radius={[4, 4, 0, 0]} 
              barSize={20} 
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}