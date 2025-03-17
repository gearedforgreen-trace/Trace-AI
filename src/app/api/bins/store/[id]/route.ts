import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

const prisma = new PrismaClient();

// GET bins by store ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
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

    const { id: storeId } = params;
    
    // Verify that store exists and belongs to organization
    const store = await prisma.store.findUnique({
      where: {
        id: storeId,
        organizationId
      }
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found or does not belong to this organization' }, { status: 404 });
    }

    // Get query parameters
    const url = new URL(req.url);
    const materialId = url.searchParams.get('materialId');
    const status = url.searchParams.get('status');
    const limit = url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')!) : 100;
    const offset = url.searchParams.get('offset') ? parseInt(url.searchParams.get('offset')!) : 0;
    
    // Build where clause
    const whereClause: any = { 
      storeId,
      organizationId 
    };
    
    if (materialId) whereClause.typeOfMaterialId = materialId;
    if (status) whereClause.status = status;

    const bins = await prisma.bin.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: offset,
      include: {
        Material: true
      }
    });
    
    // Get total count for pagination
    const total = await prisma.bin.count({
      where: whereClause
    });

    return NextResponse.json({
      store,
      bins,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    });
  } catch (error) {
    console.error('Error fetching bins for store:', error);
    return NextResponse.json({ error: 'Failed to fetch bins' }, { status: 500 });
  }
}