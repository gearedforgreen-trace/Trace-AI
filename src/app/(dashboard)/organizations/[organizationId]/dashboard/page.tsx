import { Suspense } from "react";
import { OrganizationDashboardSkeleton } from "./_components/organization-dashboard-skeleton";
import OrganizationDashboardClient from "./_components/organization-dashboard-client";

interface OrganizationDashboardProps {
  params: {
    organizationId: string;
  };
}

export default function OrganizationDashboardPage({ params }: OrganizationDashboardProps) {
  const { organizationId } = params;
  
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <Suspense fallback={<OrganizationDashboardSkeleton />}>
        <OrganizationDashboardClient organizationId={organizationId} />
      </Suspense>
    </div>
  );
}