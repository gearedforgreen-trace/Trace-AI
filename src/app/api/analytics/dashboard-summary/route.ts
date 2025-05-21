import { auth } from "@/lib/auth";
import { PrismaClient } from '@prisma/client';
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return new NextResponse(
      JSON.stringify({ message: "Unauthorized" }),
      { status: 401 }
    );
  }

  try {
    // Get current date and date ranges
    const now = new Date();
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const currentYear = now.getFullYear();

    // Get all summary data in parallel
    const [
      totalUsers,
      totalStores,
      totalBins,
      totalCoupons,
      totalPoints,
      totalRecyclingActivities,
      recentActivities,
      monthlyPointsData
    ] = await Promise.all([
      getTotalUsers(),
      getTotalStores(),
      getTotalBins(),
      getTotalActiveCoupons(),
      getTotalPoints(),
      getTotalRecyclingActivities(),
      getRecentActivities(),
      getMonthlyPointsData(currentYear)
    ]);

    const dashboardSummary = {
      totalUsers,
      totalStores,
      totalBins,
      totalCoupons,
      totalPoints,
      totalRecyclingActivities,
      recentActivities,
      monthlyPoints: monthlyPointsData,
    };

    return NextResponse.json({ data: dashboardSummary });
  } catch (error) {
    console.error("Dashboard summary error:", error);
    return new NextResponse(
      JSON.stringify({ message: "Error fetching dashboard summary" }),
      { status: 500 }
    );
  }
}

// Get total number of users across all organizations
async function getTotalUsers(): Promise<number> {
  const userCount = await prisma.user.count();
  return userCount;
}

// Get total number of stores
async function getTotalStores(): Promise<number> {
  const storeCount = await prisma.store.count();
  return storeCount;
}

// Get total number of bins
async function getTotalBins(): Promise<number> {
  const binCount = await prisma.bin.count();
  return binCount;
}

// Get total number of active coupons
async function getTotalActiveCoupons(): Promise<number> {
  const couponCount = await prisma.coupon.count({
    where: {
      status: 'ACTIVE',
      endDate: {
        gte: new Date()
      }
    }
  });
  return couponCount;
}

// Get total points earned across all activities
async function getTotalPoints(): Promise<number> {
  const totalPoints = await prisma.recycleHistory.aggregate({
    _sum: {
      points: true
    }
  });
  return totalPoints._sum.points || 0;
}

// Get total recycling activities
async function getTotalRecyclingActivities(): Promise<number> {
  const activityCount = await prisma.recycleHistory.count();
  return activityCount;
}

// Get recent activities for the dashboard
async function getRecentActivities(): Promise<Array<{
  id: string;
  type: 'user_registration' | 'recycling' | 'coupon_redemption' | 'organization_created';
  description: string;
  timestamp: string;
  userId?: string;
  userName?: string;
}>> {
  try {
    // Get recent users (last 10)
    const recentUsers = await prisma.user.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        createdAt: true
      }
    });

    // Get recent recycling activities (last 10)
    const recentRecycling = await prisma.recycleHistory.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        points: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true
          }
        },
        bin: {
          select: {
            material: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    // Get recent coupon redemptions (last 5)
    const recentRedemptions = await prisma.redeemHistory.findMany({
      take: 2,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        points: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true
          }
        },
        coupon: {
          select: {
            name: true
          }
        }
      }
    });

    // Get recent organizations (last 3)
    const recentOrganizations = await prisma.organization.findMany({
      take: 2,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        createdAt: true
      }
    });

    // Combine all activities
    const activities: Array<{
      id: string;
      type: 'user_registration' | 'recycling' | 'coupon_redemption' | 'organization_created';
      description: string;
      timestamp: string;
      userId?: string;
      userName?: string;
    }> = [];

    // Add user registrations
    recentUsers.forEach(user => {
      activities.push({
        id: `user_${user.id}`,
        type: 'user_registration',
        description: `New user registered: ${user.name}`,
        timestamp: user.createdAt.toISOString(),
        userId: user.id,
        userName: user.name
      });
    });

    // Add recycling activities
    recentRecycling.forEach(activity => {
      activities.push({
        id: `recycle_${activity.id}`,
        type: 'recycling',
        description: `${activity.user.name} recycled ${activity.bin.material.name} (+${activity.points} points)`,
        timestamp: activity.createdAt.toISOString(),
        userId: activity.user.id,
        userName: activity.user.name
      });
    });

    // Add coupon redemptions
    recentRedemptions.forEach(redemption => {
      activities.push({
        id: `redeem_${redemption.id}`,
        type: 'coupon_redemption',
        description: `${redemption.user.name} redeemed "${redemption.coupon.name}" (-${redemption.points} points)`,
        timestamp: redemption.createdAt.toISOString(),
        userId: redemption.user.id,
        userName: redemption.user.name
      });
    });

    // Add organization creation
    recentOrganizations.forEach(org => {
      activities.push({
        id: `org_${org.id}`,
        type: 'organization_created',
        description: `New organization created: ${org.name}`,
        timestamp: org.createdAt.toISOString()
      });
    });

    // Sort by timestamp (most recent first) and limit to 10
    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);

  } catch (error) {
    console.error("Error fetching recent activities:", error);
    return [];
  }
}

// Get monthly points data for the current year
async function getMonthlyPointsData(year: number): Promise<Array<{
  month: string;
  points: number;
  recycleCount: number;
}>> {
  try {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData: Array<{ month: string; points: number; recycleCount: number; }> = [];

    for (let month = 0; month < 12; month++) {
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0);

      const monthData = await prisma.recycleHistory.aggregate({
        _sum: {
          points: true,
          totalCount: true
        },
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        }
      });

      monthlyData.push({
        month: monthNames[month],
        points: monthData._sum.points || 0,
        recycleCount: monthData._sum.totalCount || 0
      });
    }

    return monthlyData;
  } catch (error) {
    console.error("Error fetching monthly points data:", error);
    return [];
  }
}