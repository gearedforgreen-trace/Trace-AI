import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

const prisma = new PrismaClient();

// GET bins by material ID
export async function GET(
  req: NextRequest,
  context: { params: { organizationId: string; id: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { organizationId, id } = context.params;

    // First check if the material exists and belongs to the organization
    const material = await prisma.material.findUnique({
      where: {
        id,
        organizationId
      }
    });

    if (!material) {
      return NextResponse.json({ error: 'Material not found or does not belong to this organization' }, { status: 404 });
    }

    const bins = await prisma.bin.findMany({
      where: {
        typeOfMaterialId: id,
        organizationId
      },
      include: {
        Material: true,
        Store: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(bins);
  } catch (error) {
    console.error('Error fetching bins by material:', error);
    return NextResponse.json({ error: 'Failed to fetch bins' }, { status: 500 });
  }
}