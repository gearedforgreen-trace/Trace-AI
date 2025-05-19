"use client";

import { UsersByOrganization } from "@/lib/api/services/analytics-api";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface UsersByOrganizationChartProps {
  data: UsersByOrganization[];
}

export default function UsersByOrganizationChart({ data }: UsersByOrganizationChartProps) {
  // Color palette for the chart
  const chartColors = {
    users: "#22c55e", // Green for users
  };

  // Format data for chart display
  const chartData = data.map((org) => ({
    name: org.organizationName,
    users: org.userCount,
  }));

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
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col">
                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                          Organization
                        </span>
                        <span className="font-bold text-muted-foreground">
                          {payload[0].payload.name}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                          Users
                        </span>
                        <span className="font-bold">
                          {payload[0].value}
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
          <Bar
            dataKey="users"
            fill={chartColors.users}
            radius={[4, 4, 0, 0]}
            name="Users"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}