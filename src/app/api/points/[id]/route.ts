import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

const prisma = new PrismaClient();

// GET a specific points entry
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    const { id } = params;

    const pointsEntry = await prisma.points.findUnique({
      where: {
        id,
        userId // Ensure the points entry belongs to the user
      }
    });

    if (!pointsEntry) {
      return NextResponse.json({ error: 'Points entry not found' }, { status: 404 });
    }

    return NextResponse.json(pointsEntry);
  } catch (error) {
    console.error('Error fetching points entry:', error);
    return NextResponse.json({ error: 'Failed to fetch points entry' }, { status: 500 });
  }
}

// PUT (update) a points entry
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    const { id } = params;
    const { points, description } = await req.json();

    // Validate request body
    if (typeof points !== 'number') {
      return NextResponse.json({ error: 'Points must be a number' }, { status: 400 });
    }

    // Find the existing points entry
    const existingPointsEntry = await prisma.points.findUnique({
      where: {
        id,
        userId // Ensure the points entry belongs to the user
      }
    });

    if (!existingPointsEntry) {
      return NextResponse.json({ error: 'Points entry not found' }, { status: 404 });
    }

    // Calculate the difference in points to update the user's total
    const pointsDifference = points - existingPointsEntry.points;

    // Use a transaction to update both the points entry and the user's total
    const [updatedPointsEntry] = await prisma.$transaction([
      prisma.points.update({
        where: { id },
        data: {
          points,
          description
        }
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          currentPoints: {
            increment: pointsDifference
          }
        }
      })
    ]);

    return NextResponse.json(updatedPointsEntry);
  } catch (error) {
    console.error('Error updating points entry:', error);
    return NextResponse.json({ error: 'Failed to update points entry' }, { status: 500 });
  }
}

// DELETE a points entry
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    const { id } = params;

    // Find the existing points entry
    const existingPointsEntry = await prisma.points.findUnique({
      where: {
        id,
        userId // Ensure the points entry belongs to the user
      }
    });

    if (!existingPointsEntry) {
      return NextResponse.json({ error: 'Points entry not found' }, { status: 404 });
    }

    // Use a transaction to delete the points entry and update the user's total
    await prisma.$transaction([
      prisma.points.delete({
        where: { id }
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          currentPoints: {
            decrement: existingPointsEntry.points
          }
        }
      })
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting points entry:', error);
    return NextResponse.json({ error: 'Failed to delete points entry' }, { status: 500 });
  }
}