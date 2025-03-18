import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

const prisma = new PrismaClient();

// GET bin by ID
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

    const bin = await prisma.bin.findUnique({
      where: {
        id,
        organizationId
      },
      include: {
        Material: true,
        Store: true
      }
    });

    if (!bin) {
      return NextResponse.json({ error: 'Bin not found' }, { status: 404 });
    }

    return NextResponse.json(bin);
  } catch (error) {
    console.error('Error fetching bin:', error);
    return NextResponse.json({ error: 'Failed to fetch bin' }, { status: 500 });
  }
}

// PUT (update) bin by ID
export async function PUT(
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
    
    const userId = session.user.id;
    const { organizationId, id } = context.params;

    const { 
      number, 
      typeOfMaterialId, 
      storeId, 
      description, 
      imageUrl,
      status,
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

    // Check if the bin exists and belongs to the organization
    const existingBin = await prisma.bin.findUnique({
      where: {
        id,
        organizationId
      }
    });

    if (!existingBin) {
      return NextResponse.json({ error: 'Bin not found' }, { status: 404 });
    }

    // Verify that material exists and belongs to organization
    if (typeOfMaterialId) {
      const material = await prisma.material.findUnique({
        where: {
          id: typeOfMaterialId,
          organizationId
        }
      });

      if (!material) {
        return NextResponse.json({ error: 'Material not found or does not belong to this organization' }, { status: 404 });
      }
    }

    // Verify that store exists and belongs to organization
    if (storeId) {
      const store = await prisma.store.findUnique({
        where: {
          id: storeId,
          organizationId
        }
      });

      if (!store) {
        return NextResponse.json({ error: 'Store not found or does not belong to this organization' }, { status: 404 });
      }
    }

    const updatedBin = await prisma.bin.update({
      where: { id },
      data: {
        number,
        typeOfMaterialId,
        storeId,
        description,
        imageUrl,
        status,
        userId, // Update with the current user ID
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

    return NextResponse.json(updatedBin);
  } catch (error) {
    console.error('Error updating bin:', error);
    return NextResponse.json({ error: 'Failed to update bin' }, { status: 500 });
  }
}

// DELETE bin by ID
export async function DELETE(
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

    // Check if the bin exists and belongs to the organization
    const existingBin = await prisma.bin.findUnique({
      where: {
        id,
        organizationId
      }
    });

    if (!existingBin) {
      return NextResponse.json({ error: 'Bin not found' }, { status: 404 });
    }

    await prisma.bin.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting bin:', error);
    return NextResponse.json({ error: 'Failed to delete bin' }, { status: 500 });
  }
}