import prisma from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
import { createPaginator } from "prisma-pagination";
import type { Coupon, Prisma } from "@prisma/client";
import { couponCreateSchema } from "@/schemas/schema";
import { validateSessionAndPermission } from "@/lib/servers/permissions";
import { DealType, Organization } from "@prisma/client";
import { z } from "zod";
import { uploadCouponImageToCloudinary } from "@/lib/cloudinary";

const paginate = createPaginator({ perPage: 10, page: 1 });

export const queryParamsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  perPage: z.coerce.number().min(1).max(50).default(20),
  isFeatured: z
    .string()
    .optional()
    .transform((val) => {
      if (val === undefined) return undefined;
      return val.toLowerCase() === "true" || val === "1" || val === "yes";
    }),
  dealType: z.nativeEnum(DealType).optional(),
  includeExpired: z
    .string()
    .optional()
    .transform((val) => {
      if (val === undefined) return false;
      return val.toLowerCase() === "true" || val === "1" || val === "yes";
    })
    .default(false),
  dateRange: z
    .string()
    .optional()
    .transform((val) => {
      if (val === undefined) return undefined;
      return val.split("|").map((date) => new Date(date));
    }),
});

export async function GET(request: NextRequest) {
  try {
    const validation = await validateSessionAndPermission({
      coupon: ["detail"],
    });

    if (!validation.success) {
      return validation.response;
    }

    const session = validation.session;
    const user = session?.user;

    const queryParamsResult = queryParamsSchema.safeParse(
      Object.fromEntries(request.nextUrl.searchParams)
    );

    if (!queryParamsResult.success) {
      return NextResponse.json(
        {
          error: "Invalid query parameters",
          details: queryParamsResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { page, perPage, isFeatured, dealType, includeExpired, dateRange } =
      queryParamsResult.data;
    // Check for organizationId filter
    const organizationId = request.nextUrl.searchParams.get("organizationId");

    // Build where clause with date range filtering (unless includeExpired is true)
    const now = new Date();
    
    const where: Prisma.CouponWhereInput = {
      status: 'ACTIVE', // Only active coupons
      isFeatured: isFeatured ?? undefined,
      dealType: dealType ?? undefined,
      createdAt: dateRange
        ? {
            gte: dateRange[0],
            lte: dateRange[1],
          }
        : undefined,
    };

    // Only filter by date range if includeExpired is false (default behavior)
    if (!includeExpired) {
      where.startDate = {
        lte: now, // Start date must be in the past or now
      };
      where.endDate = {
        gte: now, // End date must be in the future or now
      };
    }

    if (organizationId) {
      where.organizationId = organizationId;
    }

    const coupons = await paginate<
      Coupon & { favouriteCoupon: object[] },
      Prisma.CouponFindManyArgs
    >(
      prisma.coupon,
      {
        where,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          organization: true,
          favouriteCoupon: {
            where: {
              userId: user?.id,
            },
            select: {
              id: true,
              couponId: true,
              userId: true,
              createdAt: true,
            },
            take: 1,
          },
        },
      },
      {
        page: page,
        perPage: perPage,
      }
    );

    return NextResponse.json(
      {
        data: coupons.data.map((coupon) => ({
          ...coupon,
          isFavouriteCoupon: coupon.favouriteCoupon?.length > 0 ? true : false,
          favouriteCoupon: coupon.favouriteCoupon?.[0] ?? null,
        })),
        meta: coupons.meta,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const validation = await validateSessionAndPermission({
      coupon: ["create"],
    });

    if (!validation.success) {
      return validation.response;
    }

    const body = await request.json();

    const validatedBody = couponCreateSchema.safeParse(body);

    if (validatedBody.error) {
      return NextResponse.json(
        {
          error: "Unprocessable Content",
          details: validatedBody.error.flatten().fieldErrors,
        },
        { status: 422 }
      );
    }

    let organization: Organization | null = null;

    if (validatedBody.data.organizationId) {
      organization = await prisma.organization.findUnique({
        where: {
          id: validatedBody.data.organizationId,
        },
      });

      if (!organization) {
        return NextResponse.json(
          { error: "Organization not found" },
          { status: 404 }
        );
      }
    }

    // Make sure organizationId is a valid UUID or null
    const data = {
      ...validatedBody.data,
      organizationId: validatedBody.data.organizationId || null,
    };

    const coupon = await prisma.coupon.create({
      data: {
        ...data,
        organizationId: organization?.id || null,
      },
      include: {
        organization: true,
      },
    });

    if (coupon.imageUrl) {
      const publicId = "coupon-" + coupon.id;
      const imageUrl = await uploadCouponImageToCloudinary(
        coupon.imageUrl,
        publicId
      );
      await prisma.coupon.update({
        where: { id: coupon.id },
        data: {
          imageUrl: imageUrl.original_url,
        },
      });
      coupon.imageUrl = imageUrl.original_url;
    }

    return NextResponse.json(
      {
        data: coupon,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
