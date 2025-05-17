import { Suspense } from "react";
import BinsClient from "./_components/bins-client";
import { BinsTableSkeleton } from "./_components/bins-table-skeleton";

export default function BinsPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Recycling Bins</h2>
      </div>
      <Suspense fallback={<BinsTableSkeleton />}>
        <BinsClient />
      </Suspense>
    </div>
  );
}
