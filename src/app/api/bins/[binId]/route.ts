import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/servers/sessions';
import { binUpdateSchema } from '@/schemas/schema';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: { binId: string } }
) {
  try {
    const { binId } = await params;

    if (!binId) {
      return NextResponse.json(
        { error: 'Bin ID is required' },
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
          bin: ['detail'],
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

    const bin = await prisma.bin.findUnique({
      where: { id: binId },
      include:{
        material:true,
        store: true,
      },
    });

    if (!bin) {
      return NextResponse.json({ error: 'Bin not found' }, { status: 404 });
    }

    return NextResponse.json(
      {
        data: bin,
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
  { params }: { params: { binId: string } }
) {
  try {
    const { binId } = await params;

    if (!binId) {
      return NextResponse.json(
        { error: 'Bin ID is required' },
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
          bin: ['update'],
        },
      },
    });

    if (!hasUpdatePermission.success) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    const validatedBody = binUpdateSchema.safeParse(body);

    if (!validatedBody.success) {
      return NextResponse.json(
        {
          error: 'Unprocessable Content',
          details: validatedBody.error.flatten().fieldErrors,
        },
        { status: 422 }
      );
    }

    const bin = await prisma.bin.update({
      where: { id: binId },
      data: validatedBody.data,
      include:{
        material:true,
        store: true,
      },
    });

    return NextResponse.json({ data: bin }, { status: 200 });
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
  { params }: { params: { binId: string } }
) {
  try {
    const { binId } = await params;

    if (!binId) {
      return NextResponse.json(
        { error: 'Bin ID is required' },
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
          bin: ['delete'],
        },
      },
    });

    if (!hasDeletePermission.success) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const deletedBin = await prisma.bin.delete({
      where: { id: binId },
    });

    return NextResponse.json(
      { data: deletedBin, message: 'Bin deleted successfully' },
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
