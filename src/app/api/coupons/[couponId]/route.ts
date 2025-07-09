import { validateSessionAndPermission } from "@/lib/servers/permissions";
import prisma from "@/lib/prisma";
import { couponUpdateSchema } from "@/schemas/schema";
import { NextRequest, NextResponse } from "next/server";
import cloudinary, { uploadCouponImageToCloudinary } from "@/lib/cloudinary";

export async function GET(
  _request: NextRequest,
  { params }: { params: { couponId: string } }
) {
  try {
    const { couponId } = await params;

    if (!couponId) {
      return NextResponse.json(
        { error: "Coupon ID is required" },
        { status: 400 }
      );
    }

    const validation = await validateSessionAndPermission({
      coupon: ["detail"],
    });

    if (!validation.success) {
      return validation.response;
    }

    const coupon = await prisma.coupon.findUnique({
      where: { id: couponId },
      include: {
        favouriteCoupon: {
          where: {
            userId: validation.session?.user.id,
          },
          select: {
            id: true,
            couponId: true,
            userId: true,
            createdAt: true,
          },
          take: 1,
        },
        organization: true,
      },
    });

    if (!coupon) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        data: {
          ...coupon,
          isFavouriteCoupon: coupon.favouriteCoupon?.length > 0 ? true : false,
          favouriteCoupon: coupon.favouriteCoupon?.[0] ?? null,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { couponId: string } }
) {
  try {
    const { couponId } = await params;

    if (!couponId) {
      return NextResponse.json(
        { error: "Coupon ID is required" },
        { status: 400 }
      );
    }

    const validation = await validateSessionAndPermission({
      coupon: ["update"],
    });

    if (!validation.success) {
      return validation.response;
    }

    const body = await request.json();

    const validatedBody = couponUpdateSchema.safeParse(body);

    if (validatedBody.data?.imageUrl) {
      const imageUrl = await uploadCouponImageToCloudinary(
        validatedBody.data.imageUrl,
        "coupon-" + couponId
      );
      validatedBody.data.imageUrl = imageUrl.original_url;
    } else {
      const publicId = "coupon-" + couponId;
      await cloudinary.uploader.destroy(publicId);
    }

    if (!validatedBody.success) {
      return NextResponse.json(
        {
          error: "Unprocessable Content",
          details: validatedBody.error.flatten().fieldErrors,
        },
        { status: 422 }
      );
    }

    const updatedCoupon = await prisma.coupon.update({
      where: { id: couponId },
      data: validatedBody.data,
    });

    return NextResponse.json({ data: updatedCoupon }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { couponId: string } }
) {
  try {
    const { couponId } = await params;

    if (!couponId) {
      return NextResponse.json(
        { error: "Material ID is required" },
        { status: 400 }
      );
    }

    const validation = await validateSessionAndPermission({
      coupon: ["delete"],
    });

    if (!validation.success) {
      return validation.response;
    }

    const deletedCoupon = await prisma.coupon.delete({
      where: { id: couponId },
    });

    if (deletedCoupon.imageUrl) {
      const publicId = "coupon-" + deletedCoupon.id;
      await cloudinary.uploader.destroy(publicId);
    }

    return NextResponse.json(
      { data: deletedCoupon, message: "Coupon deleted successfully" },
      { status: 200 }
    );

    //
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
