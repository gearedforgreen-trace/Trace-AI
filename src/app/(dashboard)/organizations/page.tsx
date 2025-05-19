import { Suspense } from "react";
import { OrganizationsTableSkeleton } from "./_components/organizations-table-skeleton";
import OrganizationsClient from "./_components/organizations-client";

export default function OrganizationsPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Organizations</h2>
      </div>
      <Suspense fallback={<OrganizationsTableSkeleton />}>
        <OrganizationsClient />
      </Suspense>
    </div>
  );
}