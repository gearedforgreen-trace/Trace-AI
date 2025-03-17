import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

const prisma = new PrismaClient();

// GET bins by material ID
export async function GET(req: NextRequest, context: { params: { id: string } }) {
  try {
    // Authenticate the request
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const organizationId = session.session.activeOrganizationId;
    
    if (!organizationId) {
      return NextResponse.json({ error: 'No active organization' }, { status: 400 });
    }

    const { id: materialId } = context.params;
    
    // Verify that material exists and belongs to organization
    const material = await prisma.material.findUnique({
      where: {
        id: materialId,
        organizationId
      }
    });

    if (!material) {
      return NextResponse.json({ error: 'Material not found or does not belong to this organization' }, { status: 404 });
    }

    // Get query parameters
    const url = new URL(req.url);
    const storeId = url.searchParams.get('storeId');
    const status = url.searchParams.get('status');
    const limit = url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')!) : 100;
    const offset = url.searchParams.get('offset') ? parseInt(url.searchParams.get('offset')!) : 0;
    
    // Build where clause
    const whereClause: any = { 
      typeOfMaterialId: materialId,
      organizationId 
    };
    
    if (storeId) whereClause.storeId = storeId;
    if (status) whereClause.status = status;

    const bins = await prisma.bin.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: offset,
      include: {
        Store: true
      }
    });
    
    // Get total count for pagination
    const total = await prisma.bin.count({
      where: whereClause
    });

    return NextResponse.json({
      material,
      bins,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    });
  } catch (error) {
    console.error('Error fetching bins for material:', error);
    return NextResponse.json({ error: 'Failed to fetch bins' }, { status: 500 });
  }
}