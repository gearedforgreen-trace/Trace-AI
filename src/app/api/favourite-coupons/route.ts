import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/servers/sessions';
import { NextResponse, NextRequest } from 'next/server';
import { createPaginator } from 'prisma-pagination';
import type { FavouriteCoupon, Prisma } from '@prisma-gen/client';
import { favouriteCouponSchema } from '@/schemas/schema';

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
          favouriteCoupon: ['list'],
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

    const favouriteCouponsResult = await paginate<
      FavouriteCoupon,
      Prisma.FavouriteCouponFindManyArgs
    >(
      prisma.favouriteCoupon,
      {
        orderBy: {
          createdAt: 'desc',
        },
        where: {
          userId: session.user.id,
        },
        include: {
          coupon: true,
        },
      },
      {
        page: page,
        perPage: perPage,
      }
    );

    return NextResponse.json(favouriteCouponsResult, { status: 200 });
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
          favouriteCoupon: ['create'],
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

    const validatedBody = favouriteCouponSchema.safeParse(body);

    if (validatedBody.error) {
      return NextResponse.json(
        {
          error: 'Unprocessable Content',
          details: validatedBody.error.flatten().fieldErrors,
        },
        { status: 422 }
      );
    }

    const favouriteCoupon = await prisma.favouriteCoupon.create({
      data: {
        userId: session.user.id,
        couponId: validatedBody.data.couponId,
      },
      include: {
        coupon: true,
      },
    });

    return NextResponse.json(
      {
        data: favouriteCoupon,
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
