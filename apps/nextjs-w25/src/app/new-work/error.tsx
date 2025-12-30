'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] px-4">
      <h2 className="text-xl font-bold mb-4">Something went wrong!</h2>
      <p className="text-black dark:text-black mb-6 text-center max-w-md">
        We couldn&apos;t load the artworks. Please try again later.
      </p>
      <button
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
        className="px-4 py-2 bg-white text-white dark:bg-white dark:text-black rounded hover:opacity-90 transition-opacity"
      >
        Try again
      </button>
    </div>
  )
}
