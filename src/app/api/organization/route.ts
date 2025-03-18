import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

const prisma = new PrismaClient();

// GET organizations with search functionality
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
    
    // Get query parameters for search
    const url = new URL(req.url);
    const search = url.searchParams.get('search') || '';
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;
    
    // Build where clause for search
    const whereClause: any = {
      // Only return organizations the user is a member of
      members: {
        some: {
          userId
        }
      }
    };
    
    // Add search condition if there's a search query
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    // Query for organizations
    const [organizations, totalCount] = await Promise.all([
      prisma.organization.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: {
          name: 'asc'
        },
        include: {
          _count: {
            select: {
              members: true,
              Store: true,
              Material: true,
              Bin: true
            }
          }
        }
      }),
      prisma.organization.count({ where: whereClause })
    ]);
    
    // Return organizations with pagination info
    return NextResponse.json({
      organizations,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Error searching organizations:', error);
    return NextResponse.json({ error: 'Failed to search organizations' }, { status: 500 });
  }
}

// POST create new organization
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    
    const { name,  logo } = await req.json();
    
    // Validate required fields
    if (!name) {
      return NextResponse.json({ error: 'Organization name is required' }, { status: 400 });
    }
    
    // Create organization and add current user as admin member
    const organization = await prisma.organization.create({
      data: {
        // Generate a unique ID for the organization,
        id: Math.random().toString(36).substring(7),
        name,
        createdAt: new Date(),
        logo,
        
        
      }
      
    });
    
    return NextResponse.json(organization, { status: 201 });
  } catch (error) {
    console.error('Error creating organization:', error);
    return NextResponse.json({ error: 'Failed to create organization' }, { status: 500 });
  }
}