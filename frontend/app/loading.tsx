"use client"

import { Spinner } from "@/components/ui/spinner"

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="text-center space-y-3">
        <Spinner size={40} />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}
