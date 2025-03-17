import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

const prisma = new PrismaClient();

// GET material by ID
export async function GET(req: NextRequest, context: { params: { id: string } }) {
  try {
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

    const { id } = context.params;

    const material = await prisma.material.findUnique({
      where: {
        id,
        organizationId
      }
    });

    if (!material) {
      return NextResponse.json({ error: 'Material not found' }, { status: 404 });
    }

    return NextResponse.json(material);
  } catch (error) {
    console.error('Error fetching material:', error);
    return NextResponse.json({ error: 'Failed to fetch material' }, { status: 500 });
  }
}

// PUT (update) material by ID
export async function PUT(req: NextRequest, context: { params: { id: string } }) {
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

    const { id } = context.params;
    const { name, description, imageUrl, status } = await req.json();

    // Validate request body
    if (!name || !imageUrl) {
      return NextResponse.json({ error: 'Name and imageUrl are required' }, { status: 400 });
    }

    // Check if the material exists and belongs to the organization
    const existingMaterial = await prisma.material.findUnique({
      where: {
        id,
        organizationId
      }
    });

    if (!existingMaterial) {
      return NextResponse.json({ error: 'Material not found' }, { status: 404 });
    }

    const updatedMaterial = await prisma.material.update({
      where: { id },
      data: {
        name,
        description,
        imageUrl,
        status,
        userId, // Update with the current user ID
      }
    });

    return NextResponse.json(updatedMaterial);
  } catch (error) {
    console.error('Error updating material:', error);
    return NextResponse.json({ error: 'Failed to update material' }, { status: 500 });
  }
}

// DELETE material by ID
export async function DELETE(req: NextRequest, context: { params: { id: string } }) {
  try {
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

    const { id } = context.params;

    // Check if the material exists and belongs to the organization
    const existingMaterial = await prisma.material.findUnique({
      where: {
        id,
        organizationId
      }
    });

    if (!existingMaterial) {
      return NextResponse.json({ error: 'Material not found' }, { status: 404 });
    }
    
    // Check if there are any bins using this material
    const binCount = await prisma.bin.count({
      where: {
        typeOfMaterialId: id
      }
    });
    
    if (binCount > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete material that is being used by bins',
        binCount 
      }, { status: 400 });
    }

    await prisma.material.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting material:', error);
    return NextResponse.json({ error: 'Failed to delete material' }, { status: 500 });
  }
}