import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * DELETE /api/user
 * Allows an authenticated user to delete their own account and all associated data
 * This endpoint is required by Apple's App Store guidelines
 */
export async function DELETE(): Promise<NextResponse> {
  try {
    // Get the current user session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json(
        { message: "Unauthorized. You must be logged in to delete your account." },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Start a transaction to ensure all data is deleted atomically
    await prisma.$transaction(async (tx) => {
      // Manually delete FavouriteCoupon records first
      // (this relation doesn't have explicit cascade delete)
      await tx.favouriteCoupon.deleteMany({
        where: { userId },
      });

      // Delete the user
      // The following will be automatically cascade deleted due to onDelete: Cascade:
      // - Session (sessions)
      // - Account (accounts)
      // - RecycleHistory (recycleHistory)
      // - RedeemHistory (redeemHistory)
      // - Member (members)
      // - Invitation (invitations)
      // - UserTotalPoint (UserTotalPoint)
      await tx.user.delete({
        where: { id: userId },
      });
    });

    // Return success response
    return NextResponse.json(
      {
        message: "Your account has been successfully deleted.",
        success: true
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error deleting user account:", error);

    // Check if it's a Prisma error
    if (error instanceof Error) {
      return NextResponse.json(
        {
          message: "Failed to delete account. Please try again later.",
          error: error.message
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "An unexpected error occurred while deleting your account." },
      { status: 500 }
    );
  }
}
