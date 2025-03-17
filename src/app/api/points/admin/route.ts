import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

const prisma = new PrismaClient();

// GET all points for all users (admin only)
export async function GET(req: NextRequest) {
  try {
    // Authenticate the request
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if user is an admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }
    
    // Get searchParams if any
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');
    const limit = url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')!) : 100;
    const offset = url.searchParams.get('offset') ? parseInt(url.searchParams.get('offset')!) : 0;
    
    // Build the query
    const whereClause = userId ? { userId } : {};
    
    // Get points with pagination
    const points = await prisma.points.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: offset,
      include: {
        User: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    
    // Get total count for pagination
    const total = await prisma.points.count({
      where: whereClause
    });

    return NextResponse.json({
      points,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    });
  } catch (error) {
    console.error('Error fetching admin points:', error);
    return NextResponse.json({ error: 'Failed to fetch points' }, { status: 500 });
  }
}

// POST new points for a specific user (admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if user is an admin
    const admin = await prisma.user.findUnique({
      where: { id: session.user.id }
    });
    
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }
    
    const { userId, points, description } = await req.json();

    // Validate request body
    if (!userId || typeof points !== 'number') {
      return NextResponse.json({ error: 'UserId and points are required. Points must be a number.' }, { status: 400 });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Use a transaction to create points entry and update user's total
    const [pointsEntry] = await prisma.$transaction([
      prisma.points.create({
        data: {
          userId,
          points,
          description: description || `Admin allocation by ${admin.name}`
        }
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          currentPoints: {
            increment: points
          }
        }
      })
    ]);

    return NextResponse.json(pointsEntry, { status: 201 });
  } catch (error) {
    console.error('Error creating admin points entry:', error);
    return NextResponse.json({ error: 'Failed to create points entry' }, { status: 500 });
  }
}