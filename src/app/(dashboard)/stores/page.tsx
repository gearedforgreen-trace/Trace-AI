import { Suspense } from "react";
import StoresClient from "./_components/stores-client";
import { StoresTableSkeleton } from "./_components/stores-table-skeleton";

export default function StoresPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Stores</h2>
      </div>
      <Suspense fallback={<StoresTableSkeleton />}>
        <StoresClient />
      </Suspense>
    </div>
  );
}
