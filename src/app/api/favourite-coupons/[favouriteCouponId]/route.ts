import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/servers/sessions';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: { favouriteCouponId: string } }
) {
  try {
    const { favouriteCouponId } = await params;

    if (!favouriteCouponId) {
      return NextResponse.json(
        { error: 'Favourite Coupon ID is required' },
        { status: 400 }
      );
    }

    const session = await getSession();

    if (!session || !session.user.role) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
        },
        { status: 401 }
      );
    }

    const hasDetailPermission = await auth.api.userHasPermission({
      body: {
        role: session.user.role,
        permission: {
          favouriteCoupon: ['detail'],
        },
      },
    });

    if (!hasDetailPermission.success) {
      return NextResponse.json(
        {
          error: 'Forbidden',
        },
        { status: 403 }
      );
    }

    const favouriteCoupon = await prisma.favouriteCoupon.findUnique({
      where: { id: favouriteCouponId, userId: session.user.id },
      include: {
        coupon: true,
      },
    });

    if (!favouriteCoupon) {
      return NextResponse.json(
        { error: 'Favourite Coupon not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        data: favouriteCoupon,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { favouriteCouponId: string } }
) {
  try {
    const { favouriteCouponId } = await params;

    if (!favouriteCouponId) {
      return NextResponse.json(
        { error: 'Favourite Coupon ID is required' },
        { status: 400 }
      );
    }

    const session = await getSession();

    if (!session || !session.user.role) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const hasDeletePermission = await auth.api.userHasPermission({
      body: {
        role: session.user.role,
        permission: {
          favouriteCoupon: ['delete'],
        },
      },
    });

    if (!hasDeletePermission.success) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const deletedFavouriteCoupon = await prisma.favouriteCoupon.delete({
      where: { id: favouriteCouponId, userId: session.user.id },
      include: {
        coupon: true,
      },
    });

    return NextResponse.json(
      {
        data: deletedFavouriteCoupon,
        message: 'Favourite Coupon deleted successfully',
      },
      { status: 200 }
    );

    //
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
