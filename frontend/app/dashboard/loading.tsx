export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="text-center space-y-3">
        <div className="flex items-end gap-1">
          <span className="h-10 w-2 bg-orange-500 rounded-full animate-[kd-spinner-bars_1s_ease-in-out_infinite] [animation-delay:-0.3s]" />
          <span className="h-10 w-2 bg-orange-500 rounded-full animate-[kd-spinner-bars_1s_ease-in-out_infinite] [animation-delay:-0.2s]" />
          <span className="h-10 w-2 bg-orange-500 rounded-full animate-[kd-spinner-bars_1s_ease-in-out_infinite] [animation-delay:-0.1s]" />
          <span className="h-10 w-2 bg-orange-500 rounded-full animate-[kd-spinner-bars_1s_ease-in-out_infinite]" />
        </div>
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    </div>
  )
}
