import prisma from '@/lib/prisma';
import { NextResponse, NextRequest } from 'next/server';
import { getSession } from '@/lib/servers/sessions';
import { z } from 'zod';

const scanBinSchema = z.object({
  binId: z.string().uuid('Invalid bin ID'),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedBody = scanBinSchema.safeParse(body);

    if (validatedBody.error) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          details: validatedBody.error.flatten().fieldErrors,
        },
        { status: 422 }
      );
    }

    const { binId } = validatedBody.data;

    // Get bin details with related data
    const bin = await prisma.bin.findUnique({
      where: { id: binId },
      include: {
        material: {
          include: {
            rewardRule: true
          }
        },
        store: {
          include: {
            organization: true
          }
        }
      }
    });

    if (!bin) {
      return NextResponse.json(
        { error: 'Bin not found' },
        { status: 404 }
      );
    }

    if (bin.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Bin is not active' },
        { status: 400 }
      );
    }

    if (bin.store.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Store is not active' },
        { status: 400 }
      );
    }

    // Return bin information for the mobile app to show to user
    return NextResponse.json({
      message: 'Bin scanned successfully',
      data: {
        bin: {
          id: bin.id,
          number: bin.number,
          description: bin.description,
          status: bin.status
        },
        material: {
          id: bin.material.id,
          name: bin.material.name,
          description: bin.material.description
        },
        store: {
          id: bin.store.id,
          name: bin.store.name,
          address1: bin.store.address1,
          city: bin.store.city,
          state: bin.store.state,
          organizationName: bin.store.organization?.name
        },
        rewardRule: bin.material.rewardRule ? {
          id: bin.material.rewardRule.id,
          name: bin.material.rewardRule.name,
          description: bin.material.rewardRule.description,
          unitType: bin.material.rewardRule.unitType,
          unit: bin.material.rewardRule.unit,
          point: bin.material.rewardRule.point
        } : null,
        instructions: `You are about to recycle ${bin.material.name} at ${bin.store.name}. ${bin.material.rewardRule ? `You will earn ${bin.material.rewardRule.point} points per ${bin.material.rewardRule.unit} ${bin.material.rewardRule.unitType}.` : 'No points available for this material.'}`
      }
    }, { status: 200 });
    
  } catch (error) {
    console.error('Bin scan error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}