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
  { name: "Jan", reality: 400, target: 300 },
  { name: "Feb", reality: 300, target: 400 },
  { name: "Mar", reality: 500, target: 400 },
  { name: "Apr", reality: 280, target: 380 },
  { name: "May", reality: 590, target: 500 },
  { name: "Jun", reality: 350, target: 450 },
  { name: "Jul", reality: 470, target: 400 },
  { name: "Aug", reality: 590, target: 500 },
  { name: "Sep", reality: 420, target: 450 },
  { name: "Oct", reality: 580, target: 500 },
  { name: "Nov", reality: 520, target: 450 },
  { name: "Dec", reality: 400, target: 380 },
];

export function TargetVsReality() {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Meals Served vs Goal</CardTitle>
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
              dataKey="reality" 
              name="Actual Meals Served" 
              fill="#facc15" 
              radius={[4, 4, 0, 0]} 
              barSize={10} 
            />
            <Bar 
              dataKey="target" 
              name="Target Meals" 
              fill="#10b981" 
              radius={[4, 4, 0, 0]} 
              barSize={10} 
            />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex justify-between mt-2">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-yellow-400"></div>
              <span className="text-xs text-gray-500">Actual Meals Served</span>
            </div>
            <span className="font-bold">8,523</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-emerald-500"></div>
              <span className="text-xs text-gray-500">Target Meals</span>
            </div>
            <span className="font-bold">7,023</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}