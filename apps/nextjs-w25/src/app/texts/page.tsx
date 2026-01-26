import { client } from '@/sanity/client'
import { TEXTS_QUERY, TEXT_TYPES_QUERY, TEXT_ORDER_QUERY } from '@/sanity/queries'
import TextsClient from '@/components/texts/TextsClient.client'
import { ErrorBoundary } from '@/components/ErrorBoundary'

export const dynamic = 'force-dynamic';

export default async function Page() {
  try {
    const [types, manualOrderTexts, defaultTexts] = await Promise.all([
      client.fetch<string[]>(TEXT_TYPES_QUERY),
      client.fetch<any[]>(TEXT_ORDER_QUERY, { start: 0, end: 500 }),
      client.fetch<any[]>(TEXTS_QUERY, { start: 0, end: 500 })
    ]);

    // Use manual order if available, otherwise fallback to default sort
    const texts = manualOrderTexts && manualOrderTexts.length > 0
      ? manualOrderTexts
      : defaultTexts || [];

    return (
      <ErrorBoundary>
        <div className="min-h-screen transition-colors">
          <h1 className="sr-only">Texts</h1>
          <TextsClient texts={texts} types={types || []} />
        </div>
      </ErrorBoundary>
    )
  } catch (error) {
    console.error('Failed to fetch texts:', error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-xl font-owners uppercase opacity-60">Unable to load texts</h1>
      </div>
    );
  }
}
