import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/servers/sessions';
import { NextResponse, NextRequest } from 'next/server';
import { createPaginator } from 'prisma-pagination';
import type { Prisma, RecycleHistory } from '@prisma/client';
import { TRole } from '@/auth/user-permissions';

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
        role: session.user.role as TRole,
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
        include: {
          bin: {
            include: {
              material: true,
            },
          },
        },
      },
      {
        page: page,
        perPage: perPage,
      }
    );

    // Transform the response to match the expected format
    const transformedData = recycleHistoriesResult.data?.map(
      (history: any) => ({
        id: history.id,
        userId: history.userId,
        binId: history.binId,
        points: history.points,
        materials: [
          {
            id: history.bin.material.id,
            name: history.bin.material.name,
            description: history.bin.material.description,
          },
        ],
        mediaUrl: history.mediaUrl,
        totalCount: history.totalCount,
        createdAt: history.createdAt,
        updatedAt: history.updatedAt,
      })
    );

    return NextResponse.json(
      {
        data: transformedData,
        meta: recycleHistoriesResult.meta,
      },
      { status: 200 }
    );
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

