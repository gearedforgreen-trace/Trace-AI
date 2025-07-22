import prisma from '@/lib/prisma';
import { NextResponse, NextRequest } from 'next/server';
import { getSession } from '@/lib/servers/sessions';
import { z } from 'zod';
import { analyseMaterialAndCount } from '@/lib/openai';
import {
  deleteImageFromCloudinary,
  uploadAnalyzeMaterialImageToCloudinary,
} from '@/lib/cloudinary';

const submitRecycleSchema = z.object({
  binId: z.string().uuid('Invalid bin ID'),
  totalCount: z.number().min(1, 'Total count must be at least 1'),
  mediaUrl: z.string().url('Invalid media URL'),
});

export async function POST(request: NextRequest) {
  const uploadedResult: {
    public_id: string | null;
    fixed_size_url: string | null;
  } | null = {
    public_id: null,
    fixed_size_url: null,
  };

  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

    const { binId, totalCount } = validatedBody.data;

    const userId = session.user.id;

    // Get bin details with material and reward rule
    const bin = await prisma.bin.findUnique({
      where: { id: binId },
      include: {
        material: {
          include: {
            rewardRule: true,
          },
        },
        store: {
          include: {
            organization: true,
          },
        },
      },
    });

    if (!bin) {
      return NextResponse.json({ error: 'Bin not found' }, { status: 404 });
    }

    if (bin.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Bin is not active' }, { status: 400 });
    }

    const material = bin.material.name;
    const materialImageUrl = validatedBody.data.mediaUrl;

    if (!materialImageUrl) {
      throw new Error('Media URL is required');
    }

    if (!material) {
      throw new Error('Material name is not found');
    }

    uploadedResult.public_id = 'analyze-material-image-' + crypto.randomUUID();

    const uploadedMediaResult = await uploadAnalyzeMaterialImageToCloudinary(
      materialImageUrl,
      uploadedResult.public_id
    );

    if (!uploadedMediaResult) {
      throw new Error('Failed to upload media to Cloudinary');
    }

    uploadedResult.fixed_size_url = uploadedMediaResult.fixed_size_url;

    if (!uploadedResult.fixed_size_url) {
      throw new Error('Failed to upload media to Cloudinary');
    }

    const analyseMaterialAndCountResult = await analyseMaterialAndCount({
      claim_count: totalCount,
      min_confidence: 0.75,
      image_url: uploadedResult.fixed_size_url,
      material,
    });

    const sameConcatMessage =
      'Please try again with the correct material or try again with a clearer image';

    if (analyseMaterialAndCountResult?.status_reason === 'count_discrepancy') {
      if (uploadedResult.public_id) {
        await deleteImageFromCloudinary(uploadedResult.public_id);
      }

      return NextResponse.json(
        {
          errorType: 'count_discrepancy',
          errorMessage:
            analyseMaterialAndCountResult.failure_message +
            sameConcatMessage,
        },
        { status: 400 }
      );
    }

    if (analyseMaterialAndCountResult?.status_reason === 'low_confidence') {
      if (uploadedResult.public_id) {
        await deleteImageFromCloudinary(uploadedResult.public_id);
      }

      return NextResponse.json(
        {
          errorType: 'low_confidence',
          errorMessage:
            analyseMaterialAndCountResult.failure_message + sameConcatMessage,
        },
        { status: 400 }
      );
    }

    if (analyseMaterialAndCountResult?.status_reason === 'material_mismatch') {
      if (uploadedResult.public_id) {
        await deleteImageFromCloudinary(uploadedResult.public_id);
      }

      return NextResponse.json(
        {
          errorType: 'material_mismatch',
          errorMessage:
            analyseMaterialAndCountResult.failure_message + sameConcatMessage,
        },
        { status: 400 }
      );
    }

    if (analyseMaterialAndCountResult?.status_reason === 'no_items_detected') {
      if (uploadedResult.public_id) {
        await deleteImageFromCloudinary(uploadedResult.public_id);
      }

      return NextResponse.json(
        {
          errorType: 'no_items_detected',
          errorMessage:
            analyseMaterialAndCountResult.failure_message + sameConcatMessage,
        },
        { status: 400 }
      );
    }

    if (analyseMaterialAndCountResult?.status_reason === 'image_not_clear') {
      if (uploadedResult.public_id) {
        await deleteImageFromCloudinary(uploadedResult.public_id);
      }

      return NextResponse.json(
        {
          errorType: 'image_not_clear',
          errorMessage:
            analyseMaterialAndCountResult.failure_message + sameConcatMessage,
        },
        { status: 400 }
      );
    }

    if (analyseMaterialAndCountResult?.reverify_required) {
      if (uploadedResult.public_id) {
        await deleteImageFromCloudinary(uploadedResult.public_id);
      }

      return NextResponse.json(
        {
          errorType: 'reverify_required',
          errorMessage:
            analyseMaterialAndCountResult.failure_message + sameConcatMessage,
        },
        { status: 400 }
      );
    }

    if (
      analyseMaterialAndCountResult?.status !== 'accept' &&
      analyseMaterialAndCountResult?.itemName !== material
    ) {
      if (uploadedResult.public_id) {
        await deleteImageFromCloudinary(uploadedResult.public_id);
      }

      return NextResponse.json(
        {
          errorType: 'reject',
          errorMessage: sameConcatMessage,
        },
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
          mediaUrl: uploadedResult.fixed_size_url,
        },
        include: {
          bin: {
            include: {
              material: {
                include: {
                  rewardRule: true,
                },
              },
              store: {
                include: {
                  organization: true,
                },
              },
            },
          },
        },
      });

      // Update or create user's total points
      if (pointsEarned > 0) {
        await tx.userTotalPoint.upsert({
          where: { userId },
          update: {
            totalPoints: {
              increment: pointsEarned,
            },
          },
          create: {
            userId,
            totalPoints: pointsEarned,
          },
        });
      }

      return recycleHistory;
    });

    return NextResponse.json(
      {
        message: 'Recycle history created successfully',
        data: {
          id: result.id,
          pointsEarned: result.points,
          totalCount: result.totalCount,
          material: {
            id: result.bin.material.id,
            name: result.bin.material.name,
            description: result.bin.material.description,
          },
          store: {
            id: result.bin.store.id,
            name: result.bin.store.name,
            organizationName: result.bin.store.organization?.name,
          },
          rewardRule: result.bin.material.rewardRule
            ? {
                name: result.bin.material.rewardRule.name,
                unitType: result.bin.material.rewardRule.unitType,
                unit: result.bin.material.rewardRule.unit,
                point: result.bin.material.rewardRule.point,
              }
            : null,
          recycledAt: result.createdAt,
          mediaUrl: uploadedResult.fixed_size_url,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Recycle submission error:', error);
    if (uploadedResult.public_id) {
      await deleteImageFromCloudinary(uploadedResult.public_id);
    }
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
