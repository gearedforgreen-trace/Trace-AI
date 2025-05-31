"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  Building2, 
  ShoppingBag, 
  Recycle, 
  Store, 
  Package, 
  Ticket,
  Plus,
  Layers,
  Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { EntityHeader } from "@/components/ui/entity-header";
import type { Organization, Store as StoreType, Bin, Coupon } from "@/types";
import StoresTab from "./stores-tab";
import BinsTab from "./bins-tab";
import CouponsTab from "./coupons-tab";
import MaterialsTab from "./materials-tab";
import RewardRulesTab from "./reward-rules-tab";
import { useGetOrganizationQuery } from "@/store/api/organizationsApi";
import { useGetStoresQuery } from "@/store/api/storesApi";
import { useGetBinsQuery } from "@/store/api/binsApi";
import { useGetCouponsQuery } from "@/store/api/couponsApi";
import { useGetMaterialsQuery } from "@/store/api/materialsApi";
import { useGetRewardRulesQuery } from "@/store/api/rewardRulesApi";

interface OrganizationDashboardClientProps {
  organizationId: string;
}

export default function OrganizationDashboardClient({ 
  organizationId 
}: OrganizationDashboardClientProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("stores");
  
  // Fetch organization data using RTK Query
  const { 
    data: organization, 
    isLoading: isLoadingOrganization,
    error: organizationError 
  } = useGetOrganizationQuery(organizationId);
  
  // Fetch stores data for this organization
  const { 
    data: storesData, 
    isLoading: isLoadingStores,
    error: storesError 
  } = useGetStoresQuery({ organizationId });
  
  // Get store IDs for bin filtering
  const storeIds = storesData?.data?.map(store => store.id) || [];
  
  // Fetch bins data for the stores in this organization
  const { 
    data: binsData, 
    isLoading: isLoadingBins,
    error: binsError 
  } = useGetBinsQuery(
    storeIds.length > 0 ? { storeIds } : undefined,
    { skip: storeIds.length === 0 }
  );
  
  // Fetch coupons data for this organization
  const { 
    data: couponsData, 
    isLoading: isLoadingCoupons
  } = useGetCouponsQuery({ organizationId });
  
  // Fetch materials data
  const {
    data: materialsData,
    isLoading: isLoadingMaterials,
    error: materialsError
  } = useGetMaterialsQuery({});
  
  // Fetch reward rules data
  const {
    data: rewardRulesData,
    isLoading: isLoadingRewardRules,
    error: rewardRulesError
  } = useGetRewardRulesQuery({});
  
  // Check for errors and display toast
  useEffect(() => {
    if (organizationError) {
      toast({
        title: "Error",
        description: "Failed to load organization data",
        variant: "destructive",
      });
    }
  }, [organizationError, toast]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const isLoading = isLoadingOrganization || isLoadingStores || isLoadingMaterials || isLoadingRewardRules;
  
  if (isLoading || !organization) {
    return <OrganizationDashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      <EntityHeader
        title={organization.name}
        description={`Organization Dashboard`}
        imageUrl={organization.logo || undefined}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stores</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{storesData?.meta?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              Total stores in this organization
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bins</CardTitle>
            <Recycle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{binsData?.meta?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              Total bins across all stores
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Materials</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{materialsData?.meta?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              Available recycling materials
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reward Rules</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rewardRulesData?.meta?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              Active reward rules
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Coupons</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{couponsData?.meta?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              Active coupons for this organization
            </p>
          </CardContent>
        </Card>
      </div>

     <div>
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="stores">Stores</TabsTrigger>
            <TabsTrigger value="bins">Bins</TabsTrigger>
            <TabsTrigger value="coupons">Coupons</TabsTrigger>
          </TabsList>
          
          <TabsContent value="stores" className="space-y-4 mt-4">
            <StoresTab organizationId={organizationId} />
          </TabsContent>
          
          <TabsContent value="bins" className="space-y-4 mt-4">
            <BinsTab organizationId={organizationId} stores={storesData?.data || []} />
          </TabsContent>
          
          <TabsContent value="coupons" className="space-y-4 mt-4">
            <CouponsTab organizationId={organizationId} />
          </TabsContent>
        </Tabs>
     </div>
    </div>
  );
}

// Temporary skeleton for internal use
function OrganizationDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-[300px] bg-muted animate-pulse rounded" />
          <div className="h-4 w-[200px] mt-2 bg-muted animate-pulse rounded" />
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-6 space-y-4">
              <div className="h-5 w-20 bg-muted animate-pulse rounded" />
              <div className="h-8 w-12 bg-muted animate-pulse rounded" />
              <div className="h-4 w-32 bg-muted animate-pulse rounded" />
            </div>
          </div>
        ))}
      </div>
      
      <div className="rounded-lg border bg-muted h-[400px] animate-pulse" />
    </div>
  );
}