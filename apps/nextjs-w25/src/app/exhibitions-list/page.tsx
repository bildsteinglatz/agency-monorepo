import { safeFetch } from '@/sanity/safeFetch'
import { CV_EXHIBITIONS_QUERY } from '@/sanity/queries'
import CvDownloadButton from '@/components/CvDownloadButton'
import { Exhibition, formatExhibitionDetails } from '@/utils/exhibitions'
import { MotionWrapper } from '@/components/MotionWrapper'

export const metadata = {
  title: 'Exhibition List | Bildstein | Glatz',
  description: 'Simple chronological list of exhibitions by Bildstein | Glatz.',
};

export default async function ExhibitionsListPage() {
  const exhibitions: Exhibition[] = (await safeFetch<Exhibition[]>(CV_EXHIBITIONS_QUERY, { start: 0, end: 9999 }, [])) || []

  const soloExhibitions = exhibitions.filter((ex) => ex.exhibitionType === 'solo');
  const publicSpaceExhibitions = exhibitions.filter((ex) => ex.exhibitionType === 'public_space');
  const groupExhibitions = exhibitions.filter((ex) => ex.exhibitionType === 'group');
  const fairExhibitions = exhibitions.filter((ex) => ex.exhibitionType === 'fair');
  const biennaleExhibitions = exhibitions.filter((ex) => ex.exhibitionType === 'biennale');
  const otherExhibitions = exhibitions.filter((ex) => ex.exhibitionType === 'other');

  const currentDate = new Date();
  const dateString = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen transition-colors">
  <div className="max-w-4xl mx-auto px-6 pt-24 pb-20">
    <MotionWrapper delay={0.9} yOffset={50}>

        {/* CV / Biography Section */}
        <section className="mb-16">
          <div className="flex items-center justify-between pb-4 border-b border-current mb-8">
            <h1 className="title-text text-2xl">CV – Bildstein | Glatz – {dateString}</h1>
            <CvDownloadButton 
              soloExhibitions={soloExhibitions}
              groupExhibitions={groupExhibitions}
              publicSpaceExhibitions={publicSpaceExhibitions}
              fairExhibitions={fairExhibitions}
              biennaleExhibitions={biennaleExhibitions}
              otherExhibitions={otherExhibitions}
            />
          </div>

          <div className="mb-12 max-w-3xl">
            {/* Bio text removed */}
          </div>

          <div className="mb-12">
            <h3 className="title-text text-lg mb-1">Matthias Bildstein</h3>
            <p className="body-text">Geboren 1978 in Hohenems, Österreich</p>
            <p className="mb-2 body-text">Lebt und arbeitet in Wien und Dornbirn</p>
            <div className="body-text mb-4">
              <p>Ausbildung:</p>
              <p>2006-2011 Universität für Angewandte Kunst Wien, Bildhauerei und Multimedia (Erwin Wurm), Mag. art</p>
              <p>2006-2008 Akademie der bildenden Künste Wien, Video und Video Installation (Dorit Margreiter)</p>
              <p>1998-2002 Fachhochschule Vorarlberg, Intermedia, Mag. FH</p>
              <p>2001 Hogeschool voor de Kunsten, Utrecht (Exchange semester)</p>
            </div>
          </div>

          <div>
            <h3 className="title-text text-lg mb-1">Philippe Glatz</h3>
            <p className="body-text">Geboren 1979 in St. Gallen, Schweiz</p>
            <p className="mb-2 body-text">Lebt und arbeitet in Kreuzlingen und Dornbirn</p>
            <div className="body-text mb-4">
              <p>Ausbildung:</p>
              <p>2009-2011 Akademie der Bildenden Künste Wien, Abstrakte Malerei (Erwin Bohatsch), Mag. art</p>
              <p>2009-2010 Universität für Angewandte Kunst Wien, Malerei (Johanna Kandl)</p>
              <p>2009-2010 National College of Art and Design, Dublin (Erasmus, Malerei-Klasse)</p>
              <p>2006-2009 Zürcher Hochschule der Künste, BA in Fine Art</p>
              <p>1996-2000 Ausbildung zum Offsetdrucker</p>
            </div>
          </div>
        </section>

        {/* Solo Exhibitions */}
        {soloExhibitions.length > 0 && (
          <section className="mb-16">
            <h2 className="about-title text-xl mb-2">
              Solo Exhibitions
            </h2>
            <div className="space-y-1">
              {soloExhibitions.map((exhibition: Exhibition) => (
                <div key={exhibition._id} className="about-text flex gap-4">
                    <span className="w-[2.25rem] shrink-0 tabular-nums">{exhibition.year}</span>
                    <span>{formatExhibitionDetails(exhibition).replace(/\s+,/g, ',')}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Works in Public Space */}
        {publicSpaceExhibitions.length > 0 && (
          <section className="mb-16">
            <h2 className="about-title text-lg mb-4">
              Works in public space
            </h2>
            <div className="space-y-1">
              {publicSpaceExhibitions.map((exhibition: Exhibition) => (
                <div key={exhibition._id} className="about-text flex gap-4">
                    <span className="w-[2.25rem] shrink-0 tabular-nums">{exhibition.year}</span>
                    <span>{formatExhibitionDetails(exhibition).replace(/\s+,/g, ',')}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Group Exhibitions */}
        {groupExhibitions.length > 0 && (
          <section className="mb-16">
            <h2 className="about-title text-lg mb-4">
              Group Exhibitions
            </h2>
            <div className="space-y-1">
              {groupExhibitions.map((exhibition: Exhibition) => (
                <div key={exhibition._id} className="about-text flex gap-4">
                    <span className="w-[2.25rem] shrink-0 tabular-nums">{exhibition.year}</span>
                    <span>{formatExhibitionDetails(exhibition).replace(/\s+,/g, ',')}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Art Fairs */}
        {fairExhibitions.length > 0 && (
          <section className="mb-16">
            <h2 className="about-title text-lg mb-4">
              Art Fairs
            </h2>
            <div className="space-y-1">
              {fairExhibitions.map((exhibition: Exhibition) => (
                <div key={exhibition._id} className="about-text flex gap-4">
                    <span className="w-[2.25rem] shrink-0 tabular-nums">{exhibition.year}</span>
                    <span>{formatExhibitionDetails(exhibition).replace(/\s+,/g, ',')}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Biennials */}
        {biennaleExhibitions.length > 0 && (
          <section className="mb-16">
            <h2 className="about-title text-lg mb-4">
              Biennials
            </h2>
            <div className="space-y-1">
              {biennaleExhibitions.map((exhibition: Exhibition) => (
                <div key={exhibition._id} className="about-text flex gap-4">
                    <span className="w-[2.25rem] shrink-0 tabular-nums">{exhibition.year}</span>
                    <span>{formatExhibitionDetails(exhibition).replace(/\s+,/g, ',')}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Other */}
        {otherExhibitions.length > 0 && (
          <section className="mb-16">
            <h2 className="about-title text-lg mb-4">
              Other
            </h2>
            <div className="space-y-1">
              {otherExhibitions.map((exhibition: Exhibition) => (
                <div key={exhibition._id} className="about-text flex gap-4">
                    <span className="w-[2.25rem] shrink-0 tabular-nums">{exhibition.year}</span>
                    <span>{formatExhibitionDetails(exhibition).replace(/\s+,/g, ',')}</span>
                </div>
              ))}
            </div>
          </section>
        )}

    </MotionWrapper>
      </div>
    </div>
  );
}
