import prisma from '@/lib/prisma';
import { NextResponse, NextRequest } from 'next/server';
import { getSession } from '@/lib/servers/sessions';
import { z } from 'zod';

const claimCouponSchema = z.object({
  couponId: z.string().uuid('Invalid coupon ID'),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedBody = claimCouponSchema.safeParse(body);

    if (validatedBody.error) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          details: validatedBody.error.flatten().fieldErrors,
        },
        { status: 422 }
      );
    }

    const { couponId } = validatedBody.data;
    const userId = session.user.id;

    // Check if coupon exists and is active
    const coupon = await prisma.coupon.findUnique({
      where: { id: couponId },
      include: { organization: true },
    });

    if (!coupon) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });
    }

    if (coupon.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Coupon is not active' },
        { status: 400 }
      );
    }

    // Check if coupon is still valid (within date range)
    const now = new Date();
    if (now < coupon.startDate || now > coupon.endDate) {
      return NextResponse.json(
        { error: 'Coupon is not valid at this time' },
        { status: 400 }
      );
    }

    // Get user's total points
    const userTotalPoints = await prisma.userTotalPoint.findUnique({
      where: { userId },
    });

    const availablePoints = userTotalPoints?.totalPoints || 0;

    // Check if user has enough points
    if (availablePoints < coupon.pointsToRedeem) {
      return NextResponse.json(
        {
          error: 'Insufficient points',
          required: coupon.pointsToRedeem,
          available: availablePoints,
        },
        { status: 400 }
      );
    }

    // Generate unique coupon code
    const couponCode = `${coupon.name.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;

    // Create redemption record and update user points in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create redeem history record
      const redeemHistory = await tx.redeemHistory.create({
        data: {
          couponId,
          userId,
          points: coupon.pointsToRedeem,
          couponCode,
          description: `Redeemed coupon: ${coupon.name}`,
        },
        include: {
          coupon: {
            select:{
              name: true,
              imageUrl: true,
              organization: true,
              discountAmount: true,
              dealType: true,
              couponType: true,
            }
          },
        },
      });

      // Update user's total points
      await tx.userTotalPoint.update({
        where: { userId },
        data: {
          totalPoints: {
            decrement: coupon.pointsToRedeem,
          },
        },
      });

      return redeemHistory;
    });

    return NextResponse.json(
      {
        message: 'Coupon claimed successfully',
        data: {
          id: result.id,
          couponCode: result.couponCode,
          couponId: result.couponId,
          couponName: result.coupon.name,
          couponImage: result.coupon.imageUrl,
          pointsRedeemed: result.points,
          organizationId: result.coupon.organization?.id,
          organizationName: result.coupon.organization?.name,
          organizationLogo: result.coupon.organization?.logo,
          organizationSlug: result.coupon.organization?.slug,
          claimedAt: result.createdAt,
          discountAmount: result.coupon.discountAmount,
          dealType: result.coupon.dealType,
          couponType: result.coupon.couponType,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Coupon claim error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
