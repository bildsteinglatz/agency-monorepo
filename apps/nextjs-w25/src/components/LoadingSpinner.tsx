export function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
    </div>
  )
}

export function LoadingText() {
  return (
    <div className="animate-pulse">
      <div className="h-8 bg-white dark:bg-white rounded mb-4"></div>
      <div className="h-4 bg-white dark:bg-white rounded mb-2"></div>
      <div className="h-4 bg-white dark:bg-white rounded mb-2"></div>
      <div className="h-4 bg-white dark:bg-white rounded w-3/4"></div>
    </div>
  )
}
