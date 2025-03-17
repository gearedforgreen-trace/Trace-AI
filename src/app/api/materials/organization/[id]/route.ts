import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

const prisma = new PrismaClient();

// GET materials by organization ID
export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    // Authenticate the request
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id: organizationId } = await context.params;
    
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

    const materials = await prisma.material.findMany({
      where: {
        organizationId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(materials);
  } catch (error) {
    console.error('Error fetching materials for organization:', error);
    return NextResponse.json({ error: 'Failed to fetch materials' }, { status: 500 });
  }
}