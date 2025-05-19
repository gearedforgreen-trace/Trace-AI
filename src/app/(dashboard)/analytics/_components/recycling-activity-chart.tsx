"use client";

import { RecyclingActivityByMaterial } from "@/lib/api/services/analytics-api";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer, 
  Tooltip, 
  Legend, 
  Cell 
} from "recharts";

interface RecyclingActivityChartProps {
  data: RecyclingActivityByMaterial[];
}

export default function RecyclingActivityChart({ data }: RecyclingActivityChartProps) {
  // Generate a palette of colors based on the number of materials
  const generateColors = (count: number) => {
    const baseColors = [
      "#22c55e", // Green
      "#3b82f6", // Blue
      "#f59e0b", // Amber
      "#ec4899", // Pink
      "#8b5cf6", // Purple
      "#ef4444", // Red
      "#06b6d4", // Cyan
      "#84cc16", // Lime
    ];
    
    // If we have more materials than colors, repeat the colors
    return Array(count)
      .fill(0)
      .map((_, i) => baseColors[i % baseColors.length]);
  };

  // Format the data for the chart
  const chartData = data.map((item) => ({
    name: item.materialName,
    count: item.recycleCount,
    points: item.totalPoints,
  }));

  // Generate colors for each bar
  const colors = generateColors(chartData.length);

  return (
    <div className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis 
            dataKey="name" 
            tickLine={false}
            axisLine={false}
            angle={-45}
            textAnchor="end"
            height={50}
          />
          <YAxis
            yAxisId="left"
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}`}
            orientation="left"
            label={{ value: 'Items Recycled', angle: -90, position: 'insideLeft', offset: -5 }}
          />
          <YAxis
            yAxisId="right"
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}`}
            orientation="right"
            label={{ value: 'Points', angle: 90, position: 'insideRight', offset: 5 }}
          />
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
                          {payload[0].payload.name}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">
                            Items Recycled
                          </span>
                          <span className="font-bold">
                            {payload[0].value}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">
                            Points Earned
                          </span>
                          <span className="font-bold">
                            {payload[1].value}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend />
          <Bar
            yAxisId="left"
            dataKey="count"
            name="Items Recycled"
            radius={[4, 4, 0, 0]}
          >
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={colors[index]} />
            ))}
          </Bar>
          <Bar
            yAxisId="right"
            dataKey="points"
            name="Points Earned"
            radius={[4, 4, 0, 0]}
            fill="#8884d8"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}