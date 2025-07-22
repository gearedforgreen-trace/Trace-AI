/* eslint-disable @next/next/no-img-element */
'use client';

import { DataTablePagination } from '@/components/ui/data-table/data-table-pagination';
import { Input } from '@/components/ui/input';
import { useQueryStates, parseAsString, parseAsInteger } from 'nuqs';
import { useGetUserRecyclesQuery } from '@/store/api/recycleHistoriesApi';
import { Skeleton } from '@/components/ui/skeleton';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { InfoIcon, Loader2Icon, PlayIcon, RefreshCcwIcon } from 'lucide-react';
import { Recycle } from '@/lib/api/services/recycles';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { StatusBadge } from '@/components/ui/status-badge';
import Link from 'next/link';

function useDebouncedCallback<F extends (...args: any[]) => void>(
  func: F,
  delay: number
) {
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  return useCallback(
    (...args: Parameters<F>) => {
      if (timeout.current) {
        clearTimeout(timeout.current);
      }
      timeout.current = setTimeout(() => {
        func(...args);
      }, delay);
    },
    [func, delay]
  );
}

export default function RecyclesTable() {
  const [queryParamsState, setQueryParamsState] = useQueryStates({
    searchMaterial: parseAsString.withDefault(''),
    page: parseAsInteger.withDefault(1),
  });

  const [searchMaterial, setSearchMaterial] = useState('');

  const {
    data: recycleHistoriesResult,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useGetUserRecyclesQuery({
    searchMaterial: queryParamsState.searchMaterial,
    page: queryParamsState.page,
  });

  const pagination = recycleHistoriesResult?.meta || {
    currentPage: 1,
    perPage: 20,
    total: 0,
    lastPage: 1,
    prev: null,
    next: null,
  };

  const handleSearchByMaterial = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchMaterial(e.target.value);
  };

  const debouncedSet = useDebouncedCallback((val: string) => {
    setQueryParamsState({ searchMaterial: val });
  }, 500);

  useEffect(() => {
    debouncedSet(searchMaterial);
  }, [searchMaterial, debouncedSet]);

  const recycleHistories = recycleHistoriesResult?.data || [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to fetch recycle histories{' '}
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCcwIcon className="w-4 h-4" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search By Material"
              className="w-full"
              value={searchMaterial}
              onChange={handleSearchByMaterial}
            />
          </div>
        </div>
        <div className="grid">
          <div className="rounded-md border overflow-y-hidden relative">
            <table className="w-full text-sm ">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="h-10 px-4 text-left font-medium whitespace-nowrap">
                    Recycle History
                  </th>
                  <th className="h-10 px-4 text-left font-medium whitespace-nowrap">
                    User
                  </th>
                  <th className="h-10 px-4 text-left font-medium whitespace-nowrap">
                    Bin
                  </th>
                  <th className="h-10 px-4 text-left font-medium whitespace-nowrap">
                    Store
                  </th>
                  <th className="h-10 px-4 text-left font-medium whitespace-nowrap">
                    Created At
                  </th>
                </tr>
              </thead>
              <tbody>
                {recycleHistories.length > 0 ? (
                  recycleHistories.map((recycleHistory) => (
                    <RecycleTableData
                      key={recycleHistory.id}
                      recycleHistory={recycleHistory}
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="h-24 text-center">
                      <div className="flex items-center justify-center h-full">
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          No recycle histories found
                          <InfoIcon className="w-4 h-4" />
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {isFetching && (
              <div className="absolute h-full left-0 w-full top-0 bg-background/70 backdrop-blur-[1px] flex items-center justify-center gap-2">
                <Loader2Icon className="w-4 h-4 animate-spin" />
                <p className="text-sm text-muted-foreground">Loading...</p>
              </div>
            )}
          </div>
        </div>
        <DataTablePagination
          table={{} as any}
          currentPage={pagination.currentPage}
          lastPage={pagination.lastPage}
          totalItems={pagination.total}
          onPageChange={(page) => {
            setQueryParamsState({ page });
          }}
          isExternalPagination={true}
        />
      </div>
    </>
  );
}

function RecycleTableData({ recycleHistory }: { recycleHistory: Recycle }) {
  const [openRecycleImageViewModal, setOpenRecycleImageViewModal] =
    useState(false);

  return (
    <>
      <tr className="border-b" key={recycleHistory.id}>
        <td className="p-4 align-middle font-medium flex gap-4">
          <div>
            <div
              className="cursor-pointer w-20 h-20 rounded-md overflow-hidden"
              onClick={() => {
                if (recycleHistory.mediaUrl) {
                  setOpenRecycleImageViewModal(true);
                }
              }}
            >
              {recycleHistory?.mediaUrl ? (
                recycleHistory.mediaUrl.endsWith('.mp4') &&
                recycleHistory.mediaUrl.startsWith('https://') ? (
                  <Button
                    variant="outline"
                    className="w-20 h-20 cursor-pointer"
                  >
                    <PlayIcon className="w-4 h-4" />
                  </Button>
                ) : (
                  <img
                    src={recycleHistory.mediaUrl}
                    alt={recycleHistory.bin.material.name}
                    className="w-20 h-20 object-cover"
                  />
                )
              ) : (
                <div className="w-20 h-20 bg-muted rounded-md" />
              )}
            </div>
          </div>
          <div className="flex gap-2 flex-col">
            <div className="flex flex-col">
              <div className="text-sm font-medium">
                <span>{recycleHistory.bin.material.name}</span>
              </div>
            </div>

            <div className="flex flex-col text-sm text-muted-foreground">
              <div className="text-sm font-medium">
                <span>Total Item: </span>
                <span>{recycleHistory.totalCount}</span>
              </div>
              <div className="text-sm font-medium">
                <span>Total Points: </span>
                <span>{recycleHistory.points}</span>
              </div>
            </div>
          </div>
        </td>
        <td className="p-4 align-middle text-left">
          <div className="flex items-center gap-2">
            <div>
              {recycleHistory.user.image ? (
                <img
                  src={recycleHistory.user.image}
                  alt={recycleHistory.user.name}
                  className="w-10 h-10 object-cover rounded-full"
                />
              ) : (
                <div className="w-10 h-10 bg-muted rounded-full" />
              )}
            </div>
            <div className="text-sm font-medium flex flex-col">
              <span>{recycleHistory.user.name}</span>
              <span className="text-xs text-muted-foreground">
                {recycleHistory.user.email ??
                  recycleHistory.user.phoneNumber ??
                  recycleHistory.user.username}
              </span>
            </div>
          </div>
        </td>
        <td className="p-4 align-middle text-left">
          <div>
            {recycleHistory.bin.imageUrl ? (
              <img
                src={recycleHistory.bin.imageUrl}
                alt={recycleHistory.bin.material.name}
                className="w-20 h-20 object-cover"
              />
            ) : (
              <div className="w-15 h-15 bg-muted rounded-md" />
            )}
          </div>
          <div className="text-xs font-medium text-muted-foreground">
            <span>{recycleHistory.bin.number}</span>
          </div>
          <StatusBadge
            status={recycleHistory.bin.status.toLowerCase()}
            statusMap={{
              active: {
                label: 'Active',
                variant: 'default',
              },
            }}
          />
        </td>
        <td className="p-4 align-middle text-left">
          <Link
            href={`#`}
            className="text-sm font-medium text-primary hover:underline"
          >
            <span>{recycleHistory.bin.store.name}</span>
          </Link>
          <div className="text-xs font-medium text-muted-foreground flex gap-0.5">
            <span>
              {recycleHistory.bin.store.address1 &&
                recycleHistory.bin.store.address1}
              ,
            </span>
            <span>
              {recycleHistory.bin.store.address2 &&
                recycleHistory.bin.store.address2}
            </span>
            <span>
              {recycleHistory.bin.store.city && recycleHistory.bin.store.city},
            </span>
            <span>
              {recycleHistory.bin.store.state && recycleHistory.bin.store.state}
              ,
            </span>
            <span>
              {recycleHistory.bin.store.country &&
                recycleHistory.bin.store.country}
              ,
            </span>
            <span>
              {recycleHistory.bin.store.postalCode &&
                recycleHistory.bin.store.postalCode}
            </span>
          </div>
        </td>
        <td className="p-4 align-middle text-left">
          <div className="flex gap-1 flex-col text-sm text-muted-foreground">
            <span>
              {Intl.DateTimeFormat('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              }).format(new Date(recycleHistory.createdAt))}
            </span>
            <span>
              {Intl.DateTimeFormat('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              }).format(new Date(recycleHistory.createdAt))}
            </span>
          </div>
        </td>
      </tr>

      {recycleHistory.mediaUrl && (
        <Dialog
          open={openRecycleImageViewModal}
          onOpenChange={setOpenRecycleImageViewModal}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Recycle Media</DialogTitle>
            </DialogHeader>
            <DialogDescription>
              {recycleHistory.mediaUrl.endsWith('.mp4') &&
              recycleHistory.mediaUrl.startsWith('https://') ? (
                <video
                  src={recycleHistory.mediaUrl}
                  className="w-full h-[550px] object-contain"
                  controls
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              ) : (
                <img
                  src={recycleHistory.mediaUrl}
                  alt={recycleHistory.bin.material.name}
                  className="w-full h-full object-cover"
                />
              )}
            </DialogDescription>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
