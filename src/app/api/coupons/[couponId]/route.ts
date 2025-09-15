import prisma from "@/lib/prisma";
import { couponUpdateSchema } from "@/schemas/schema";
import { NextRequest, NextResponse } from "next/server";
import cloudinary, { uploadCouponImageToCloudinary } from "@/lib/cloudinary";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

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

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const coupon = await prisma.coupon.findUnique({
      where: { id: couponId },
      include: {
        favouriteCoupon: {
          where: {
            userId: session.user.id,
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

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();

    const validatedBody = couponUpdateSchema.safeParse(body);

    if (!validatedBody.success) {
      return NextResponse.json(
        {
          error: "Unprocessable Content",
          details: validatedBody.error.flatten().fieldErrors,
        },
        { status: 422 }
      );
    }

    // Handle image upload/deletion after validation passes
    if (validatedBody.data.imageUrl) {
      try {
        const imageUrl = await uploadCouponImageToCloudinary(
          validatedBody.data.imageUrl,
          "coupon-" + couponId
        );
        validatedBody.data.imageUrl = imageUrl.original_url;
      } catch (error) {
        console.error("Image upload failed:", error);
        return NextResponse.json(
          { error: "Image upload failed. Please check Cloudinary configuration." },
          { status: 500 }
        );
      }
    } else if (validatedBody.data.imageUrl === null || validatedBody.data.imageUrl === "") {
      // Only delete image if explicitly setting to null/empty
      try {
        const publicId = "coupon-images/coupon-" + couponId;
        await cloudinary.uploader.destroy(publicId);
      } catch (error) {
        console.error("Image deletion failed:", error);
        // Don't fail the entire request for image deletion failures
      }
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
        { error: "Coupon ID is required" },
        { status: 400 }
      );
    }

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const deletedCoupon = await prisma.coupon.delete({
      where: { id: couponId },
    });

    if (deletedCoupon.imageUrl) {
      try {
        const publicId = "coupon-images/coupon-" + deletedCoupon.id;
        await cloudinary.uploader.destroy(publicId);
      } catch (error) {
        console.error("Image deletion failed:", error);
        // Don't fail the entire request for image deletion failures
      }
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
