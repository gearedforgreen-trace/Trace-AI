"use client";

import { UserEngagement } from "@/lib/api/services/analytics-api";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer, 
} from "recharts";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserEngagementTableProps {
  data: UserEngagement[];
  compact?: boolean;
}

export default function UserEngagementTable({ data, compact = false }: UserEngagementTableProps) {
  // Sort users by total points (highest first)
  const sortedData = [...data].sort((a, b) => b.totalPoints - a.totalPoints);

  // Generate initial for avatar
  const getInitials = (name: string) => {
    const nameParts = name.split(' ');
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };
  
  // Format relative time (e.g., "2 days ago")
  const formatRelativeTime = (date: Date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };
  
  // Prepare data for sparkline charts
  const getPointsData = (points: number) => {
    // Generate a simple sparkline pattern based on points value
    const max = Math.max(...sortedData.map(user => user.totalPoints));
    const normalized = points / max;
    
    // Create a "trend" pattern that roughly correlates with total points
    return [
      { value: normalized * 0.5 },
      { value: normalized * 0.7 },
      { value: normalized * 0.4 },
      { value: normalized * 0.9 },
      { value: normalized },
    ];
  };

  return (
    <Table>
      {!compact && (
        <TableCaption>User engagement metrics for the selected time period</TableCaption>
      )}
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          {!compact && <TableHead>Activity Trend</TableHead>}
          <TableHead className="text-right">Recycled Items</TableHead>
          <TableHead className="text-right">Points</TableHead>
          {!compact && <TableHead className="text-right">Active Days</TableHead>}
          {!compact && <TableHead className="text-right">Last Activity</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedData.map((user) => (
          <TableRow key={user.userId}>
            <TableCell className="font-medium">
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{getInitials(user.userName)}</AvatarFallback>
                </Avatar>
                <span className="truncate max-w-[150px]">{user.userName}</span>
              </div>
            </TableCell>
            
            {!compact && (
              <TableCell>
                <div className="h-[40px] w-[100px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getPointsData(user.totalPoints)}>
                      <Bar dataKey="value" fill="#22c55e" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </TableCell>
            )}
            
            <TableCell className="text-right">{user.recycleCount}</TableCell>
            <TableCell className="text-right font-semibold text-primary">
              {user.totalPoints}
            </TableCell>
            
            {!compact && (
              <TableCell className="text-right">{user.activeDays}</TableCell>
            )}
            
            {!compact && (
              <TableCell className="text-right text-muted-foreground">
                {formatRelativeTime(user.lastActivity)}
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}