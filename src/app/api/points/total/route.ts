import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

const prisma = new PrismaClient();

// GET the current user's total points
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
    
    // Fetch the user with their current points
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        currentPoints: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      userId: user.id,
      name: user.name,
      email: user.email,
      totalPoints: user.currentPoints
    });
  } catch (error) {
    console.error('Error fetching total points:', error);
    return NextResponse.json({ error: 'Failed to fetch total points' }, { status: 500 });
  }
}