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

  // Get query parameters
  const searchParams = request.nextUrl.searchParams;
  const organizationId = searchParams.get("organizationId") || undefined;
  const startDate = searchParams.get("startDate")
    ? new Date(searchParams.get("startDate") as string)
    : new Date(new Date().setMonth(new Date().getMonth() - 1)); // Default to 1 month ago
  const endDate = searchParams.get("endDate")
    ? new Date(searchParams.get("endDate") as string)
    : new Date(); // Default to today

  try {
    // Get analytics data based on filters
    const [
      usersByOrganization,
      storesByOrganization,
      binsByStore,
      recyclingActivityByMaterial,
      userEngagement,
      pointsAndRewards
    ] = await Promise.all([
      getUsersByOrganization(organizationId),
      getStoresByOrganization(organizationId),
      getBinsByStore(organizationId),
      getRecyclingActivityByMaterial(organizationId, startDate, endDate),
      getUserEngagement(organizationId, startDate, endDate),
      getPointsAndRewards(organizationId, startDate, endDate)
    ]);

    return NextResponse.json({
      data: {
        usersByOrganization,
        storesByOrganization,
        binsByStore,
        recyclingActivityByMaterial,
        userEngagement,
        pointsAndRewards
      }
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return new NextResponse(
      JSON.stringify({ message: "Error fetching analytics data" }),
      { status: 500 }
    );
  }
}

// Get users by organization
async function getUsersByOrganization(organizationId?: string) {
  const filter = organizationId ? { where: { organizationId } } : {};
  
  const members = await prisma.member.groupBy({
    by: ['organizationId'],
    _count: {
      userId: true
    },
    ...filter
  });

  const organizations = await prisma.organization.findMany({
    where: organizationId ? { id: organizationId } : {},
    select: {
      id: true,
      name: true
    }
  });

  return members.map(member => {
    const organization = organizations.find(org => org.id === member.organizationId);
    return {
      organizationId: member.organizationId,
      organizationName: organization?.name || 'Unknown',
      userCount: member._count.userId
    };
  });
}

// Get stores by organization
async function getStoresByOrganization(organizationId?: string) {
  const stores = await prisma.store.groupBy({
    by: ['organizationId'],
    _count: {
      id: true
    },
    where: organizationId ? { organizationId } : {}
  });

  const organizations = await prisma.organization.findMany({
    where: organizationId ? { id: organizationId } : {},
    select: {
      id: true,
      name: true
    }
  });

  return stores.map(store => {
    const organization = organizations.find(org => org.id === store.organizationId);
    return {
      organizationId: store.organizationId || 'Unknown',
      organizationName: organization?.name || 'Unknown',
      storeCount: store._count.id,
    };
  });
}

// Get bins by store
async function getBinsByStore(organizationId?: string) {
  // First get stores to filter by organizationId if needed
  const storeIds = organizationId
    ? (await prisma.store.findMany({
        where: { organizationId },
        select: { id: true }
      })).map(store => store.id)
    : undefined;

  const bins = await prisma.bin.groupBy({
    by: ['storeId', 'materialId'],
    _count: {
      id: true
    },
    where: storeIds ? { storeId: { in: storeIds } } : {}
  });

  const stores = await prisma.store.findMany({
    where: storeIds ? { id: { in: storeIds } } : {},
    select: {
      id: true,
      name: true,
      organizationId: true
    }
  });

  const materials = await prisma.material.findMany({
    select: {
      id: true,
      name: true
    }
  });

  const organizations = await prisma.organization.findMany({
    where: organizationId ? { id: organizationId } : {},
    select: {
      id: true,
      name: true
    }
  });

  return bins.map(bin => {
    const store = stores.find(s => s.id === bin.storeId);
    const material = materials.find(m => m.id === bin.materialId);
    const organization = organizations.find(o => o.id === store?.organizationId);

    return {
      storeId: bin.storeId,
      storeName: store?.name || 'Unknown',
      materialId: bin.materialId,
      materialName: material?.name || 'Unknown',
      organizationId: store?.organizationId || 'Unknown',
      organizationName: organization?.name || 'Unknown',
      binCount: bin._count.id
    };
  });
}

// Get recycling activity by material
async function getRecyclingActivityByMaterial(
  organizationId?: string,
  startDate?: Date,
  endDate?: Date
) {
  // If organizationId is provided, get bins from that organization's stores
  const binFilter = organizationId 
    ? {
        bin: {
          store: {
            organizationId
          }
        }
      }
    : {};

  const dateFilter = {
    createdAt: {
      gte: startDate,
      lte: endDate
    }
  };

  const recyclingActivity = await prisma.recycleHistory.groupBy({
    by: ['binId'],
    _sum: {
      points: true,
      totalCount: true
    },
    where: {
      ...binFilter,
      ...dateFilter
    }
  });

  const bins = await prisma.bin.findMany({
    where: {
      id: {
        in: recyclingActivity.map(r => r.binId)
      }
    },
    include: {
      material: true,
      store: true
    }
  });

  // Group recycling data by material
  const materials: Record<string, { name: string, count: number, points: number }> = {};

  recyclingActivity.forEach(activity => {
    const bin = bins.find(b => b.id === activity.binId);
    if (!bin) return;

    const materialId = bin.materialId;
    const materialName = bin.material.name;
    
    if (!materials[materialId]) {
      materials[materialId] = {
        name: materialName,
        count: 0,
        points: 0
      };
    }

    materials[materialId].count += activity._sum.totalCount || 0;
    materials[materialId].points += activity._sum.points || 0;
  });

  return Object.keys(materials).map(id => ({
    materialId: id,
    materialName: materials[id].name,
    recycleCount: materials[id].count,
    totalPoints: materials[id].points
  }));
}

// Get user engagement metrics
async function getUserEngagement(
  organizationId?: string,
  startDate?: Date,
  endDate?: Date
) {
  // If organizationId is provided, filter users by organization membership
  const userFilter = organizationId
    ? {
        user: {
          members: {
            some: {
              organizationId
            }
          }
        }
      }
    : {};

  const dateFilter = {
    createdAt: {
      gte: startDate,
      lte: endDate
    }
  };

  // Get recycling histories for the time period
  const recyclingHistories = await prisma.recycleHistory.findMany({
    where: {
      ...userFilter,
      ...dateFilter
    },
    select: {
      userId: true,
      points: true,
      totalCount: true,
      createdAt: true,
      user: {
        select: {
          name: true
        }
      }
    }
  });

  // Analyze user engagement
  const userActivity: Record<string, { 
    name: string, 
    recycleCount: number, 
    points: number,
    lastActivity: Date,
    activities: Date[]
  }> = {};

  recyclingHistories.forEach(history => {
    const userId = history.userId;
    
    if (!userActivity[userId]) {
      userActivity[userId] = {
        name: history.user.name,
        recycleCount: 0,
        points: 0,
        lastActivity: history.createdAt,
        activities: []
      };
    }

    userActivity[userId].recycleCount += history.totalCount || 0;
    userActivity[userId].points += history.points || 0;
    userActivity[userId].activities.push(history.createdAt);
    
    if (history.createdAt > userActivity[userId].lastActivity) {
      userActivity[userId].lastActivity = history.createdAt;
    }
  });

  // Calculate engagement metrics
  const userEngagement = Object.keys(userActivity).map(userId => {
    const user = userActivity[userId];
    const activeDays = new Set(
      user.activities.map(date => date.toISOString().split('T')[0])
    ).size;
    
    return {
      userId,
      userName: user.name,
      recycleCount: user.recycleCount,
      totalPoints: user.points,
      activeDays,
      lastActivity: user.lastActivity
    };
  });

  // Sort by total points descending
  return userEngagement.sort((a, b) => b.totalPoints - a.totalPoints);
}

// Get points and rewards summary
async function getPointsAndRewards(
  organizationId?: string,
  startDate?: Date,
  endDate?: Date
) {
  // Filter for organization if provided
  const organizationFilter = organizationId
    ? { organizationId }
    : {};

  const dateFilter = {
    createdAt: {
      gte: startDate,
      lte: endDate
    }
  };

  // Get recycling and redemption data
  const [totalRecycling, totalRedemptions, availableCoupons] = await Promise.all([
    prisma.recycleHistory.aggregate({
      _sum: {
        points: true,
        totalCount: true
      },
      where: organizationId 
        ? {
            bin: {
              store: {
                organizationId
              }
            },
            ...dateFilter
          }
        : dateFilter
    }),
    
    prisma.redeemHistory.aggregate({
      _sum: {
        points: true
      },
      where: organizationId
        ? {
            coupon: {
              organizationId
            },
            ...dateFilter
          }
        : dateFilter
    }),
    
    prisma.coupon.count({
      where: {
        ...organizationFilter,
        status: 'ACTIVE',
        endDate: {
          gte: new Date()
        }
      }
    })
  ]);

  return {
    totalPointsEarned: totalRecycling._sum.points || 0,
    totalRecyclingCount: totalRecycling._sum.totalCount || 0,
    totalPointsRedeemed: totalRedemptions._sum.points || 0,
    redeemedPointsPercent: totalRecycling._sum.points 
      ? Math.round((totalRedemptions._sum.points || 0) / totalRecycling._sum.points * 100)
      : 0,
    availableCoupons
  };
}