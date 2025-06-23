import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/servers/sessions';
import { NextResponse, NextRequest } from 'next/server';
import { organizationSchema } from '@/schemas/organization.schema';
import { TRole } from "@/auth/user-permissions";

export async function GET(
  request: NextRequest,
  { params }: { params: { organizationId: string } }
) {
  try {
    const { organizationId } = await params;
    const session = await getSession();

    if (!session || !session.user.role) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
        },
        { status: 401 }
      );
    }

    // Admin can access any organization
    if (session.user.role !== "admin") {
      // For regular users, check if they're a member of this organization
      const memberCheck = await prisma.member.findFirst({
        where: {
          organizationId: organizationId,
          userId: session.user.id,
        },
      });

      if (!memberCheck) {
        return NextResponse.json(
          {
            error: 'Forbidden',
          },
          { status: 403 }
        );
      }
    }

    const organization = await prisma.organization.findUnique({
      where: {
        id: organizationId,
      },
      include: {
        members: true,
      },
    });

    if (!organization) {
      return NextResponse.json(
        {
          error: 'Not Found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        data: organization,
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
  { params }: { params: { organizationId: string } }
) {
  try {
    const { organizationId } = await params;
    const session = await getSession();

    if (!session || !session.user.role) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
        },
        { status: 401 }
      );
    }

    const hasUpdatePermission = await auth.api.userHasPermission({
      body: {
        role: session.user.role as TRole,
        permission: {
          organization: ['update'],
        },
      },
    });

    if (!hasUpdatePermission.success) {
      return NextResponse.json(
        {
          error: 'Forbidden',
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    const validatedBody = organizationSchema.safeParse(body);

    if (validatedBody.error) {
      return NextResponse.json(
        {
          error: 'Unprocessable Content',
          details: validatedBody.error.flatten().fieldErrors,
        },
        { status: 422 }
      );
    }

    const organization = await prisma.organization.update({
      where: {
        id: organizationId,
      },
      data: {
        name: validatedBody.data.name,
        slug: validatedBody.data.slug || null,
        logo: validatedBody.data.logo || null,
        metadata: validatedBody.data.metadata ? JSON.stringify(validatedBody.data.metadata) : null,
      },
    });

    return NextResponse.json(
      {
        data: organization,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error(error);
    if (error.code === 'P2025') {
      return NextResponse.json(
        {
          error: 'Not Found',
        },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { organizationId: string } }
) {
  try {
    const { organizationId } = await params;
    const session = await getSession();

    if (!session || !session.user.role) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
        },
        { status: 401 }
      );
    }

    const hasDeletePermission = await auth.api.userHasPermission({
      body: {
        role: session.user.role as TRole,
        permission: {
          organization: ['delete'],
        },
      },
    });

    if (!hasDeletePermission.success) {
      return NextResponse.json(
        {
          error: 'Forbidden',
        },
        { status: 403 }
      );
    }

    await prisma.organization.delete({
      where: {
        id: organizationId,
      },
    });

    return NextResponse.json(
      {
        message: 'Organization deleted successfully',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error(error);
    if (error.code === 'P2025') {
      return NextResponse.json(
        {
          error: 'Not Found',
        },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}