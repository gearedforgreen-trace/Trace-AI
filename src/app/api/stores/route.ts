import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/servers/sessions';
import { NextResponse, NextRequest } from 'next/server';
import { createPaginator } from 'prisma-pagination';
import type { Prisma, Store } from '@prisma-gen/client';
import { storeSchema } from '@/schemas/schema';

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
          store: ['list'],
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

    // Check for organizationId filter
    const organizationId = request.nextUrl.searchParams.get('organizationId');
    
    const where: Prisma.StoreWhereInput = {};
    
    if (organizationId) {
      where.organizationId = organizationId;
    }

    console.log('Query parameters:', {
      organizationId,
      page,
      perPage
    });
    console.log('Where clause:', where);

    // First check if any stores exist with this organization ID
    const storeCount = await prisma.store.count({
      where: {
        organizationId
      }
    });
    
    console.log('Store count with this organization ID:', storeCount);

    // Also check if the organization exists
    const organization = organizationId 
      ? await prisma.organization.findUnique({
          where: {
            id: organizationId
          }
        })
      : null;
    
    console.log('Organization exists:', !!organization);

    const storesResult = await paginate<Store, Prisma.StoreFindManyArgs>(
      prisma.store,
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
    
    // Add organization name to each store for easier access in frontend
    if (storesResult.data) {
      storesResult.data = storesResult.data.map(store => ({
        ...store,
        organizationName: store.organization?.name || null
      }));
    }
    return NextResponse.json(storesResult, { status: 200 });
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
          store: ['create'],
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

    const validatedBody = storeSchema.safeParse(body);

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

    const store = await prisma.store.create({
      data,
    });

    return NextResponse.json(
      {
        data: store,
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
