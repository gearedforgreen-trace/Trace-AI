import { Suspense } from "react";
import RecyclesTable from './_components/recycles-table';
import RecyclesTableSkeleton from './_components/recycles-table-skeletone';


export default function RecyclesPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Recycles</h2>
      </div>
      <Suspense fallback={<RecyclesTableSkeleton />}>
        <RecyclesTable />
      </Suspense>
    </div>
  );
} 