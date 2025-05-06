import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/servers/sessions';
import { rewardRuleUpdateSchema } from '@/schemas/schema';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: { rewardRuleId: string } }
) {
  try {
    const { rewardRuleId } = await params;

    if (!rewardRuleId) {
      return NextResponse.json(
        { error: 'Reward Rule ID is required' },
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
          rewardRule: ['detail'],
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

    const rewardRule = await prisma.rewardRules.findUnique({
      where: { id: rewardRuleId },
    });

    if (!rewardRule) {
      return NextResponse.json(
        { error: 'Reward Rule not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        data: rewardRule,
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
  { params }: { params: { rewardRuleId: string } }
) {
  try {
    const { rewardRuleId } = await params;

    if (!rewardRuleId) {
      return NextResponse.json(
        { error: 'Reward Rule ID is required' },
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
          rewardRule: ['update'],
        },
      },
    });

    if (!hasUpdatePermission.success) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    const validatedBody = rewardRuleUpdateSchema.safeParse(body);

    if (!validatedBody.success) {
      return NextResponse.json(
        {
          error: 'Unprocessable Content',
          details: validatedBody.error.flatten().fieldErrors,
        },
        { status: 422 }
      );
    }

    const rewardRule = await prisma.rewardRules.update({
      where: { id: rewardRuleId },
      data: validatedBody.data,
    });

    return NextResponse.json({ data: rewardRule }, { status: 200 });
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
  { params }: { params: { rewardRuleId: string } }
) {
  try {
    const { rewardRuleId } = await params;

    if (!rewardRuleId) {
      return NextResponse.json(
        { error: 'Reward Rule ID is required' },
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
          rewardRule: ['delete'],
        },
      },
    });

    if (!hasDeletePermission.success) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const deletedRewardRule = await prisma.rewardRules.delete({
      where: { id: rewardRuleId },
    });

    return NextResponse.json(
      { data: deletedRewardRule, message: 'Reward Rule deleted successfully' },
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
