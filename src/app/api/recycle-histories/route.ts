import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/servers/sessions';
import { NextResponse, NextRequest } from 'next/server';
import { createPaginator } from 'prisma-pagination';
import type { Prisma, RecycleHistory } from '@prisma-gen/client';
import { recycleHistorySchema } from '@/schemas/schema';
import { calculateRecyclePoints } from '@/services/recycle.services';

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
          recycleHistory: ['list'],
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

    const recycleHistoriesResult = await paginate<
      RecycleHistory,
      Prisma.RecycleHistoryFindManyArgs
    >(
      prisma.recycleHistory,
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

    return NextResponse.json(recycleHistoriesResult, { status: 200 });
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
          recycleHistory: ['create'],
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

    const validatedBody = recycleHistorySchema.safeParse(body);

    if (validatedBody.error) {
      return NextResponse.json(
        {
          error: 'Unprocessable Content',
          details: validatedBody.error.flatten().fieldErrors,
        },
        { status: 422 }
      );
    }

    const bin = await prisma.bin.findUnique({
      where: {
        id: validatedBody.data.binId,
      },
      include: {
        material: {
          include: {
            rewardRule: true,
          },
        },
      },
    });

    if (!bin) {
      return NextResponse.json({ error: 'Bin not found' }, { status: 404 });
    }

    if (bin.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Bin is not active' }, { status: 403 });
    }

    if (!bin.material.rewardRule?.point) {
      return NextResponse.json(
        { error: 'Bin material has no reward rule point' },
        { status: 400 }
      );
    }

    const totalPoints = calculateRecyclePoints(
      validatedBody.data.totalCount,
      bin.material.rewardRule.point
    );

    const recycleHistory = await prisma.recycleHistory.create({
      data: {
        userId: session.user.id,
        binId: validatedBody.data.binId,
        points: totalPoints,
        mediaUrl: validatedBody.data.mediaUrl,
      },
      include: {
        bin: {
          include: {
            material: {
              include: { rewardRule: true },
            },
          },
        },
      },
    });

    return NextResponse.json(
      {
        data: recycleHistory,
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
