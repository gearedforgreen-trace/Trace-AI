import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

const prisma = new PrismaClient();

// GET all points for current user
export async function GET(req: NextRequest) {
  try {
    // Authenticate the request
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    
    const points = await prisma.points.findMany({
      where: {
        userId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(points);
  } catch (error) {
    console.error('Error fetching points:', error);
    return NextResponse.json({ error: 'Failed to fetch points' }, { status: 500 });
  }
}

// POST new points entry
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    const { points, description } = await req.json();

    // Validate request body
    if (typeof points !== 'number') {
      return NextResponse.json({ error: 'Points must be a number' }, { status: 400 });
    }

    // Create the points entry
    const pointsEntry = await prisma.points.create({
      data: {
        userId,
        points,
        description
      }
    });

    // Update the user's currentPoints
    await prisma.user.update({
      where: { id: userId },
      data: {
        currentPoints: {
          increment: points
        }
      }
    });

    return NextResponse.json(pointsEntry, { status: 201 });
  } catch (error) {
    console.error('Error creating points entry:', error);
    return NextResponse.json({ error: 'Failed to create points entry' }, { status: 500 });
  }
}