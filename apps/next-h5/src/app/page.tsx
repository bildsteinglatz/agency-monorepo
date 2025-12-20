import { client } from "@/sanity/client";
import Link from "next/link";

export default async function Home() {
  const info = await client.fetch(`*[_type == "halle5Info"][0]`);

  return (
    <main className="min-h-screen bg-white text-black font-[family-name:var(--font-geist-sans)]">
      {/* Hero Section */}
      <section className="bg-black text-white py-32 px-8 border-b-8 border-black">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-8xl md:text-9xl font-black tracking-tighter uppercase mb-6 leading-none">
            {info?.title || "Halle 5"}
          </h1>
          <p className="text-2xl md:text-3xl font-bold max-w-2xl leading-tight uppercase">
            Ateliers und Werkstätten für zeitgenössische bildende Kunst.
          </p>
        </div>
      </section>

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
            href="/adlassnigg"
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

        </div>
      </section>

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
