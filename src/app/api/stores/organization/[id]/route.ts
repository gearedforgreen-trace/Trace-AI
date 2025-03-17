import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

const prisma = new PrismaClient();

// GET stores by organization ID
export async function GET(req: NextRequest, context: { params: { id: string } }) {
  try {
    // Authenticate the request
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id: organizationId } = context.params;
    
    // Check if user has permission to access this organization
    const membership = await prisma.member.findFirst({
      where: {
        organizationId,
        userId: session.user.id
      }
    });
    
    if (!membership) {
      return NextResponse.json({ error: 'Unauthorized access to organization' }, { status: 403 });
    }

    // Get query parameters
    const url = new URL(req.url);
    const status = url.searchParams.get('status');
    const limit = url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')!) : 100;
    const offset = url.searchParams.get('offset') ? parseInt(url.searchParams.get('offset')!) : 0;
    
    // Build where clause
    const whereClause: any = { organizationId };
    if (status) {
      whereClause.status = status;
    }

    const stores = await prisma.store.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: offset,
      include: {
        _count: {
          select: {
            Bin: true
          }
        }
      }
    });
    
    // Get total count for pagination
    const total = await prisma.store.count({
      where: whereClause
    });

    return NextResponse.json({
      stores,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    });
  } catch (error) {
    console.error('Error fetching stores for organization:', error);
    return NextResponse.json({ error: 'Failed to fetch stores' }, { status: 500 });
  }
}