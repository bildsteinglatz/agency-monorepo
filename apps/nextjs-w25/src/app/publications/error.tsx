'use client'

export default function PublicationsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] px-4">
      <h2 className="text-xl font-bold mb-4">Failed to load publications</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6 text-center max-w-md">
        We couldn&apos;t load the publications. Please try again later.
      </p>
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded hover:opacity-90 transition-opacity"
      >
        Try again
      </button>
    </div>
  )
}
