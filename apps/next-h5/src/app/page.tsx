import { client } from "@/sanity/client";
import Link from "next/link";
import SloganSwitcher from "@/components/SloganSwitcher";
import ScrollIndicator from "@/components/ScrollIndicator";

export default async function Home() {
  let info = null;
  try {
    info = await client.fetch(`*[_type == "halle5Info"][0]`);
  } catch (error) {
    console.error("SANITY FETCH ERROR on Home Page:", error);
  }

  return (
    <main className="relative font-black uppercase">
      {/* Fixed Hero Section */}
      <section className="fixed top-0 left-0 w-full h-[80vh] bg-black text-white px-8 overflow-hidden flex items-center z-0">
        <div className="max-w-6xl mx-auto relative w-full flex flex-col md:flex-row md:items-center justify-between">
          <div className="relative z-10">
            <div className="text-2xl md:text-3xl font-bold max-w-4xl leading-tight uppercase">
              <p>
                Ateliers und Werkstätten<br />
                für Kunst und Kulturproduktion
              </p>
            </div>
            <p className="md:text-1xl font-bold max-w-2xl py-2 leading-tight uppercase">
              Spinnergasse 1 – 6850 Dornbirn
            </p>
          </div>

          {/* Slogan Switcher - Absolutely positioned right on desktop, under text on mobile */}
          <div className="relative md:absolute left-0 md:left-auto md:right-0 top-auto md:top-1/2 md:-translate-y-1/2 w-full md:w-auto px-0 mt-4 md:mt-0">
            <SloganSwitcher />
          </div>
        </div>
        <ScrollIndicator variant="light" bottomClass="bottom-32" />
      </section>

      {/* Spacer to allow scrolling past the fixed hero */}
      <div className="h-[80vh] bg-transparent" />

      {/* Slide-over Content Wrapper */}
      <div className="relative z-10 bg-white shadow-[0_-20px_100px_rgba(0,0,0,0.8)] border-t-8 border-black -mt-[2px]">
        {/* Grid Content */}
        <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <BrutalistCard
              title="Besuchen"
              description="Spinnergasse 1, 6850 Dornbirn. Entdecke unsere Räumlichkeiten."
              cta="Wo wir sind"
              href="/visit"
            />
            <BrutalistCard
              title="Professionelle Kunstproduktion"
              description="Exzellenz in der Umsetzung außergewöhnlicher Kunstprojekte."
              cta="Jetzt anfragen"
              href="/atelier-aaa"
              dark
            />
            <BrutalistCard
              title="Workshops für Erwachsene"
              description="Vertiefe deine künstlerischen Fähigkeiten in unseren Profi-Workshops."
              cta="Jetzt buchen"
              href="/workshops"
            />
            <BrutalistCard
              title="Offenes Atelier Pinguin"
              description="Kreative Entfaltung für Kinder und Jugendliche."
              cta="für Kinder und Jugendliche"
              href="/pinguin"
            />
            <BrutalistCard
              title="Mitgliedschaft"
              description="Werde Teil der Halle 5 Community und unterstütze die Kunst."
              cta="Jetzt Mitglied werden"
              href="/member"
              highlight
            />
            <BrutalistCard
              title="Künstler:innen"
              description="Lerne mehr über die Künstler:innen die in Halle 5 arbeiten."
              cta="stay in touch"
              href="/artists"
            />
          </div>
        </section>
      </div>
    </main>
  );
}

function BrutalistCard({
  title,
  description,
  cta,
  href,
  dark = false,
  highlight = false
}: {
  title: string;
  description: string;
  cta: string;
  href: string;
  dark?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className={`
      border-4 border-black p-8 flex flex-col justify-between min-h-[400px] transition-all
      hover:translate-x-[-4px] hover:translate-y-[-4px]
      ${dark ? 'bg-black text-white' : highlight ? 'bg-[#FF3100] text-white' : 'bg-white text-black'}
      ${dark ? 'shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]' : highlight ? 'shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]' : 'shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]'}
    `}>
      <div>
        <h3 className="text-4xl font-black uppercase leading-none mb-6 tracking-tighter">{title}</h3>
        <p className="text-lg font-bold leading-snug">{description}</p>
      </div>

      <Link
        href={href}
        className={`
          mt-8 inline-block border-4 px-6 py-3 text-xl font-black uppercase text-center
          transition-all
          ${highlight
            ? 'border-white text-white hover:bg-white hover:text-[#FF3100]'
            : 'border-current hover:bg-[#FF3100] hover:border-[#FF3100] hover:text-white'
          }
        `}
      >
        {cta}
      </Link>
    </div>
  );
}
