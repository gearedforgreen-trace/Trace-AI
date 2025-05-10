import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/servers/sessions';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: { redeemHistoryId: string } }
) {
  try {
    const { redeemHistoryId } = await params;

    if (!redeemHistoryId) {
      return NextResponse.json(
        { error: 'Redeem History ID is required' },
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
          redeemHistory: ['detail'],
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

    const redeemHistory = await prisma.redeemHistory.findUnique({
      where: { id: redeemHistoryId, userId: session.user.id },
      include: {
        coupon: true,
      },
    });

    if (!redeemHistory) {
      return NextResponse.json(
        { error: 'Redeem History not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        data: redeemHistory,
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
