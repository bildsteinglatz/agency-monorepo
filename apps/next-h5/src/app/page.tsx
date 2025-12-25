import { client } from "@/sanity/client";
import Link from "next/link";
import Image from "next/image";
import SloganSwitcher from "@/components/SloganSwitcher";
import ScrollIndicator from "@/components/ScrollIndicator";
import { urlFor } from "@/sanity/image";
import BrutalistHomeCard from "@/components/BrutalistHomeCard";

export default async function Home() {
  let info = null;
  try {
    info = await client.fetch(`*[_id == "halle5Info" && showOnWebsite != false][0]{
      ...,
      heroImage { asset-> },
      heroVideo { asset-> },
      "cards": cards[showOnWebsite != false] {
        title,
        description,
        cta,
        link,
        backgroundImage { asset-> },
        backgroundColor,
        textColor,
        buttonBackgroundColor,
        buttonTextColor,
        buttonBorderColor,
        buttonHoverBackgroundColor,
        buttonHoverTextColor,
        buttonHoverBorderColor
      }
    }`);
  } catch (error) {
    console.error("SANITY FETCH ERROR on Home Page:", error);
  }

  const heroType = info?.heroType || 'image';
  const heroBgColor = info?.heroColor || '#000000';
  const heroVideoUrl = info?.heroVideo?.asset?.url;

  // Default cards if none are defined in Sanity
  const defaultCards = [
    {
      title: "Besuchen",
      description: "Spinnergasse 1, 6850 Dornbirn. Entdecke unsere Räumlichkeiten.",
      cta: "Wo wir sind",
      link: "/visit",
      backgroundColor: '#ffffff',
      textColor: '#000000',
      buttonBackgroundColor: 'transparent',
      buttonTextColor: '#000000',
      buttonBorderColor: '#000000',
      buttonHoverBackgroundColor: '#000000',
      buttonHoverTextColor: '#ffffff',
      buttonHoverBorderColor: '#000000'
    },
    {
      title: "Professionelle Kunstproduktion",
      description: "Exzellenz in der Umsetzung außergewöhnlicher Kunstprojekte.",
      cta: "Jetzt anfragen",
      link: "/atelier-aaa",
      backgroundColor: '#000000',
      textColor: '#ffffff',
      buttonBackgroundColor: 'transparent',
      buttonTextColor: '#ffffff',
      buttonBorderColor: '#ffffff',
      buttonHoverBackgroundColor: '#ffffff',
      buttonHoverTextColor: '#000000',
      buttonHoverBorderColor: '#ffffff'
    },
    {
      title: "Workshops für Erwachsene",
      description: "Vertiefe deine künstlerischen Fähigkeiten in unseren Profi-Workshops.",
      cta: "Jetzt buchen",
      link: "/workshops",
      backgroundColor: '#ffffff',
      textColor: '#000000',
      buttonBackgroundColor: 'transparent',
      buttonTextColor: '#000000',
      buttonBorderColor: '#000000',
      buttonHoverBackgroundColor: '#000000',
      buttonHoverTextColor: '#ffffff',
      buttonHoverBorderColor: '#000000'
    },
    {
      title: "Offenes Atelier Pinguin",
      description: "Kreative Entfaltung für Kinder und Jugendliche.",
      cta: "für Kinder und Jugendliche",
      link: "/pinguin",
      backgroundColor: '#ffffff',
      textColor: '#000000',
      buttonBackgroundColor: 'transparent',
      buttonTextColor: '#000000',
      buttonBorderColor: '#000000',
      buttonHoverBackgroundColor: '#000000',
      buttonHoverTextColor: '#ffffff',
      buttonHoverBorderColor: '#000000'
    },
    {
      title: "Mitgliedschaft",
      description: "Werde Teil der Halle 5 Community und unterstütze die Kunst.",
      cta: "Jetzt Mitglied werden",
      link: "/member",
      backgroundColor: '#FF3100',
      textColor: '#ffffff',
      buttonBackgroundColor: '#FF3100',
      buttonTextColor: '#ffffff',
      buttonBorderColor: '#000000',
      buttonHoverBackgroundColor: '#ffffff',
      buttonHoverTextColor: '#000000',
      buttonHoverBorderColor: '#000000'
    },
    {
      title: "Künstler:innen",
      description: "Lerne mehr über die Künstler:innen die in Halle 5 arbeiten.",
      cta: "stay in touch",
      link: "/artists",
      backgroundColor: '#ffffff',
      textColor: '#000000',
      buttonBackgroundColor: 'transparent',
      buttonTextColor: '#000000',
      buttonBorderColor: '#000000',
      buttonHoverBackgroundColor: '#000000',
      buttonHoverTextColor: '#ffffff',
      buttonHoverBorderColor: '#000000'
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
        {heroType === 'image' && info?.heroImage && (
           <>
             <Image 
               src={urlFor(info.heroImage).width(1920).auto('format').url()} 
               alt="Hero Background" 
               fill
               priority
               className="object-cover"
               sizes="100vw"
             />
             <div className="absolute inset-0 bg-black/40 z-[1]" />
           </>
        )}
        {heroType === 'video' && heroVideoUrl && (
          <>
            <video 
              autoPlay 
              muted 
              loop 
              playsInline 
              className="absolute top-0 left-0 w-full h-full object-cover"
            >
              <source src={heroVideoUrl} type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-black/40 z-[1]" />
          </>
        )}

        <div className="max-w-6xl mx-auto relative w-full flex flex-col md:flex-row md:items-center justify-between z-10">
          <div className="relative z-10 text-white">
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
        <ScrollIndicator variant="yellow" bottomClass="md:bottom-[294px] bottom-[224px]" fadeStart={200} fadeEnd={900} />
      </section>

      {/* Spacer to allow scrolling past the fixed hero */}
      <div className="h-[71vh] bg-transparent" />

      {/* Slide-over Content Wrapper */}
      <div className="relative z-10 bg-white -mt-[2px]">
        {/* Grid Content */}
        <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
          <div className="grid md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {cardsToRender.map((card: any, index: number) => (
              <BrutalistHomeCard
                key={index}
                title={card.title}
                description={card.description}
                cta={card.cta}
                href={card.link}
                backgroundImage={card.backgroundImage}
                backgroundColor={card.backgroundColor}
                textColor={card.textColor}
                buttonBackgroundColor={card.buttonBackgroundColor}
                buttonTextColor={card.buttonTextColor}
                buttonBorderColor={card.buttonBorderColor}
                buttonHoverBackgroundColor={card.buttonHoverBackgroundColor}
                buttonHoverTextColor={card.buttonHoverTextColor}
                buttonHoverBorderColor={card.buttonHoverBorderColor}
              />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}


