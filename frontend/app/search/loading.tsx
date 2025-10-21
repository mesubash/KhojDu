import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function SearchLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Skeleton */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Skeleton className="h-8 w-32" />
            <div className="flex items-center space-x-4">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-16" />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters Skeleton */}
        <div className="mb-8">
          <Skeleton className="h-8 w-64 mb-6" />
          <Card className="p-6 rounded-xl shadow-sm bg-white">
            <div className="space-y-6">
              <Skeleton className="h-12 w-full" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-12 w-full" />
                </div>
                <div>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-12 w-full" />
                </div>
                <div>
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-6 w-full" />
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Results Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="flex items-center space-x-2">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>

        {/* Listings Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card
              key={index}
              className="rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden bg-white"
            >
              <Skeleton className="w-full h-48" />
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                  <Skeleton className="h-5 w-12" />
                </div>
                <Skeleton className="h-6 w-24 mb-3" />
                <div className="flex flex-wrap gap-1 mb-4">
                  <Skeleton className="h-5 w-12" />
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-14" />
                </div>
                <div className="flex space-x-2">
                  <Skeleton className="h-9 flex-1" />
                  <Skeleton className="h-9 w-9" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
