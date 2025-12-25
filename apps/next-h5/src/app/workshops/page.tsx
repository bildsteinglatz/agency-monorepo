import { client } from "@/sanity/client";
import { urlFor } from "@/sanity/image";
import { PortableText } from "@portabletext/react";
import Image from "next/image";
import { WorkshopBookingButton } from "@/components/workshops/WorkshopBookingButton";

interface Artist {
  vorname?: string;
  name: string;
  slug: { current: string };
}

interface Workshop {
  _id: string;
  title: string;
  subtitle?: string;
  slug: { current: string };
  status: "entwurf" | "book now" | "ausgebucht";
  mainImage?: any;
  description?: any[];
  ablauf?: any[];
  dates?: string[];
  price?: string;
  artists?: Artist[];
}

async function getWorkshops() {
  const query = `*[_type == "workshop" && showOnWebsite != false] | order(dates[0] desc) {
    _id,
    title,
    subtitle,
    slug,
    status,
    mainImage,
    description,
    ablauf,
    dates,
    price,
    "artists": artists[]->[showOnWebsite != false]{
      vorname,
      name,
      slug
    }
  }`;
  return await client.fetch<Workshop[]>(query);
}

const StatusBadge = ({ status }: { status: Workshop["status"] }) => {
  const colors = {
    entwurf: "bg-gray-500 text-white",
    "book now": "bg-green-500 text-white",
    ausgebucht: "bg-red-500 text-white",
  };

  const labels = {
    entwurf: "In Planung",
    "book now": "Jetzt Buchen",
    ausgebucht: "Ausgebucht",
  };

  return (
    <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider border-2 border-black ${colors[status]}`}>
      {labels[status]}
    </span>
  );
};

export default async function WorkshopsPage() {
  const workshops = await getWorkshops();

  return (
    <div className="min-h-screen bg-[#47006e] text-white pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 border-b-8 border-white pb-8">
          <h1 className="text-6xl sm:text-8xl font-black uppercase tracking-tighter leading-none">
            Workshops
          </h1>
          <p className="mt-6 text-2xl sm:text-3xl font-bold uppercase max-w-3xl leading-tight">
            Unser Kursprogramm. <br/>
            <span className="text-purple-200 italic">Lerne mit den Besten.</span>
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {workshops.map((workshop, index) => (
            <div 
              key={workshop._id} 
              className="border-4 border-black bg-white text-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex flex-col hover:translate-x-1 hover:translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all"
            >
              {workshop.mainImage && (
                <div className="relative h-72 sm:h-96 border-b-4 border-black overflow-hidden">
                  <Image
                    src={urlFor(workshop.mainImage).width(800).auto('format').url()}
                    alt={workshop.title}
                    fill
                    className="object-cover"
                    priority={index === 0}
                    fetchPriority={index === 0 ? "high" : undefined}
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute top-6 right-6">
                    <StatusBadge status={workshop.status} />
                  </div>
                </div>
              )}
              
              <div className="p-8 flex-grow">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-4xl font-black uppercase leading-none mb-2">
                      {workshop.title}
                    </h2>
                    {workshop.subtitle && (
                      <p className="text-xl font-bold text-gray-600 uppercase italic">
                        {workshop.subtitle}
                      </p>
                    )}
                  </div>
                  {!workshop.mainImage && <StatusBadge status={workshop.status} />}
                </div>

                <div className="flex flex-wrap gap-4 mb-8">
                  {workshop.dates && workshop.dates.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {workshop.dates.map((date, index) => (
                        <div key={index} className="bg-black text-white px-4 py-2 text-lg font-black uppercase">
                          {new Date(date).toLocaleDateString('de-DE', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {workshop.artists && workshop.artists.length > 0 && (
                    <div className="flex gap-2">
                      {workshop.artists.filter(Boolean).map((artist) => (
                        <div 
                          key={artist.slug?.current || artist.name}
                          className="border-2 border-black px-4 py-2 text-lg font-black uppercase bg-yellow-300"
                        >
                          {artist.vorname} {artist.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {workshop.description && (
                  <div className="mb-8 font-bold text-xl leading-snug prose-p:mb-4">
                    <PortableText value={workshop.description} />
                  </div>
                )}

                {workshop.ablauf && (
                  <div className="border-t-4 border-black pt-6 mt-6">
                    <h3 className="text-lg font-black uppercase mb-4 bg-black text-white inline-block px-2">Ablauf</h3>
                    <div className="font-bold text-lg leading-relaxed prose-p:mb-4">
                      <PortableText value={workshop.ablauf} />
                    </div>
                  </div>
                )}
              </div>

              <div className="p-8 pt-0 mt-auto flex justify-end">
                {workshop.status === "book now" ? (
                  <WorkshopBookingButton 
                    workshopTitle={workshop.title}
                    workshopDate={workshop.dates?.[0] ? new Date(workshop.dates[0]).toLocaleDateString('de-DE', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    }) : undefined}
                    price={workshop.price || '0'}
                  />
                ) : (
                  <div className="bg-gray-100 text-gray-400 py-2 px-4 text-sm font-black uppercase text-center border-2 border-dashed border-gray-300">
                    {workshop.status === "ausgebucht" ? "Ausgebucht" : "In Planung"}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {workshops.length === 0 && (
          <div className="text-center py-32 border-8 border-dashed border-white bg-white/10 backdrop-blur-sm">
            <p className="text-4xl font-black uppercase tracking-tighter">Aktuell sind keine Workshops geplant.</p>
            <p className="mt-4 text-xl font-bold uppercase text-purple-200">Schau bald wieder vorbei!</p>
          </div>
        )}

        {/* CTA Footer */}
        <section className="mt-32 py-20 md:py-32 px-6 md:px-8 border-t-8 border-black bg-white">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-black uppercase mb-6 text-black">
              Fragen?
            </h2>
            <p className="text-lg text-black mb-12 leading-tight">
              Kontaktiere uns gerne unter{' '}
              <a
                href="mailto:info@halle5.at"
                className="underline hover:text-[#FF3100] transition-colors font-bold"
              >
                info@halle5.at
              </a>
            </p>
            <a
              href="mailto:info@halle5.at"
              className="inline-block bg-black hover:bg-[#FF3100] text-white border-4 border-black px-12 py-6 text-lg font-black uppercase transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
            >
              Schreib uns
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}

