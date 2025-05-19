"use client";

import { PointsAndRewards } from "@/lib/api/services/analytics-api";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Legend
} from "recharts";
import { 
  Award, 
  Gift, 
  Recycle, 
  Ticket, 
  TrendingUp 
} from "lucide-react";

interface PointsOverviewProps {
  data?: PointsAndRewards;
}

export default function PointsOverview({ data }: PointsOverviewProps) {
  if (!data) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="text-muted-foreground">No points data available</span>
      </div>
    );
  }

  // Prepare data for the redemption status pie chart
  const redemptionData = [
    {
      name: "Redeemed",
      value: data.totalPointsRedeemed,
      color: "#3b82f6" // Blue
    },
    {
      name: "Available",
      value: data.totalPointsEarned - data.totalPointsRedeemed,
      color: "#22c55e" // Green
    }
  ];

  return (
    <div className="space-y-6 h-full">
      {/* Points stats */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 text-muted-foreground">
          <Award className="h-5 w-5" />
          <h3 className="font-medium">Points Overview</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="flex items-center space-x-2 mb-1">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Total Points</span>
            </div>
            <p className="text-2xl font-bold">{data.totalPointsEarned.toLocaleString()}</p>
          </div>
          
          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="flex items-center space-x-2 mb-1">
              <Recycle className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Items Recycled</span>
            </div>
            <p className="text-2xl font-bold">{data.totalRecyclingCount.toLocaleString()}</p>
          </div>
          
          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="flex items-center space-x-2 mb-1">
              <Gift className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Points Redeemed</span>
            </div>
            <p className="text-2xl font-bold">{data.totalPointsRedeemed.toLocaleString()}</p>
          </div>
          
          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="flex items-center space-x-2 mb-1">
              <Ticket className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Active Coupons</span>
            </div>
            <p className="text-2xl font-bold">{data.availableCoupons.toLocaleString()}</p>
          </div>
        </div>
      </div>
      
      {/* Redemption pie chart */}
      <div className="h-[150px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={redemptionData}
              cx="50%"
              cy="50%"
              outerRadius={60}
              innerRadius={40}
              paddingAngle={5}
              dataKey="value"
              label={({ name, percent }) => 
                `${name} ${(percent * 100).toFixed(0)}%`
              }
              labelLine={false}
            >
              {redemptionData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color} 
                  stroke="none"
                />
              ))}
            </Pie>
            <Legend 
              verticalAlign="bottom" 
              height={36}
              formatter={(value) => {
                const entry = redemptionData.find(item => item.name === value);
                return (
                  <span className="text-xs">
                    {value}: {entry?.value.toLocaleString()} pts
                  </span>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}