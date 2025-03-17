import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

const prisma = new PrismaClient();

// GET all materials
export async function GET(req: NextRequest) {
  try {
    // Authenticate the request
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    const organizationId = session?.session.activeOrganizationId;
    
    if (!organizationId) {
      return NextResponse.json({ error: 'No active organization' }, { status: 400 });
    }

    const materials = await prisma.material.findMany({
      where: {
        organizationId
      }
    });

    return NextResponse.json(materials);
  } catch (error) {
    console.error('Error fetching materials:', error);
    return NextResponse.json({ error: 'Failed to fetch materials' }, { status: 500 });
  }
}

// POST new material
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    const organizationId = session.session.activeOrganizationId;
    
    if (!organizationId) {
      return NextResponse.json({ error: 'No active organization' }, { status: 400 });
    }

    const { name, description, imageUrl } = await req.json();

    // Validate request body
    if (!name || !imageUrl) {
      return NextResponse.json({ error: 'Name and imageUrl are required' }, { status: 400 });
    }

    const material = await prisma.material.create({
      data: {
        name,
        description,
        imageUrl,
        userId,
        organizationId
      }
    });

    return NextResponse.json(material, { status: 201 });
  } catch (error) {
    console.error('Error creating material:', error);
    return NextResponse.json({ error: 'Failed to create material' }, { status: 500 });
  }
}