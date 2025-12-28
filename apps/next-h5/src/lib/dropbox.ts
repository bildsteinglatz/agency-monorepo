/**
 * Dropbox helper with token refresh and a small retry strategy.
 * - getAccessToken(): exchanges refresh token for a short-lived access token
 * - uploadReceipt(buffer, fileName): uploads to /Apps/Halle5/2025/
 *
 * Required env vars (add to Vercel):
 * - DROPBOX_REFRESH_TOKEN
 * - DROPBOX_APP_KEY
 * - DROPBOX_APP_SECRET
 */

const DROPBOX_TOKEN_URL = 'https://api.dropbox.com/oauth2/token'
const DROPBOX_UPLOAD_URL = 'https://content.dropboxapi.com/2/files/upload'

type DropboxUploadResult = {
  id: string
  path_display: string
  name: string
}

async function getAccessToken(): Promise<string> {
  const refreshToken = process.env.DROPBOX_REFRESH_TOKEN
  const appKey = process.env.DROPBOX_APP_KEY
  const appSecret = process.env.DROPBOX_APP_SECRET
  const staticToken = process.env.DROPBOX_ACCESS_TOKEN

  // If we have a refresh token, always try to get a fresh access token
  if (refreshToken && appKey && appSecret) {
    try {
      const basic = Buffer.from(`${appKey}:${appSecret}`).toString('base64')
      const body = new URLSearchParams()
      body.set('grant_type', 'refresh_token')
      body.set('refresh_token', refreshToken)

      const res = await fetch(DROPBOX_TOKEN_URL, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${basic}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      })

      if (res.ok) {
        const json = await res.json()
        if (json.access_token) return json.access_token as string
      } else {
        const text = await res.text()
        console.warn(`Dropbox token refresh failed, falling back to static token if available: ${res.status} ${text}`)
      }
    } catch (err) {
      console.warn('Dropbox token refresh error, falling back to static token if available:', err)
    }
  }

  // Fallback to static token if refresh fails or is missing
  if (staticToken) {
    return staticToken
  }

  throw new Error('Missing Dropbox credentials. Provide DROPBOX_REFRESH_TOKEN (with APP_KEY/SECRET) or DROPBOX_ACCESS_TOKEN.')
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function uploadReceipt(buffer: Buffer, fileName: string): Promise<DropboxUploadResult> {
  const year = new Date().getFullYear()
  const dropboxPath = `/Apps/Halle5/${year}/${fileName}`

  // Try a few times for transient errors (rate limits/network)
  const maxAttempts = 3
  let attempt = 0
  let lastError: unknown = null

  while (attempt < maxAttempts) {
    attempt += 1
    try {
      const accessToken = await getAccessToken()

      const res = await fetch(DROPBOX_UPLOAD_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/octet-stream',
          'Dropbox-API-Arg': JSON.stringify({
            path: dropboxPath,
            mode: 'add',
            autorename: true,
            mute: false,
            strict_conflict: false,
          }),
        },
        body: new Uint8Array(buffer),
      })

      if (res.ok) {
        const data = (await res.json()) as DropboxUploadResult
        return data
      }

      // Handle specific statuses
      if (res.status === 409) {
        // Conflict — file/folder exists. Let Dropbox autorename handle filename collisions.
        const text = await res.text()
        throw new Error(`Dropbox conflict: ${text}`)
      }

      if (res.status === 429 || res.status === 503) {
        // Rate limited or service unavailable — retry with backoff
        const retryAfter = res.headers.get('Retry-After')
        const wait = retryAfter ? Number(retryAfter) * 1000 : 500 * attempt
        await sleep(wait)
        lastError = new Error(`Dropbox transient error ${res.status}`)
        continue
      }

      // Other errors — capture body for diagnostics
      const errText = await res.text()
      throw new Error(`Dropbox upload failed ${res.status}: ${errText}`)
    } catch (err) {
      lastError = err
      // exponential backoff before retrying
      await sleep(200 * attempt)
    }
  }

  throw lastError
}

export { getAccessToken }
