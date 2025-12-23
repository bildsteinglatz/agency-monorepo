import { client } from "@/sanity/client";
import Link from "next/link";
import SloganSwitcher from "@/components/SloganSwitcher";
import ScrollIndicator from "@/components/ScrollIndicator";

export default async function Home() {
  let info = null;
  try {
    info = await client.fetch(`*[_id == "halle5Info"][0]{
      ...,
      heroImage { asset-> },
      heroVideo { asset-> },
      cards[]
    }`);
  } catch (error) {
    console.error("SANITY FETCH ERROR on Home Page:", error);
  }

  const heroType = info?.heroType || 'image';
  const heroBgColor = info?.heroColor || '#000000';
  const heroVideoUrl = info?.heroVideo?.asset?.url;
  const heroImageUrl = info?.heroImage?.asset?.url;

  // Default cards if none are defined in Sanity
  const defaultCards = [
    {
      title: "Besuchen",
      description: "Spinnergasse 1, 6850 Dornbirn. Entdecke unsere Räumlichkeiten.",
      cta: "Wo wir sind",
      link: "/visit",
      dark: false,
      highlight: false
    },
    {
      title: "Professionelle Kunstproduktion",
      description: "Exzellenz in der Umsetzung außergewöhnlicher Kunstprojekte.",
      cta: "Jetzt anfragen",
      link: "/atelier-aaa",
      dark: true,
      highlight: false
    },
    {
      title: "Workshops für Erwachsene",
      description: "Vertiefe deine künstlerischen Fähigkeiten in unseren Profi-Workshops.",
      cta: "Jetzt buchen",
      link: "/workshops",
      dark: false,
      highlight: false
    },
    {
      title: "Offenes Atelier Pinguin",
      description: "Kreative Entfaltung für Kinder und Jugendliche.",
      cta: "für Kinder und Jugendliche",
      link: "/pinguin",
      dark: false,
      highlight: false
    },
    {
      title: "Mitgliedschaft",
      description: "Werde Teil der Halle 5 Community und unterstütze die Kunst.",
      cta: "Jetzt Mitglied werden",
      link: "/member",
      dark: false,
      highlight: true
    },
    {
      title: "Künstler:innen",
      description: "Lerne mehr über die Künstler:innen die in Halle 5 arbeiten.",
      cta: "stay in touch",
      link: "/artists",
      dark: false,
      highlight: false
    }
  ];

  const cardsToRender = (info?.cards && info.cards.length > 0) ? info.cards : defaultCards;

  return (
    <main className="relative font-black uppercase">
      {/* Fixed Hero Section */}
      <section 
        className="fixed top-0 left-0 w-full h-[80vh] bg-black text-white px-8 overflow-hidden flex items-center z-0"
        style={{ backgroundColor: heroType === 'color' ? heroBgColor : 'black' }}
      >
        {heroType === 'image' && heroImageUrl && (
           // eslint-disable-next-line @next/next/no-img-element
           <img 
             src={heroImageUrl} 
             alt="Hero Background" 
             className="absolute top-0 left-0 w-full h-full object-cover opacity-50" 
           />
        )}
        {heroType === 'video' && heroVideoUrl && (
          <video 
            autoPlay 
            muted 
            loop 
            playsInline 
            className="absolute top-0 left-0 w-full h-full object-cover opacity-50"
          >
            <source src={heroVideoUrl} type="video/mp4" />
          </video>
        )}

        <div className="max-w-6xl mx-auto relative w-full flex flex-col md:flex-row md:items-center justify-between z-10">
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
        <ScrollIndicator variant="light" bottomClass="bottom-56" fadeStart={200} fadeEnd={900} />
      </section>

      {/* Spacer to allow scrolling past the fixed hero */}
      <div className="h-[71vh] bg-transparent" />

      {/* Slide-over Content Wrapper */}
      <div className="relative z-10 bg-white -mt-[2px]">
        {/* Grid Content */}
        <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
          <div className="grid md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {cardsToRender.map((card: any, index: number) => (
              <BrutalistCard
                key={index}
                title={card.title}
                description={card.description}
                cta={card.cta}
                href={card.link}
                dark={card.dark}
                highlight={card.highlight}
                bgColor={
                  card.title.toLowerCase().includes('workshop') ? '#47006e' : 
                  card.title.toLowerCase().includes('künstler') ? '#02eefa' : 
                  undefined
                }
                ctaBgColor={card.title.toLowerCase().includes('mitglied') ? '#facc15' : undefined}
              />
            ))}
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
  highlight = false,
  bgColor,
  ctaBgColor
}: {
  title: string;
  description: string;
  cta: string;
  href: string;
  dark?: boolean;
  highlight?: boolean;
  bgColor?: string;
  ctaBgColor?: string;
}) {
  // Determine if we should use light or dark text based on background
  // #02eefa (Artist blue) is light, #47006e (Workshop purple) is dark
  const isLightBg = bgColor === '#02eefa';
  const useWhiteText = (dark || highlight || (bgColor && !isLightBg));
  const textClass = useWhiteText ? 'text-white' : 'text-black';

  return (
    <div 
      className={`
        relative border-4 border-black p-8 flex flex-col justify-between min-h-[400px] transition-all overflow-hidden
        hover:translate-x-[-4px] hover:translate-y-[-4px]
        ${dark ? 'bg-black' : highlight ? 'bg-[#FF3100]' : bgColor ? '' : 'bg-white'}
        ${textClass}
        ${dark ? 'shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]' : 'shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]'}
      `}
      style={bgColor ? { backgroundColor: bgColor } : {}}
    >
      <div className="relative z-10">
        <h3 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase leading-none mb-6 tracking-tighter">{title}</h3>
        <p className="text-lg font-bold leading-snug">{description}</p>
      </div>

      <Link
        href={href}
        className={`
          relative z-10 mt-8 inline-block border-4 px-6 py-3 text-xl font-black uppercase text-center
          transition-all
          ${ctaBgColor 
            ? 'border-black text-black hover:bg-black hover:text-white' 
            : useWhiteText
              ? 'border-white text-white hover:bg-white hover:text-black'
              : 'border-black text-black hover:bg-black hover:text-white'
          }
        `}
        style={ctaBgColor ? { backgroundColor: ctaBgColor } : {}}
      >
        {cta}
      </Link>
    </div>
  );
}
