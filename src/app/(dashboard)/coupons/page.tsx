import { Suspense } from "react";
import { CouponsTableSkeleton } from "./_components/coupons-table-skeleton";
import CouponsClient from "./_components/coupons-client";

export default function CouponsPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Coupons</h2>
      </div>
      <Suspense fallback={<CouponsTableSkeleton />}>
        <CouponsClient />
      </Suspense>
    </div>
  );
}