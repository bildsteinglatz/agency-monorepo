'use client'

export default function GalleryError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] px-4">
      <h2 className="text-xl font-bold mb-4">Failed to load gallery</h2>
      <p className="text-black dark:text-black mb-6 text-center max-w-md">
        The 3D gallery could not be loaded. This may be due to a graphics compatibility issue.
      </p>
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-white text-white dark:bg-white dark:text-black rounded hover:opacity-90 transition-opacity"
      >
        Try again
      </button>
    </div>
  )
}
