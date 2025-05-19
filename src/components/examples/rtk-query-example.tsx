'use client';

import { useState } from 'react';
import { useGetOrganizationsQuery } from '@/store/api/organizationsApi';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Example component showing RTK Query in action
export default function RtkQueryExample() {
  const [page, setPage] = useState(1);
  const { data, error, isLoading, isFetching, refetch } = useGetOrganizationsQuery({ page, perPage: 5 });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">RTK Query Example - Organizations</h2>
        <div className="space-x-2">
          <Button 
            variant="outline" 
            onClick={() => setPage(prev => Math.max(prev - 1, 1))}
            disabled={page === 1 || isLoading}
          >
            Previous
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setPage(prev => prev + 1)}
            disabled={!data?.meta.next || isLoading}
          >
            Next
          </Button>
          <Button 
            variant="outline" 
            onClick={() => refetch()}
            disabled={isLoading}
          >
            Refresh
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
          Error loading organizations: {error instanceof Error ? error.message : 'Unknown error'}
        </div>
      ) : (
        <>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {data?.data.length ? (
              data.data.map((org) => (
                <Card key={org.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{org.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    <p>Slug: {org.slug || 'N/A'}</p>
                    <p>Created: {new Date(org.createdAt).toLocaleDateString()}</p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-3 text-center py-8">
                No organizations found.
              </div>
            )}
          </div>
          
          <div className="text-sm text-muted-foreground">
            Page {data?.meta.currentPage} of {data?.meta.lastPage} | 
            Total: {data?.meta.total} organizations
            {isFetching && <span className="ml-2">Refreshing...</span>}
          </div>
        </>
      )}
    </div>
  );
}