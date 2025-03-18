import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

const prisma = new PrismaClient();

// GET all stores for an organization
export async function GET(
  req: NextRequest,
  context: { params: { organizationId: string } }
) {
  try {
    // Authenticate the request
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { organizationId } = context.params;

    const stores = await prisma.store.findMany({
      where: {
        organizationId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(stores);
  } catch (error) {
    console.error('Error fetching stores:', error);
    return NextResponse.json({ error: 'Failed to fetch stores' }, { status: 500 });
  }
}

// POST new store
export async function POST(
  req: NextRequest,
  context: { params: { organizationId: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    const { organizationId } = context.params;

    const { name, description, imageUrl } = await req.json();

    // Validate request body
    if (!name || !imageUrl) {
      return NextResponse.json({ error: 'Name and imageUrl are required' }, { status: 400 });
    }

    const store = await prisma.store.create({
      data: {
        name,
        description,
        imageUrl,
        userId,
        organizationId
      }
    });

    return NextResponse.json(store, { status: 201 });
  } catch (error) {
    console.error('Error creating store:', error);
    return NextResponse.json({ error: 'Failed to create store' }, { status: 500 });
  }
}