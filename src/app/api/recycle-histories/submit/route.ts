import prisma from '@/lib/prisma';
import { NextResponse, NextRequest } from 'next/server';
import { getSession } from '@/lib/servers/sessions';
import { z } from 'zod';

const submitRecycleSchema = z.object({
  binId: z.string().uuid('Invalid bin ID'),
  totalCount: z.number().min(1, 'Total count must be at least 1'),
  mediaUrl: z.string().url('Invalid media URL').optional(),
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
    const validatedBody = submitRecycleSchema.safeParse(body);

    if (validatedBody.error) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          details: validatedBody.error.flatten().fieldErrors,
        },
        { status: 422 }
      );
    }

    const { binId, totalCount, mediaUrl } = validatedBody.data;
    const userId = session.user.id;

    // Get bin details with material and reward rule
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

    // Calculate points based on reward rule
    let pointsEarned = 0;
    if (bin.material.rewardRule) {
      const { unit, point } = bin.material.rewardRule;
      pointsEarned = Math.floor((totalCount / unit) * point);
    }

    // Create recycle history and update user points in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create recycle history record
      const recycleHistory = await tx.recycleHistory.create({
        data: {
          userId,
          binId,
          points: pointsEarned,
          totalCount,
          mediaUrl: mediaUrl || null,
        },
        include: {
          bin: {
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
          }
        }
      });

      // Update or create user's total points
      if (pointsEarned > 0) {
        await tx.userTotalPoint.upsert({
          where: { userId },
          update: {
            totalPoints: {
              increment: pointsEarned
            }
          },
          create: {
            userId,
            totalPoints: pointsEarned
          }
        });
      }

      return recycleHistory;
    });

    return NextResponse.json({
      message: 'Recycling recorded successfully',
      data: {
        id: result.id,
        pointsEarned: result.points,
        totalCount: result.totalCount,
        material: {
          id: result.bin.material.id,
          name: result.bin.material.name,
          description: result.bin.material.description
        },
        store: {
          id: result.bin.store.id,
          name: result.bin.store.name,
          organizationName: result.bin.store.organization?.name
        },
        rewardRule: result.bin.material.rewardRule ? {
          name: result.bin.material.rewardRule.name,
          unitType: result.bin.material.rewardRule.unitType,
          unit: result.bin.material.rewardRule.unit,
          point: result.bin.material.rewardRule.point
        } : null,
        recycledAt: result.createdAt,
        mediaUrl: result.mediaUrl
      }
    }, { status: 201 });
    
  } catch (error) {
    console.error('Recycle submission error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}