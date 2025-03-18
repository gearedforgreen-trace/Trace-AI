import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

const prisma = new PrismaClient();

// GET organization by ID
export async function GET(
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
    
    // Get organization with verification that user is a member
    const organization = await prisma.organization.findFirst({
      where: {
        id:organizationId,
        members: {
          some: {
            userId
          }
        }
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true
              }
            }
          }
        },
        _count: {
          select: {
            Store: true,
            Material: true,
            Bin: true
          }
        }
      }
    });
    
    if (!organization) {
      return NextResponse.json({ error: 'Organization not found or you are not a member' }, { status: 404 });
    }
    
    return NextResponse.json(organization);
  } catch (error) {
    console.error('Error fetching organization:', error);
    return NextResponse.json({ error: 'Failed to fetch organization' }, { status: 500 });
  }
}

// PUT (update) organization by ID
export async function PUT(
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
    
    // Check if user is an admin of this organization
    const membership = await prisma.member.findFirst({
      where: {
        organizationId,
        userId,
        role: 'admin'
      }
    });
    
    if (!membership) {
      return NextResponse.json({ error: 'Permission denied: Admin role required' }, { status: 403 });
    }
    
    const { name,  logo  } = await req.json();
    
    // Validate required fields
    if (!name) {
      return NextResponse.json({ error: 'Organization name is required' }, { status: 400 });
    }
    
    // Update organization
    const updatedOrganization = await prisma.organization.update({
      where: { id:organizationId },
      data: {
        name,
        
        logo,
        
      }
    });
    
    return NextResponse.json(updatedOrganization);
  } catch (error) {
    console.error('Error updating organization:', error);
    return NextResponse.json({ error: 'Failed to update organization' }, { status: 500 });
  }
}

// DELETE organization by ID
export async function DELETE(
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
    
    // Check if user is an admin of this organization
    const membership = await prisma.member.findFirst({
      where: {
        organizationId,
        userId,
        role: 'admin'
      }
    });
    
    if (!membership) {
      return NextResponse.json({ error: 'Permission denied: Admin role required' }, { status: 403 });
    }
    
    // Check if organization has any associated data that prevents deletion
    const [storeCounts, materialCounts, binCounts] = await Promise.all([
      prisma.store.count({ where: { organizationId: organizationId } }),
      prisma.material.count({ where: { organizationId: organizationId } }),
      prisma.bin.count({ where: { organizationId: organizationId } })
    ]);
    
    if (storeCounts > 0 || materialCounts > 0 || binCounts > 0) {
      return NextResponse.json({
        error: 'Cannot delete organization with associated data',
        stores: storeCounts,
        materials: materialCounts,
        bins: binCounts
      }, { status: 400 });
    }
    
    // Delete organization members first (necessary because of foreign key constraints)
    await prisma.member.deleteMany({
      where: { organizationId: organizationId }
    });
    
    // Delete the organization
    await prisma.organization.delete({
      where: { id: organizationId }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting organization:', error);
    return NextResponse.json({ error: 'Failed to delete organization' }, { status: 500 });
  }
}