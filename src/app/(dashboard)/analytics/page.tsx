"use client";

import React, { useState } from 'react';
import { useAnalytics } from '@/hooks/api/use-analytics';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, Users, Store, Recycle, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

// Import analytics components
import UsersByOrganizationChart from './_components/users-by-organization-chart';
import StoresByOrganizationMap from './_components/stores-by-organization-map';
import BinsByStoreChart from './_components/bins-by-store-chart';
import RecyclingActivityChart from './_components/recycling-activity-chart';
import UserEngagementTable from './_components/user-engagement-table';
import PointsOverview from './_components/points-overview';

export default function AnalyticsPage() {
  // Filter state
  const [organizationId, setOrganizationId] = useState<string | undefined>(undefined);
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    to: new Date(),
  });

  // Fetch analytics data
  const { data, isLoading, error } = useAnalytics({
    organizationId,
    startDate: dateRange.from,
    endDate: dateRange.to
  });

  // Handle loading and error states
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
          Error loading analytics data: {error.message}
        </div>
      </div>
    );
  }

  // We'll use mock data since our API might not be fully implemented yet
  const mockData = {
    usersByOrganization: [
      { organizationId: "1", organizationName: "Green Earth", userCount: 120 },
      { organizationId: "2", organizationName: "RecycleNow", userCount: 87 },
      { organizationId: "3", organizationName: "EcoFriendly", userCount: 56 },
      { organizationId: "4", organizationName: "Planet Savers", userCount: 42 },
    ],
    storesByOrganization: [
      { organizationId: "1", organizationName: "Green Earth", storeCount: 8 },
      { organizationId: "2", organizationName: "RecycleNow", storeCount: 5 },
      { organizationId: "3", organizationName: "EcoFriendly", storeCount: 3 },
      { organizationId: "4", organizationName: "Planet Savers", storeCount: 2 },
    ],
    binsByStore: [
      { storeId: "s1", storeName: "Downtown", materialId: "m1", materialName: "Plastic", organizationId: "1", organizationName: "Green Earth", binCount: 12 },
      { storeId: "s2", storeName: "Uptown", materialId: "m1", materialName: "Plastic", organizationId: "1", organizationName: "Green Earth", binCount: 8 },
      { storeId: "s3", storeName: "Westside", materialId: "m2", materialName: "Aluminum", organizationId: "2", organizationName: "RecycleNow", binCount: 6 },
      { storeId: "s4", storeName: "Eastside", materialId: "m2", materialName: "Aluminum", organizationId: "2", organizationName: "RecycleNow", binCount: 4 },
      { storeId: "s5", storeName: "Northside", materialId: "m3", materialName: "Paper", organizationId: "3", organizationName: "EcoFriendly", binCount: 10 },
      { storeId: "s6", storeName: "Southside", materialId: "m4", materialName: "Glass", organizationId: "4", organizationName: "Planet Savers", binCount: 5 },
    ],
    recyclingActivityByMaterial: [
      { materialId: "m1", materialName: "Plastic", recycleCount: 2156, totalPoints: 3234 },
      { materialId: "m2", materialName: "Aluminum", recycleCount: 1432, totalPoints: 2864 },
      { materialId: "m3", materialName: "Paper", recycleCount: 984, totalPoints: 984 },
      { materialId: "m4", materialName: "Glass", recycleCount: 765, totalPoints: 1530 },
    ],
    userEngagement: [
      { userId: "u1", userName: "John Smith", recycleCount: 156, totalPoints: 312, activeDays: 24, lastActivity: new Date() },
      { userId: "u2", userName: "Sarah Johnson", recycleCount: 143, totalPoints: 286, activeDays: 18, lastActivity: new Date() },
      { userId: "u3", userName: "Michael Brown", recycleCount: 98, totalPoints: 196, activeDays: 12, lastActivity: new Date() },
      { userId: "u4", userName: "Emily Davis", recycleCount: 76, totalPoints: 152, activeDays: 10, lastActivity: new Date() },
      { userId: "u5", userName: "David Wilson", recycleCount: 65, totalPoints: 130, activeDays: 8, lastActivity: new Date() },
    ],
    pointsAndRewards: {
      totalPointsEarned: 8612,
      totalRecyclingCount: 5337,
      totalPointsRedeemed: 3215,
      redeemedPointsPercent: 37,
      availableCoupons: 12
    }
  };

  // Use mock data for now until our API is fully implemented
  const displayData = data || mockData;

  return (
    <div className="space-y-6 p-6">
      {/* Page header with filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            View analytics about users, stores, bins, and recycling activity
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {/* Organization filter */}
          <Select 
            value={organizationId || 'all'}
            onValueChange={(value) => setOrganizationId(value === 'all' ? undefined : value)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Organizations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Organizations</SelectItem>
              {/* Dynamically populate organizations when data is available */}
              {displayData?.usersByOrganization.map((org) => (
                <SelectItem key={org.organizationId} value={org.organizationId}>
                  {org.organizationName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Date range picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-[240px] justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} -{" "}
                      {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={(range) => 
                  range && 
                  setDateRange({ 
                    from: range.from || new Date(), 
                    to: range.to || new Date() 
                  })
                }
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Overview metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Users metric */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Users
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                displayData?.usersByOrganization.reduce(
                  (total, org) => total + org.userCount, 
                  0
                ) || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all organizations
            </p>
          </CardContent>
        </Card>

        {/* Stores metric */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Stores
            </CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                displayData?.storesByOrganization.reduce(
                  (total, org) => total + org.storeCount, 
                  0
                ) || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Active recycling locations
            </p>
          </CardContent>
        </Card>

        {/* Bins metric */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Bins
            </CardTitle>
            <Recycle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                displayData?.binsByStore.reduce(
                  (total, bin) => total + bin.binCount, 
                  0
                ) || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all stores
            </p>
          </CardContent>
        </Card>

        {/* Points metric */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Points
            </CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                displayData?.pointsAndRewards.totalPointsEarned || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {displayData?.pointsAndRewards.redeemedPointsPercent || 0}% redeemed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabbed content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="stores">Stores & Bins</TabsTrigger>
          <TabsTrigger value="recycling">Recycling Activity</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Users by Organization */}
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Users by Organization</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                {isLoading ? (
                  <Skeleton className="h-[350px] w-full" />
                ) : (
                  <UsersByOrganizationChart data={displayData?.usersByOrganization || []} />
                )}
              </CardContent>
            </Card>

            {/* Points Overview */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Points & Rewards</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-[350px] w-full" />
                ) : (
                  <PointsOverview data={displayData?.pointsAndRewards} />
                )}
              </CardContent>
            </Card>

            {/* Recycling Activity by Material */}
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Recycling Activity by Material</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                {isLoading ? (
                  <Skeleton className="h-[350px] w-full" />
                ) : (
                  <RecyclingActivityChart data={displayData?.recyclingActivityByMaterial || []} />
                )}
              </CardContent>
            </Card>

            {/* Bins by Store */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Bins by Material Type</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-[350px] w-full" />
                ) : (
                  <BinsByStoreChart data={displayData?.binsByStore || []} />
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Engagement</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[500px] w-full" />
              ) : (
                <UserEngagementTable data={displayData?.userEngagement || []} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stores Tab */}
        <TabsContent value="stores" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Store Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[500px] w-full" />
              ) : (
                <StoresByOrganizationMap data={displayData?.storesByOrganization || []} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recycling Activity Tab */}
        <TabsContent value="recycling" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Recycling Activity Over Time */}
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Recycling Activity by Material Type</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                {isLoading ? (
                  <Skeleton className="h-[400px] w-full" />
                ) : (
                  <RecyclingActivityChart data={displayData?.recyclingActivityByMaterial || []} />
                )}
              </CardContent>
            </Card>

            {/* Points Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Points Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : (
                  <PointsOverview data={displayData?.pointsAndRewards} />
                )}
              </CardContent>
            </Card>

            {/* User Rankings */}
            <Card>
              <CardHeader>
                <CardTitle>Top Recyclers</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : (
                  <UserEngagementTable 
                    data={(displayData?.userEngagement || []).slice(0, 5)} 
                    compact={true} 
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}