import { Skeleton } from "@/components/ui/skeleton";

export function ProdukCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-xl sm:rounded-2xl overflow-hidden flex flex-col h-full min-h-[300px]">
      <Skeleton className="aspect-square sm:aspect-[4/3] w-full shrink-0 rounded-none" />
      <div className="p-3 sm:p-5 flex flex-col flex-1">
        <Skeleton className="h-3 w-1/3 mb-2" />
        <Skeleton className="h-4 w-4/5 mb-2" />
        <Skeleton className="h-4 w-2/3" />
        <div className="mt-auto pt-2 sm:pt-4 flex items-center justify-between gap-2">
          <div className="flex flex-col w-full gap-1">
             <Skeleton className="h-3 w-1/2" />
             <Skeleton className="h-5 w-3/4" />
          </div>
          <Skeleton className="h-8 w-8 sm:h-10 sm:w-10 rounded-full shrink-0" />
        </div>
      </div>
    </div>
  );
}

export function ProdukCardSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-6 md:gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <ProdukCardSkeleton key={i} />
      ))}
    </div>
  );
}
