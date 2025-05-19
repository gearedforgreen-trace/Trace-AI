"use client";

import { BinsByStore } from "@/lib/api/services/analytics-api";
import { PieChart, Pie, ResponsiveContainer, Cell, Legend, Tooltip } from "recharts";

interface BinsByStoreChartProps {
  data: BinsByStore[];
}

export default function BinsByStoreChart({ data }: BinsByStoreChartProps) {
  // Organize data by material type
  const materialGroups: Record<string, { name: string, value: number, color: string }> = {};
  
  // Color palette for materials
  const materialColors = [
    "#22c55e", // Green
    "#3b82f6", // Blue
    "#f59e0b", // Amber
    "#ec4899", // Pink
    "#8b5cf6", // Purple
    "#ef4444", // Red
    "#06b6d4", // Cyan
  ];
  
  // Process and group bins by material
  data.forEach((bin, index) => {
    const materialId = bin.materialId;
    
    if (!materialGroups[materialId]) {
      materialGroups[materialId] = {
        name: bin.materialName,
        value: 0,
        color: materialColors[Object.keys(materialGroups).length % materialColors.length]
      };
    }
    
    materialGroups[materialId].value += bin.binCount;
  });
  
  // Convert the grouped data to an array for the chart
  const pieData = Object.values(materialGroups);
  
  // Sort data by value for better visualization
  pieData.sort((a, b) => b.value - a.value);
  
  return (
    <div className="h-[350px] w-full flex flex-col">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            outerRadius={80}
            innerRadius={40}
            dataKey="value"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                    <div className="grid gap-2">
                      <div className="flex flex-col">
                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                          Material
                        </span>
                        <span className="font-bold text-muted-foreground">
                          {payload[0].name}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                          Bin Count
                        </span>
                        <span className="font-bold">
                          {payload[0].value}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                          Percentage
                        </span>
                        <span className="font-bold">
                          {((payload[0].value / pieData.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
      
      {/* Text summary below the chart */}
      <div className="mt-4 text-center text-sm text-muted-foreground">
        <p>Total Bins: {pieData.reduce((sum, item) => sum + item.value, 0)}</p>
        <p>Material Types: {pieData.length}</p>
      </div>
    </div>
  );
}