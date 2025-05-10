import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/servers/sessions';
import { NextResponse, NextRequest } from 'next/server';
import { createPaginator } from 'prisma-pagination';
import type { Prisma, RedeemHistory } from '@prisma-gen/client';
import { redeemHistorySchema } from '@/schemas/schema';
import { generateSecureCouponCode } from '@/services/coupons.services';

const paginate = createPaginator({ perPage: 10, page: 1 });

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session || !session.user.role) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
        },
        { status: 401 }
      );
    }

    const hasListPermission = await auth.api.userHasPermission({
      body: {
        role: session.user.role,
        permission: {
          redeemHistory: ['list'],
        },
      },
    });

    if (!hasListPermission.success) {
      return NextResponse.json(
        {
          error: 'Forbidden',
        },
        { status: 403 }
      );
    }

    const page = Math.max(
      parseInt(request.nextUrl.searchParams.get('page') || '1'),
      1
    );

    const perPage = Math.min(
      parseInt(request.nextUrl.searchParams.get('perPage') || '20'),
      50
    );

    const redeemHistoriesResult = await paginate<
      RedeemHistory,
      Prisma.RedeemHistoryFindManyArgs
    >(
      prisma.redeemHistory,
      {
        orderBy: {
          createdAt: 'desc',
        },
        where: {
          userId: session.user.id,
        },
      },
      {
        page: page,
        perPage: perPage,
      }
    );

    return NextResponse.json(redeemHistoriesResult, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session || !session.user.role) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
        },
        { status: 401 }
      );
    }

    const hasCreatePermission = await auth.api.userHasPermission({
      body: {
        role: session.user.role,
        permission: {
          redeemHistory: ['create'],
        },
      },
    });

    if (!hasCreatePermission.success) {
      return NextResponse.json(
        {
          error: 'Forbidden',
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    const validatedBody = redeemHistorySchema.safeParse(body);

    if (validatedBody.error) {
      return NextResponse.json(
        {
          error: 'Unprocessable Content',
          details: validatedBody.error.flatten().fieldErrors,
        },
        { status: 422 }
      );
    }

    const coupon = await prisma.coupon.findUnique({
      where: {
        id: validatedBody.data.couponId,
      },
    });

    if (!coupon) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });
    }

    if (coupon.dealType === 'NOPOINTS') {
      return NextResponse.json(
        { error: 'Coupon is not redeemable' },
        { status: 403 }
      );
    }

    const userTotalPoint = await prisma.userTotalPoint.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    if (!userTotalPoint) {
      return NextResponse.json(
        { error: 'You have no points to redeem' },
        { status: 400 }
      );
    }

    if (userTotalPoint.totalPoints === 0) {
      return NextResponse.json(
        { error: 'You have no points to redeem' },
        { status: 400 }
      );
    }

    if (userTotalPoint.totalPoints < coupon.pointsToRedeem) {
      return NextResponse.json(
        {
          error: `You need ${
            coupon.pointsToRedeem - userTotalPoint.totalPoints
          } points to redeem this coupon`,
        },
        { status: 400 }
      );
    }

    if (coupon.status === 'INACTIVE') {
      return NextResponse.json(
        { error: 'Coupon is not active' },
        { status: 400 }
      );
    }

    if (!coupon.pointsToRedeem) {
      return NextResponse.json(
        { error: 'Coupon does not have points to redeem' },
        { status: 400 }
      );
    }

    const couponCode = generateSecureCouponCode();

    const redeemHistory = await prisma.redeemHistory.create({
      data: {
        couponId: validatedBody.data.couponId,
        userId: session.user.id,
        points: coupon.pointsToRedeem,
        couponCode,
        description: validatedBody.data.description,
      },
    });

    return NextResponse.json(
      {
        data: redeemHistory,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
