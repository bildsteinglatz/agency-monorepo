import { Metadata } from 'next';
import { client } from '@/sanity/client';
import { groq } from 'next-sanity';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import Link from 'next/link';
import { ArrowLeft, Zap, Cpu, Gamepad2, Palette, FileText } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Building Log | halle 5',
  description: 'Die Evolution der halle 5. Alle Updates, neuen Features und Verbesserungen auf einen Blick.',
};

interface ChangelogEntry {
  _id: string;
  title: string;
  date: string;
  category: 'system' | 'ai' | 'game' | 'design' | 'content';
  room?: string;
  description: string;
  link?: string;
}

async function getChangelog(): Promise<ChangelogEntry[]> {
  return await client.fetch(
    groq`*[_type == "changelog"] | order(date desc) {
      _id,
      title,
      date,
      category,
      room,
      description,
      link
    }`
  );
}

const CategoryIcon = ({ category }: { category: string }) => {
  switch (category) {
    case 'ai': return <Cpu className="w-5 h-5" />;
    case 'game': return <Gamepad2 className="w-5 h-5" />;
    case 'design': return <Palette className="w-5 h-5" />;
    case 'content': return <FileText className="w-5 h-5" />;
    default: return <Zap className="w-5 h-5" />;
  }
};

export default async function ChangelogPage() {
  const entries = await getChangelog();

  return (
    <div className="min-h-screen bg-[#facc15] pt-24 pb-20 px-6 md:px-8">
      <div className="max-w-4xl mx-auto">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 font-bold uppercase mb-8 hover:translate-x-[-4px] transition-transform"
        >
          <ArrowLeft className="w-5 h-5" />
          Zurück
        </Link>

        <h1 className="text-6xl md:text-8xl font-black uppercase mb-4 leading-none text-black">
          Building Log
        </h1>
        <p className="text-xl md:text-2xl font-bold mb-12 max-w-2xl text-black uppercase leading-tight">
          Die Evolution der halle 5. Updates, Experimente und neue Räume.
        </p>

        <div className="space-y-8">
          {entries.length > 0 ? (
            entries.map((entry) => (
              <div 
                key={entry._id}
                className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 md:p-8"
              >
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  <div className="bg-black text-white px-3 py-1 font-black uppercase text-sm flex items-center gap-2">
                    <CategoryIcon category={entry.category} />
                    {entry.category}
                  </div>
                  <div className="font-mono font-bold text-black">
                    {format(new Date(entry.date), 'dd. MMMM yyyy', { locale: de })}
                  </div>
                  {entry.room && (
                    <div className="border-2 border-black px-2 py-0.5 font-bold text-xs uppercase">
                      {entry.room}
                    </div>
                  )}
                </div>

                <h2 className="text-2xl md:text-3xl font-black uppercase mb-4 leading-tight text-black">
                  {entry.title}
                </h2>
                
                <p className="text-lg font-medium mb-6 leading-relaxed whitespace-pre-wrap text-black">
                  {entry.description}
                </p>

                {entry.link && (
                  <Link 
                    href={entry.link}
                    className="inline-flex items-center gap-2 bg-yellow-400 border-2 border-black px-4 py-2 font-black uppercase hover:bg-black hover:text-yellow-400 transition-colors"
                  >
                    Ansehen
                  </Link>
                )}
              </div>
            ))
          ) : (
            <div className="bg-white border-4 border-black p-12 text-center">
              <p className="text-2xl font-black uppercase">Noch keine Einträge vorhanden.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
