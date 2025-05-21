"use client";

import type React from "react";
import { useMemo } from "react";
import Link from "next/link";
import { 
  ArrowUpRight, 
  Users, 
  Store, 
  Activity, 
  Package, 
  Award,
  Recycle,
  Gift,
  BarChart3 
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { useGetDashboardSummaryQuery } from "@/store/api/analyticsApi";
import { format, parseISO } from "date-fns";

// Dashboard data with proper typing
type StatCardProps = {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: string;
  trendUp?: boolean;
  isLoading?: boolean;
  href?: string;
};

type ChartDataPoint = {
  name: string;
  total: number;
};

type ActivityItemProps = {
  activity: {
    id: string;
    type: 'user_registration' | 'recycling' | 'coupon_redemption' | 'organization_created';
    description: string;
    timestamp: string;
    userId?: string;
    userName?: string;
  };
  isLoading?: boolean;
};

type ActionButtonProps = {
  text: string;
  href?: string;
  onClick?: () => void;
};

export default function DashboardPage() {
  const { data: summaryResponse, isLoading, error } = useGetDashboardSummaryQuery();
  const summary = summaryResponse?.data;

  // Transform monthly points data for the chart
  const chartData: ChartDataPoint[] = useMemo(() => {
    if (!summary?.monthlyPoints) return [];
    return summary.monthlyPoints.map(month => ({
      name: month.month,
      total: month.points,
    }));
  }, [summary?.monthlyPoints]);

  // Calculate trends (mock calculation for now - could be enhanced with historical data)
  const statCards: StatCardProps[] = useMemo(() => [
    {
      title: "Total Users",
      value: isLoading ? 0 : (summary?.totalUsers || 0).toLocaleString(),
      icon: Users,
      trend: "+12%",
      trendUp: true,
      isLoading,
      href: "/users"
    },
    {
      title: "Active Stores",
      value: isLoading ? 0 : (summary?.totalStores || 0).toLocaleString(),
      icon: Store,
      trend: "+8%",
      trendUp: true,
      isLoading,
      href: "/stores"
    },
    {
      title: "Total Bins",
      value: isLoading ? 0 : (summary?.totalBins || 0).toLocaleString(),
      icon: Recycle,
      trend: "+23%",
      trendUp: true,
      isLoading,
      href: "/bins"
    },
    {
      title: "Active Coupons",
      value: isLoading ? 0 : (summary?.totalCoupons || 0).toLocaleString(),
      icon: Gift,
      trend: "+4%",
      trendUp: true,
      isLoading,
      href: "/coupons"
    },
    {
      title: "Total Points Earned",
      value: isLoading ? 0 : (summary?.totalPoints || 0).toLocaleString(),
      icon: Award,
      trend: "+15%",
      trendUp: true,
      isLoading
    },
    {
      title: "Recycling Activities",
      value: isLoading ? 0 : (summary?.totalRecyclingActivities || 0).toLocaleString(),
      icon: Activity,
      trend: "+18%",
      trendUp: true,
      isLoading
    },
  ], [summary, isLoading]);

  const quickActions: ActionButtonProps[] = [
    { text: "Add New User", href: "/users" },
    { text: "Create Coupon", href: "/coupons" },
    { text: "View Analytics", href: "/analytics" },
    { text: "Manage Organizations", href: "/organizations" },
  ];

  if (error) {
    return (
      <div className="space-y-4 sm:space-y-6 md:space-y-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          Error loading dashboard data. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Welcome back</h2>
          <p className="text-muted-foreground">Here&apos;s what&apos;s happening with your recycling program.</p>
        </div>
        <Button asChild className="gap-2 group">
          <Link href="/analytics">
            View Full Analytics
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 md:gap-6">
        {statCards.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Chart Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 px-4 pt-4 sm:px-6 sm:pt-6">
          <div className="space-y-1">
            <CardTitle>Points Overview</CardTitle>
            <CardDescription>Monthly points earned this year</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6 space-y-3 sm:space-y-4">
          {isLoading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : (
            <PointsChart data={chartData} />
          )}
        </CardContent>
      </Card>

      {/* Recent Activity and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 px-4 pt-4 sm:px-6 sm:pt-6">
            <CardTitle>Recent Activity</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/analytics">View All</Link>
            </Button>
          </CardHeader>
          <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6 space-y-3 sm:space-y-4">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))
            ) : summary?.recentActivities?.length ? (
              summary.recentActivities.slice(0, 4).map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))
            ) : (
              <div className="text-center text-muted-foreground py-4">
                No recent activities
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 px-4 pt-4 sm:px-6 sm:pt-6">
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6 space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {quickActions.map((action, index) => (
                <ActionButton key={index} {...action} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Component for stat cards
function StatCard({ title, value, icon: Icon, trend, trendUp, isLoading, href }: StatCardProps) {
  const CardWrapper = href ? Link : 'div';
  const cardProps = href ? { href } : {};

  return (
    <CardWrapper {...cardProps}>
      <Card className={`overflow-hidden ${href ? 'hover:shadow-md transition-shadow cursor-pointer' : ''}`}>
        <CardContent className="p-4 sm:p-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">{title}</p>
              <p className="text-xl sm:text-2xl font-bold mt-1">
                {isLoading ? <Skeleton className="h-8 w-16" /> : value}
              </p>
            </div>
            <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-primary/10 flex items-center justify-center">
              <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
          </div>
          {trend && (
            <div className={`text-xs sm:text-sm mt-2 flex items-center ${trendUp ? "text-green-600" : "text-red-600"}`}>
              {isLoading ? <Skeleton className="h-4 w-12" /> : trend}
              <ArrowUpRight className={`h-3 w-3 sm:h-4 sm:w-4 ml-1 ${!trendUp && "rotate-90"}`} />
            </div>
          )}
        </CardContent>
      </Card>
    </CardWrapper>
  );
}

// Component for points chart
function PointsChart({ data }: { data: ChartDataPoint[] }) {
  return (
    <div className="w-full h-[250px] sm:h-[300px] md:h-[350px]">
      <ChartContainer
        config={{
          total: {
            label: "Points",
            color: "var(--primary)",
          },
        }}
        className="h-full"
      >
        <BarChart
          accessibilityLayer
          data={data}
          margin={{
            top: 5,
            right: 10,
            left: 10,
            bottom: 20,
          }}
        >
          <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="name"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            className="text-xs text-muted-foreground"
            tick={{ fontSize: 12 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => value.toLocaleString()}
            className="text-xs text-muted-foreground"
            tick={{ fontSize: 12 }}
            width={60}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar 
            dataKey="total" 
            fill="var(--color-total)" 
            radius={[4, 4, 0, 0]} 
            className="hover:fill-primary/80" 
          />
        </BarChart>
      </ChartContainer>
    </div>
  );
}

// Component for activity items
function ActivityItem({ activity }: ActivityItemProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_registration':
        return <Users className="h-3 w-3 text-blue-500" />;
      case 'recycling':
        return <Recycle className="h-3 w-3 text-green-500" />;
      case 'coupon_redemption':
        return <Gift className="h-3 w-3 text-purple-500" />;
      case 'organization_created':
        return <Package className="h-3 w-3 text-orange-500" />;
      default:
        return <Activity className="h-3 w-3 text-gray-500" />;
    }
  };

  const timeAgo = useMemo(() => {
    try {
      const date = parseISO(activity.timestamp);
      const now = new Date();
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      
      if (diffInMinutes < 1) return 'Just now';
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
      return format(date, 'MMM d');
    } catch {
      return 'Recent';
    }
  }, [activity.timestamp]);

  return (
    <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
      <div className="flex-shrink-0">
        {getActivityIcon(activity.type)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs sm:text-sm truncate">{activity.description}</p>
        <p className="text-xs text-muted-foreground">{timeAgo}</p>
      </div>
    </div>
  );
}

// Component for action buttons
function ActionButton({ text, href, onClick }: ActionButtonProps) {
  if (href) {
    return (
      <Button
        asChild
        variant="outline"
        className="justify-start h-auto py-2 sm:py-3 px-3 sm:px-4 hover:bg-muted transition-colors text-left text-xs sm:text-sm"
      >
        <Link href={href}>{text}</Link>
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      className="justify-start h-auto py-2 sm:py-3 px-3 sm:px-4 hover:bg-muted transition-colors text-left text-xs sm:text-sm"
      onClick={onClick}
    >
      {text}
    </Button>
  );
}