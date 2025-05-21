import { Skeleton } from "@/components/ui/skeleton";

export function CouponsTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-[250px]" />
        <div className="flex items-center space-x-2">
          <Skeleton className="h-10 w-[200px]" />
          <Skeleton className="h-10 w-[120px]" />
        </div>
      </div>
      
      <div className="rounded-md border">
        <div className="border-b bg-muted/50 p-4">
          <div className="flex space-x-4">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
        
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="border-b p-4">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-lg" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-48" />
              <div className="flex space-x-2 ml-auto">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}