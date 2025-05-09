import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/servers/sessions';
import { materialUpdateSchema } from '@/schemas/schema';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: { materialId: string } }
) {
  try {
    const { materialId } = await params;

    if (!materialId) {
      return NextResponse.json(
        { error: 'Material ID is required' },
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
          material: ['detail'],
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

    const material = await prisma.material.findUnique({
      where: { id: materialId },
      include:{
        rewardRule: true,
      },
    });

    if (!material) {
      return NextResponse.json(
        { error: 'Material not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        data: material,
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

export async function PUT(
  request: NextRequest,
  { params }: { params: { materialId: string } }
) {
  try {
    const { materialId } = await params;

    if (!materialId) {
      return NextResponse.json(
        { error: 'Material ID is required' },
        { status: 400 }
      );
    }

    const session = await getSession();

    if (!session || !session.user.role) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const hasUpdatePermission = await auth.api.userHasPermission({
      body: {
        role: session.user.role,
        permission: {
          material: ['update'],
        },
      },
    });

    if (!hasUpdatePermission.success) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    const validatedBody = materialUpdateSchema.safeParse(body);

    if (!validatedBody.success) {
      return NextResponse.json(
        {
          error: 'Unprocessable Content',
          details: validatedBody.error.flatten().fieldErrors,
        },
        { status: 422 }
      );
    }

    const material = await prisma.material.update({
      where: { id: materialId },
      data: validatedBody.data,
      include:{
        rewardRule: true,
      },
    });

    return NextResponse.json({ data: material }, { status: 200 });
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
  { params }: { params: { materialId: string } }
) {
  try {
    const { materialId } = await params;

    if (!materialId) {
      return NextResponse.json(
        { error: 'Material ID is required' },
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
          material: ['delete'],
        },
      },
    });

    if (!hasDeletePermission.success) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const deletedMaterial = await prisma.material.delete({
      where: { id: materialId },
    });

    return NextResponse.json(
      { data: deletedMaterial, message: 'Material deleted successfully' },
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
