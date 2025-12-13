import { client } from '@/sanity/client';
import { TIMELINE_ARTWORKS_QUERY, TIMELINE_TEXTS_QUERY } from '@/sanity/queries';
import Timeline from '@/components/portrait/Timeline';

export const metadata = {
  title: 'Portrait | Bildstein | Glatz',
  description: 'Portrait of Bildstein | Glatz.',
};

export default async function Portrait() {
  const [artworks, timelineTexts] = await Promise.all([
    client.fetch(TIMELINE_ARTWORKS_QUERY),
    client.fetch(TIMELINE_TEXTS_QUERY)
  ]);

  return (
    <div className="h-screen w-full overflow-hidden">
      <h1 className="sr-only">Portrait</h1>
      <Timeline artworks={artworks} timelineTexts={timelineTexts} />
    </div>
  );
}
