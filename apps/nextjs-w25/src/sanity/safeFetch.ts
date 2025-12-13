import { client } from './client'

export async function safeFetch<T = unknown>(query: string, params?: Record<string, unknown>, fallback: T | null = null): Promise<T | null> {
  try {
    // Pass params through without unsafe client casting. The Sanity client's fetch is typed to accept
    // arbitrary parameter objects; we coerce via unknown to avoid `as any` usage while keeping typing generic.
    const res = await client.fetch(query, params as Record<string, unknown>)
    return (res as unknown as T) ?? fallback
  } catch (error) {
    // Only log verbose debug info in non-production environments
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.error('safeFetch: query failed', { query: query?.slice(0, 120), params, error })
    }
    return fallback
  }
}
