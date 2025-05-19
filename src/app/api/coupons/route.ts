import prisma from '@/lib/prisma';
import { NextResponse, NextRequest } from 'next/server';
import { createPaginator } from 'prisma-pagination';
import type { Coupon, Prisma } from '@prisma-gen/client';
import { couponCreateSchema } from '@/schemas/schema';
import { validateSessionAndPermission } from '@/lib/servers/permissions';

const paginate = createPaginator({ perPage: 10, page: 1 });

export async function GET(request: NextRequest) {
  try {
    const validation = await validateSessionAndPermission({
      coupon: ['detail'],
    });

    if (!validation.success) {
      return validation.response;
    }

    const page = Math.max(
      parseInt(request.nextUrl.searchParams.get('page') || '1'),
      1
    );

    const perPage = Math.min(
      parseInt(request.nextUrl.searchParams.get('perPage') || '20'),
      50
    );

    // Check for organizationId filter
    const organizationId = request.nextUrl.searchParams.get('organizationId');
    
    const where: Prisma.CouponWhereInput = {};
    
    if (organizationId) {
      where.organizationId = organizationId;
    }

    const coupons = await paginate<Coupon, Prisma.CouponFindManyArgs>(
      prisma.coupon,
      {
        where,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          organization: true,
        },
      },
      {
        page: page,
        perPage: perPage,
      }
    );
    return NextResponse.json(coupons, { status: 200 });
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
    const validation = await validateSessionAndPermission({
      coupon: ['create'],
    });

    if (!validation.success) {
      return validation.response;
    }

    const body = await request.json();

    const validatedBody = couponCreateSchema.safeParse(body);

    if (validatedBody.error) {
      return NextResponse.json(
        {
          error: 'Unprocessable Content',
          details: validatedBody.error.flatten().fieldErrors,
        },
        { status: 422 }
      );
    }

    // Make sure organizationId is a valid UUID or null
    const data = {
      ...validatedBody.data,
      organizationId: validatedBody.data.organizationId || null,
    };

    const coupon = await prisma.coupon.create({
      data,
      include: {
        organization: true,
      },
    });

    return NextResponse.json(
      {
        data: coupon,
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
