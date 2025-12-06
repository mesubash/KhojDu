import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function MessagesLoading() {
  return (
    <div className="page-shell">
      {/* Header Skeleton */}
      <header className="border-b border-border bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-8 w-20" />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Conversations List Skeleton */}
          <Card className="rounded-xl overflow-hidden">
            <CardHeader className="pb-4">
              <Skeleton className="h-6 w-20 mb-4" />
              <Skeleton className="h-10 w-full" />
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="p-4 border-l-4 border-l-transparent">
                    <div className="flex items-start space-x-3">
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <Skeleton className="h-4 w-24" />
                          <div className="flex items-center space-x-2">
                            <Skeleton className="h-3 w-12" />
                            <Skeleton className="h-4 w-4 rounded-full" />
                          </div>
                        </div>
                        <Skeleton className="h-3 w-32 mb-1" />
                        <Skeleton className="h-3 w-full" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Chat Area Skeleton */}
          <div className="lg:col-span-2">
            <Card className="rounded-xl h-full flex flex-col">
              {/* Chat Header Skeleton */}
              <CardHeader className="border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div>
                      <Skeleton className="h-4 w-24 mb-1" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                </div>
              </CardHeader>

              {/* Messages Skeleton */}
              <CardContent className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-4">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <div key={index} className={`flex ${index % 2 === 0 ? "justify-start" : "justify-end"}`}>
                      <div className="max-w-xs">
                        <Skeleton
                          className={`h-16 w-48 rounded-lg ${index % 2 === 0 ? "rounded-tl-none" : "rounded-tr-none"}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>

              {/* Message Input Skeleton */}
              <div className="border-t border-border p-4">
                <div className="flex space-x-2">
                  <Skeleton className="h-10 flex-1" />
                  <Skeleton className="h-10 w-10" />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
