import { createClient } from 'next-sanity'

export const client = createClient({
  projectId: 'yh2vvooq',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: process.env.NODE_ENV === 'production', // Use CDN for production
})

// For preview mode (optional)
export const previewClient = createClient({
  projectId: 'yh2vvooq',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN, // Add this to your .env.local
})

export const getClient = (usePreview = false) => (usePreview ? previewClient : client)
