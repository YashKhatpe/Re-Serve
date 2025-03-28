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
  { name: "Q1", volume: 80, service: 65 },
  { name: "Q2", volume: 95, service: 75 },
  { name: "Q3", volume: 70, service: 60 },
  { name: "Q4", volume: 85, service: 70 },
];

export function VolumeVsService() {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Food Donations vs Volunteers</CardTitle>
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
              dataKey="volume" 
              name="Donations" 
              fill="#3b82f6" 
              radius={[4, 4, 0, 0]} 
              barSize={30} 
            />
            <Bar 
              dataKey="service" 
              name="Volunteers" 
              fill="#10b981" 
              radius={[4, 4, 0, 0]} 
              barSize={30} 
            />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex justify-between mt-2 text-sm">
          <div className="flex flex-col items-center">
            <span className="text-gray-500">Donations</span>
            <span className="font-bold">1,135 meals</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-gray-500">Volunteers</span>
            <span className="font-bold">635 people</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}