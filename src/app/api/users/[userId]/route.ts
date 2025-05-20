import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schema for user updates
const updateUserSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  email: z.string().email("Invalid email address").optional(),
  username: z.string().regex(/^[a-zA-Z0-9_]*$/, "Username can only contain letters, numbers, and underscores").optional(),
  displayUsername: z.string().optional(),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  postalCode: z.string().regex(/^\d{5}(-\d{4})?$/, "Invalid postal code format").optional(),
  state: z.string().optional(),
  role: z.enum(["user", "admin", "business_user", "store_manager"]).optional(),
  status: z.enum(["active", "suspended", "banned"]).optional(),
});

// GET single user
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return new NextResponse(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
      });
    }

    const { userId } = await params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
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
    });

    if (!user) {
      return new NextResponse(JSON.stringify({ message: "User not found" }), {
        status: 404,
      });
    }

    // Process user data
    const processedUser = {
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

    return NextResponse.json({ data: processedUser });
  } catch (error) {
    console.error("Error fetching user:", error);
    return new NextResponse(
      JSON.stringify({ message: "Error fetching user" }),
      { status: 500 }
    );
  }
}

// PUT update user
export async function PUT(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return new NextResponse(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
      });
    }

    // Check if user has admin role
    if (session.user.role !== "admin") {
      return new NextResponse(JSON.stringify({ message: "Forbidden" }), {
        status: 403,
      });
    }

    const { userId } = await params;
    const body = await request.json();

    // Validate the update data
    const validationResult = updateUserSchema.safeParse(body);
    if (!validationResult.success) {
      return new NextResponse(
        JSON.stringify({
          message: "Validation error",
          errors: validationResult.error.format(),
        }),
        { status: 400 }
      );
    }

    const updateData = validationResult.data;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return new NextResponse(JSON.stringify({ message: "User not found" }), {
        status: 404,
      });
    }

    // Check for email uniqueness if email is being updated
    if (updateData.email && updateData.email !== existingUser.email) {
      const emailExists = await prisma.user.findFirst({
        where: {
          email: updateData.email,
          id: { not: userId },
        },
      });

      if (emailExists) {
        return new NextResponse(
          JSON.stringify({ message: "Email already exists" }),
          { status: 409 }
        );
      }
    }

    // Check for username uniqueness if username is being updated
    if (updateData.username && updateData.username !== existingUser.username) {
      const usernameExists = await prisma.user.findFirst({
        where: {
          username: updateData.username,
          id: { not: userId },
        },
      });

      if (usernameExists) {
        return new NextResponse(
          JSON.stringify({ message: "Username already exists" }),
          { status: 409 }
        );
      }
    }

    // Update the user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...updateData,
        updatedAt: new Date(),
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
        updatedAt: true,
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
    });

    // Process updated user data
    const processedUser = {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      emailVerified: updatedUser.emailVerified,
      username: updatedUser.username || "",
      displayUsername: updatedUser.displayUsername || "",
      image: updatedUser.image || "",
      phoneNumber: updatedUser.phoneNumber || "",
      address: updatedUser.address || "",
      postalCode: updatedUser.postalCode || "",
      state: updatedUser.state || "",
      status: updatedUser.status,
      role: updatedUser.role || "user",
      organizations: updatedUser.members.map((member) => ({
        id: member.organization.id,
        name: member.organization.name,
        role: member.role,
      })),
      totalPoints: updatedUser.UserTotalPoint?.totalPoints || 0,
      createdAt: updatedUser.createdAt,
    };

    return NextResponse.json({ 
      message: "User updated successfully",
      data: processedUser 
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return new NextResponse(
      JSON.stringify({ message: "Error updating user" }),
      { status: 500 }
    );
  }
}