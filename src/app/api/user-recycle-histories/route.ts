import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/servers/sessions';
import { NextResponse, NextRequest } from 'next/server';
import { createPaginator } from 'prisma-pagination';
import type { Prisma, RecycleHistory } from '@prisma/client';
import { TRole } from "@/auth/user-permissions";

export const dynamic = 'force-dynamic';


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
          userRecycleHistory: ['list'],
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


    const searchMaterial = request.nextUrl.searchParams.get('searchMaterial') || '';

    const userId = request.nextUrl.searchParams.get('userId') || '';

    const materialId = request.nextUrl.searchParams.get('materialId') || '';

    const storeId = request.nextUrl.searchParams.get('storeId') || '';

    const binId = request.nextUrl.searchParams.get('binId') || '';

    const sortBy = request.nextUrl.searchParams.get('sortBy') || 'createdAt';
    const sortOrder = request.nextUrl.searchParams.get('sortOrder') || 'desc';


    const where: Prisma.RecycleHistoryFindManyArgs['where'] = {
      bin: {
        material: {
          name: { contains: searchMaterial, mode: 'insensitive' },
        },
        materialId: materialId ? materialId : undefined,
        storeId: storeId ? storeId : undefined,
        id: binId ? binId : undefined,
      },
      user: userId ? {
        id: userId,
      } : undefined,
    };

    const recycleHistoriesResult = await paginate<
      RecycleHistory,
      Prisma.RecycleHistoryFindManyArgs
    >(
      prisma.recycleHistory,
      {
        orderBy: {
          [sortBy]: sortOrder,
        },
        include: {
          bin: {
            include: {
              material: true,
              store: {
                select: {
                  id: true,
                  name: true,
                  address1: true,
                  address2: true,
                  city: true,
                  state: true,
                  country: true,
                }
              }
            }
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phoneNumber: true,
              displayUsername: true,
              image: true,
              banned: true,
              role: true,
              status: true,
              emailVerified: true,
              username: true,
              address: true,
              postalCode: true,
            }
          },
        },
        where: {
          ...where
        },
      },
      {
        page: page,
        perPage: perPage,
      }
    );

    // Transform the response to match the expected format
    const transformedData = recycleHistoriesResult.data?.map((history: any) => ({
      id: history.id,
      userId: history.userId,
      binId: history.binId,
      points: history.points,
      mediaUrl: history.mediaUrl,
      totalCount: history.totalCount,
      createdAt: history.createdAt,
      updatedAt: history.updatedAt,
      bin: history.bin,
      user: history.user,
    }));

    return NextResponse.json({
      data: transformedData,
      meta: recycleHistoriesResult.meta
    }, { status: 200 });
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
