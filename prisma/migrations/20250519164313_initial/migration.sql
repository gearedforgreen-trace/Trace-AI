/*
  Warnings:

  - Added the required column `name` to the `reward_rules` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "status" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "coupon_type" AS ENUM ('FIXED', 'PERCENTAGE');

-- CreateEnum
CREATE TYPE "deal_type" AS ENUM ('NOPOINTS', 'POINTS');

-- AlterTable
ALTER TABLE "bin" ALTER COLUMN "imageUrl" DROP NOT NULL;

-- AlterTable
ALTER TABLE "reward_rules" ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "store" ALTER COLUMN "imageUrl" DROP NOT NULL;

-- CreateTable
CREATE TABLE "RedeemHistory" (
    "id" TEXT NOT NULL,
    "couponId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "description" TEXT,
    "couponCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RedeemHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecycleHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "binId" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "mediaUrl" TEXT,
    "totalCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecycleHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_total_point" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "totalPoints" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "user_total_point_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coupon" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "status" "status" NOT NULL DEFAULT 'ACTIVE',
    "couponType" "coupon_type" NOT NULL,
    "dealType" "deal_type" NOT NULL,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "discountAmount" INTEGER NOT NULL,
    "pointsToRedeem" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT,

    CONSTRAINT "coupon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favourite_coupon" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "couponId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favourite_coupon_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_total_point_userId_key" ON "user_total_point"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "favourite_coupon_userId_couponId_key" ON "favourite_coupon"("userId", "couponId");

-- AddForeignKey
ALTER TABLE "RedeemHistory" ADD CONSTRAINT "RedeemHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RedeemHistory" ADD CONSTRAINT "RedeemHistory_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "coupon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecycleHistory" ADD CONSTRAINT "RecycleHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecycleHistory" ADD CONSTRAINT "RecycleHistory_binId_fkey" FOREIGN KEY ("binId") REFERENCES "bin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_total_point" ADD CONSTRAINT "user_total_point_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coupon" ADD CONSTRAINT "coupon_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favourite_coupon" ADD CONSTRAINT "favourite_coupon_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "coupon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favourite_coupon" ADD CONSTRAINT "favourite_coupon_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
