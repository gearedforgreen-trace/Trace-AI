import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

const prisma = new PrismaClient();

// GET all bins for an organization
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
    
    // Get query parameters
    const url = new URL(req.url);
    const storeId = url.searchParams.get('storeId');
    const materialId = url.searchParams.get('materialId');
    const status = url.searchParams.get('status');
    
    // Build where clause
    const whereClause: any = { organizationId };
    if (storeId) whereClause.storeId = storeId;
    if (materialId) whereClause.typeOfMaterialId = materialId;
    if (status) whereClause.status = status;

    const bins = await prisma.bin.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        Material: true,
        Store: true
      }
    });

    return NextResponse.json(bins);
  } catch (error) {
    console.error('Error fetching bins:', error);
    return NextResponse.json({ error: 'Failed to fetch bins' }, { status: 500 });
  }
}

// POST new bin
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

    const { 
      number, 
      typeOfMaterialId, 
      storeId, 
      description, 
      imageUrl,
      address1,
      address2,
      city,
      state,
      zip,
      country
    } = await req.json();

    // Validate required fields
    if (!number || !typeOfMaterialId || !storeId || !imageUrl || !address1 || !city || !state || !zip || !country) {
      return NextResponse.json({ 
        error: 'Missing required fields', 
        required: ['number', 'typeOfMaterialId', 'storeId', 'imageUrl', 'address1', 'city', 'state', 'zip', 'country'] 
      }, { status: 400 });
    }

    // Verify that material exists and belongs to organization
    const material = await prisma.material.findUnique({
      where: {
        id: typeOfMaterialId,
        organizationId
      }
    });

    if (!material) {
      return NextResponse.json({ error: 'Material not found or does not belong to this organization' }, { status: 404 });
    }

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

    const bin = await prisma.bin.create({
      data: {
        number,
        typeOfMaterialId,
        storeId,
        description,
        imageUrl,
        userId,
        organizationId,
        address1,
        address2,
        city,
        state,
        zip,
        country
      },
      include: {
        Material: true,
        Store: true
      }
    });

    return NextResponse.json(bin, { status: 201 });
  } catch (error) {
    console.error('Error creating bin:', error);
    return NextResponse.json({ error: 'Failed to create bin' }, { status: 500 });
  }
}