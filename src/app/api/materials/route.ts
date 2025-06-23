import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/servers/sessions';
import { NextResponse, NextRequest } from 'next/server';
import { createPaginator } from 'prisma-pagination';
import type { Material, Prisma } from '@prisma/client';
import { materialSchema } from '@/schemas/schema';

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
          material: ['list'],
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

    const materialsResult = await paginate<
      Material,
      Prisma.MaterialFindManyArgs
    >(
      prisma.material,
      {
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          rewardRule: {
            select: {
              id: true,
              name: true,
              description: true,
              unitType: true,
              unit: true,
              point: true,
            },
          },
        },
      },
      {
        page: page,
        perPage: perPage,
      }
    );
    return NextResponse.json(materialsResult, { status: 200 });
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
          material: ['create'],
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

    const validatedBody = materialSchema.safeParse(body);

    if (validatedBody.error) {
      return NextResponse.json(
        {
          error: 'Unprocessable Content',
          details: validatedBody.error.flatten().fieldErrors,
        },
        { status: 422 }
      );
    }

    const rewardRule = await prisma.rewardRules.findUnique({
      where: {
        id: validatedBody.data.rewardRuleId,
      },
    });

    if (!rewardRule) {
      return NextResponse.json(
        { error: 'Reward rule not found' },
        { status: 404 }
      );
    }

    const material = await prisma.material.create({
      data: validatedBody.data,
      include: {
        rewardRule: {
          select: {
            id: true,
            name: true,
            description: true,
            unitType: true,
            unit: true,
            point: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        data: material,
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
