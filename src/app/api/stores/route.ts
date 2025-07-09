import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/servers/sessions';
import { NextResponse, NextRequest } from 'next/server';
import { createPaginator } from 'prisma-pagination';
import type { Prisma, Store } from '@prisma/client';
import { storeSchema } from '@/schemas/schema';
import { TRole } from "@/auth/user-permissions";

// Haversine formula to calculate distance between two coordinates
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

const paginate = createPaginator({ perPage: 10, page: 1 });

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session || !session.user.role) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
        },
        { status: 401 }
      );
    }

    const hasListPermission = await auth.api.userHasPermission({
      body: {
        role: session.user.role as TRole,
        permission: {
          store: ['list'],
        },
      },
    });

    if (!hasListPermission.success) {
      return NextResponse.json(
        {
          error: 'Forbidden',
        },
        { status: 403 }
      );
    }

    const page = Math.max(
      parseInt(request.nextUrl.searchParams.get('page') || '1'),
      1
    );

    const perPage = parseInt(request.nextUrl.searchParams.get('perPage') || '20');

    // Extract query parameters
    const organizationId = request.nextUrl.searchParams.get('organizationId');
    const name = request.nextUrl.searchParams.get('name');
    const materials = request.nextUrl.searchParams.get('materials');
    const lat = request.nextUrl.searchParams.get('lat');
    const lng = request.nextUrl.searchParams.get('lng');
    const maxDistance = request.nextUrl.searchParams.get('radius');
    
    const where: Prisma.StoreWhereInput = {};
    
    if (organizationId) {
      where.organizationId = organizationId;
    }

    // Filter by store name
    if (name) {
      where.name = {
        contains: name,
        mode: 'insensitive'
      };
    }

    // Filter by materials - stores that have bins with specified materials
    if (materials) {
      const materialIds = materials.split(',').map(id => id.trim());
      where.bins = {
        some: {
          materialId: {
            in: materialIds
          }
        }
      };
    }
    
    const storesResult = await paginate<Store, Prisma.StoreFindManyArgs>(
      prisma.store,
      {
        where,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          organization: true,
          bins: {
            include: {
              material: true
            }
          }
        },
      },
      {
        page: page,
        perPage: perPage,
      }
    );
    
    // Process the stores to add calculated fields and format response
    if (storesResult.data) {
      const userLat = lat ? parseFloat(lat) : null;
      const userLng = lng ? parseFloat(lng) : null;
      const maxDistanceKm = maxDistance ? parseFloat(maxDistance) : null;

      let processedStores = storesResult.data.map((store: any) => {
        // Calculate distance if coordinates provided
        let distance = null;
        if (userLat !== null && userLng !== null) {
          distance = calculateDistance(userLat, userLng, store.lat, store.lng);
        }

        // Extract unique materials from bins
        const materials = store.bins.reduce((acc: any[], bin: any) => {
          const existingMaterial = acc.find((m: any) => m.id === bin.material.id);
          if (!existingMaterial) {
            acc.push({
              id: bin.material.id,
              name: bin.material.name,
              description: bin.material.description
            });
          }
          return acc;
        }, []);

        return {
          id: store.id,
          name: store.name,
          organizationName: store.organization?.name || null,
          materials,
          bins: store.bins.map((bin: any) => ({
            id: bin.id,
            number: bin.number,
            material: {
              id: bin.material.id,
              name: bin.material.name
            }
          })),
          distance,
          lat: store.lat,
          lng: store.lng,
          address1: store.address1,
          city: store.city,
          state: store.state,
          zip: store.zip,
          country: store.country,
          status: store.status,
          description: store.description,
          imageUrl: store.imageUrl,
          createdAt: store.createdAt,
        };
      });

      // Filter by distance if coordinates and maxDistance provided
      if (userLat !== null && userLng !== null && maxDistanceKm !== null) {
        processedStores = processedStores.filter(store => 
          store.distance !== null && store.distance <= maxDistanceKm
        );
      }

      return NextResponse.json({
        ...storesResult,
        data: processedStores
      }, { status: 200 });
    }
    
    return NextResponse.json(storesResult, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session || !session.user.role) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
        },
        { status: 401 }
      );
    }

    const hasCreatePermission = await auth.api.userHasPermission({
      body: {
        role: session.user.role as TRole,
        permission: {
          store: ['create'],
        },
      },
    });

    if (!hasCreatePermission.success) {
      return NextResponse.json(
        {
          error: 'Forbidden',
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    const validatedBody = storeSchema.safeParse(body);

    if (validatedBody.error) {
      return NextResponse.json(
        {
          error: 'Unprocessable Content',
          details: validatedBody.error.flatten().fieldErrors,
        },
        { status: 422 }
      );
    }

    // Make sure organizationId is a valid UUID or null
    const data = {
      ...validatedBody.data,
      organizationId: validatedBody.data.organizationId || null,
    };

    const store = await prisma.store.create({
      data,
    });

    return NextResponse.json(
      {
        data: store,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
