import { auth } from "@/lib/auth";

import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return new NextResponse(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
    });
  }

  // Get query parameters
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1");
  const perPage = parseInt(searchParams.get("perPage") || "10");
  const sortBy = searchParams.get("sortBy") || "name";
  const sortOrder = (searchParams.get("sortOrder") || "asc") as "asc" | "desc";
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || undefined;
  const role = searchParams.get("role") || undefined;
  const state = searchParams.get("state") || undefined;

  try {
    // Build filter conditions
    const where: any = {};
    
    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
        { displayUsername: { contains: search, mode: 'insensitive' } },
        { phoneNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Status filter
    if (status) {
      where.status = status;
    }

    // Role filter
    if (role) {
      where.role = role;
    }

    // State filter
    if (state) {
      where.state = state;
    }

    // Get users with pagination and sorting
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * perPage,
        take: perPage,
        orderBy: {
          [sortBy]: sortOrder,
        },
        select: {
          id: true,
          name: true,
          email: true,
          emailVerified: true,
          username: true,
          displayUsername: true,
          image: true,
          phoneNumber: true,
          address: true,
          postalCode: true,
          state: true,
          status: true,
          role: true,
          createdAt: true,
          members: {
            select: {
              organization: {
                select: {
                  id: true,
                  name: true,
                },
              },
              role: true,
            },
          },
          UserTotalPoint: {
            select: {
              totalPoints: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    // Process users data
    const processedUsers = users.map((user) => {
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        username: user.username || "",
        displayUsername: user.displayUsername || "",
        image: user.image || "",
        phoneNumber: user.phoneNumber || "",
        address: user.address || "",
        postalCode: user.postalCode || "",
        state: user.state || "",
        status: user.status,
        role: user.role || "user",
        organizations: user.members.map((member) => ({
          id: member.organization.id,
          name: member.organization.name,
          role: member.role,
        })),
        totalPoints: user.UserTotalPoint?.totalPoints || 0,
        createdAt: user.createdAt,
      };
    });

    // Get unique states for filter options
    const states = await prisma.user.groupBy({
      by: ['state'],
      where: {
        state: {
          not: null,
        },
      },
    });

    // Return the results
    return NextResponse.json({
      data: processedUsers,
      meta: {
        total,
        currentPage: page,
        perPage,
        lastPage: Math.ceil(total / perPage),
        prev: page > 1 ? page - 1 : null,
        next: page < Math.ceil(total / perPage) ? page + 1 : null,
      },
      filters: {
        states: states.map(s => s.state).filter(Boolean),
        statusOptions: ["active", "banned", "suspended"],
        roleOptions: ["admin", "user", "business_user", "store_manager"],
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return new NextResponse(
      JSON.stringify({ message: "Error fetching users" }),
      { status: 500 }
    );
  }
}