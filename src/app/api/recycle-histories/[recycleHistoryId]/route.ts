import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/servers/sessions';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: { recycleHistoryId: string } }
) {
  try {
    const { recycleHistoryId } = await params;

    if (!recycleHistoryId) {
      return NextResponse.json(
        { error: 'Recycle History ID is required' },
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
          recycleHistory: ['detail'],
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

    const recycleHistory = await prisma.recycleHistory.findUnique({
      where: { id: recycleHistoryId, userId: session.user.id },
      include: {
        bin: {
          include: {
            material: {
              include: {
                rewardRule: true,
              },
            },
          },
        },
      },
    });

    if (!recycleHistory) {
      return NextResponse.json(
        { error: 'Recycle History not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        data: recycleHistory,
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
