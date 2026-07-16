import { Skeleton } from "@/components/ui/skeleton";

export function ProdukCardSkeleton() {
  return (
    <div className="bg-white border border-slate-200 rounded-xl sm:rounded-2xl overflow-hidden">
      <Skeleton className="aspect-square sm:aspect-[4/3] w-full rounded-none" />
      <div className="p-3 sm:p-5 flex flex-col h-[130px] sm:h-[180px]">
        <Skeleton className="h-3 w-1/3 mb-2" />
        <Skeleton className="h-4 w-4/5 mb-2" />
        <Skeleton className="h-4 w-2/3" />
        <div className="mt-auto pt-2 sm:pt-4 flex items-end justify-between">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-7 w-7 sm:h-10 sm:w-10 rounded-full" />
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
