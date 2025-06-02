import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const StatsOverview = () => {
  const stats = [
    {
      title: "Total Donations",
      value: "1,247",
      change: "+12.5%",
      changeType: "positive",
      icon: "🍽️",
      description: "Meals donated this month",
    },
    {
      title: "Active Pickups",
      value: "23",
      change: "+3",
      changeType: "positive",
      icon: "🚚",
      description: "Pending collections",
    },
    {
      title: "NGOs Served",
      value: "48",
      change: "+5",
      changeType: "positive",
      icon: "🤝",
      description: "Partner organizations",
    },
    {
      title: "Food Saved",
      value: "2.8T",
      change: "+18.2%",
      changeType: "positive",
      icon: "♻️",
      description: "Tons of food rescued",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: index * 0.1 }}
          whileHover={{ y: -2 }}
        >
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <span className="text-2xl">{stat.icon}</span>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline space-x-2">
                <div className="text-2xl font-bold text-gray-800">
                  {stat.value}
                </div>
                <div
                  className={`text-sm font-medium ${
                    stat.changeType === "positive"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {stat.change}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default StatsOverview;
