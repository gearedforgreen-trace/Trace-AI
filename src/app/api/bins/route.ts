import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/servers/sessions';
import { NextResponse, NextRequest } from 'next/server';
import { createPaginator } from 'prisma-pagination';
import type { Bin, Prisma } from '@prisma/client';
import { binSchema } from '@/schemas/schema';
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
          bin: ['list'],
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

    // Check for storeIds and organizationId filters
    const storeIdsParam = request.nextUrl.searchParams.get('storeIds');
    const organizationId = request.nextUrl.searchParams.get('organizationId');
    
    const where: Prisma.BinWhereInput = {};
    
    if (storeIdsParam) {
      const storeIds = storeIdsParam.split(',');
      if (storeIds.length > 0) {
        where.storeId = { in: storeIds };
      }
    }
    
    if (organizationId) {
      where.store = {
        organizationId: organizationId
      };
    }

    const binsResult = await paginate<Bin, Prisma.BinFindManyArgs>(
      prisma.bin,
      {
        where,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          material: {
            include: {
              rewardRule: true,
            },
          },
          store: true,
        },
      },
      {
        page: page,
        perPage: perPage,
      }
    );
    return NextResponse.json(binsResult, { status: 200 });
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
        role: session.user.role as TRole,
        permission: {
          bin: ['create'],
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

    const validatedBody = binSchema.safeParse(body);

    if (validatedBody.error) {
      return NextResponse.json(
        {
          error: 'Unprocessable Content',
          details: validatedBody.error.flatten().fieldErrors,
        },
        { status: 422 }
      );
    }

    const store = await prisma.store.findUnique({
      where: {
        id: validatedBody.data.storeId,
      },
    });

    if (!store) {
      return NextResponse.json(
        { error: 'Store not found' },
        { status: 404 }
      );
    }

    const material = await prisma.material.findUnique({
      where: {
        id: validatedBody.data.materialId,
      },
    });

    if (!material) {
      return NextResponse.json(
        { error: 'Material not found' },
        { status: 404 }
      );
    }

    const bin = await prisma.bin.create({
      data: validatedBody.data,
      include: {
        material: {
          include: {
            rewardRule: true,
          },
        },
        store: true,
      },
    });

    return NextResponse.json(
      {
        data: bin,
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
