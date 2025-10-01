import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-gray-200 dark:bg-gray-800", className)}
      {...props}
    />
  )
}

export function JobCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border bg-white dark:bg-gray-900">
      <div className="p-6">
        <div className="flex items-start gap-4">
          <Skeleton className="h-14 w-14 rounded-md" />
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <Skeleton className="h-6 w-48 mb-2" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-28" />
            </div>
            <div className="mt-4">
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-16" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t px-6 py-4 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-9 w-28" />
      </div>
    </div>
  )
}