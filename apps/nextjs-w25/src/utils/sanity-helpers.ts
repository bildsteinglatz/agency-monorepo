/**
 * Safely extracts the current slug string from various Sanity slug formats
 */
export const slugToString = (s: string | { current?: string } | undefined): string | undefined => {
  if (!s) return undefined
  if (typeof s === 'string') return s
  return (s as { current?: string })?.current
}

/**
 * Safely extracts an image URL from various Sanity image formats
 */
export const getAssetUrl = (maybeAsset: unknown): string | undefined => {
  if (!maybeAsset) return undefined
  if (typeof maybeAsset === 'string') return maybeAsset
  
  const a = maybeAsset as { url?: unknown; asset?: { url?: unknown } }
  if (typeof a.url === 'string') return a.url
  if (a.asset && typeof a.asset.url === 'string') return a.asset.url
  
  return undefined
}
