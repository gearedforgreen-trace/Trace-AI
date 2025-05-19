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
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { EntityHeader } from "@/components/ui/entity-header";
import { ApiService } from "@/lib/api/api-service";
import type { Organization, Store as StoreType, Bin, Coupon } from "@/types";
import StoresTab from "./stores-tab";
import BinsTab from "./bins-tab";
import CouponsTab from "./coupons-tab";

interface OrganizationDashboardClientProps {
  organizationId: string;
}

// Create organization-specific API services
const organizationApi = new ApiService<Organization>("/organizations");
const storesApi = new ApiService<StoreType>("/stores");
const binsApi = new ApiService<Bin>("/bins");
const couponsApi = new ApiService<Coupon>("/coupons");

export default function OrganizationDashboardClient({ 
  organizationId 
}: OrganizationDashboardClientProps) {
  const { toast } = useToast();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [stores, setStores] = useState<StoreType[]>([]);
  const [storesCount, setStoresCount] = useState<number>(0);
  const [binsCount, setBinsCount] = useState<number>(0);
  const [couponsCount, setCouponsCount] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<string>("stores");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch organization and summary data
  useEffect(() => {
    const fetchOrganizationData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch organization details
        const orgResponse = await fetch(`/api/organizations/${organizationId}`);
        if (!orgResponse.ok) {
          throw new Error("Failed to fetch organization");
        }
        const orgData = await orgResponse.json();
        setOrganization(orgData.data);

        // Fetch stores count for this organization
        const storesResponse = await fetch(`/api/stores?organizationId=${organizationId}`);
        if (storesResponse.ok) {
          const storesData = await storesResponse.json();
          setStores(storesData.data || []);
          setStoresCount(storesData.meta?.total || 0);
          
          // Get bin count from stores
          const storeIds = storesData.data?.map((store: StoreType) => store.id) || [];
          if (storeIds.length > 0) {
            const binsResponse = await fetch(`/api/bins?storeIds=${storeIds.join(',')}`);
            if (binsResponse.ok) {
              const binsData = await binsResponse.json();
              setBinsCount(binsData.meta?.total || 0);
            }
          }
        }
        
        // Fetch coupons count for this organization
        const couponsResponse = await fetch(`/api/coupons?organizationId=${organizationId}`);
        if (couponsResponse.ok) {
          const couponsData = await couponsResponse.json();
          setCouponsCount(couponsData.meta?.total || 0);
        }
      } catch (error) {
        console.error("Error fetching organization data:", error);
        toast({
          title: "Error",
          description: "Failed to load organization data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrganizationData();
  }, [organizationId, toast]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stores</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{storesCount}</div>
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
            <div className="text-2xl font-bold">{binsCount}</div>
            <p className="text-xs text-muted-foreground">
              Total bins across all stores
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Coupons</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{couponsCount}</div>
            <p className="text-xs text-muted-foreground">
              Active coupons for this organization
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="stores">Stores</TabsTrigger>
          <TabsTrigger value="bins">Bins</TabsTrigger>
          <TabsTrigger value="coupons">Coupons</TabsTrigger>
        </TabsList>
        
        <TabsContent value="stores" className="space-y-4 mt-4">
          <StoresTab organizationId={organizationId} />
        </TabsContent>
        
        <TabsContent value="bins" className="space-y-4 mt-4">
          <BinsTab organizationId={organizationId} stores={stores} />
        </TabsContent>
        
        <TabsContent value="coupons" className="space-y-4 mt-4">
          <CouponsTab organizationId={organizationId} />
        </TabsContent>
      </Tabs>
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
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
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