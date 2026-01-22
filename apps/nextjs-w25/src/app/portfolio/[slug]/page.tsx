import { client } from '@/sanity/client';
import { PortableText } from '@portabletext/react';
import imageUrlBuilder from '@sanity/image-url';
import { notFound } from 'next/navigation';
import Link from 'next/link';

// Move to a separate file if needed structure grows
const builder = imageUrlBuilder(client);
function urlFor(source: any) {
    return builder.image(source);
}

export const revalidate = 60; // Revalidate every minute

export async function generateMetadata({ params }: { params: { slug: string } }) {
    const portfolio = await client.fetch(`*[_type == "portfolio" && slug.current == $slug][0]{ title }`, { slug: params.slug });
    if (!portfolio) return { title: 'Not Found' };
    return { title: portfolio.title };
}

export default async function PortfolioPage({ params }: { params: { slug: string } }) {
    const portfolio = await client.fetch(`
    *[_type == "portfolio" && slug.current == $slug][0]{
      ...,
      projects[]{
        ...,
        artwork->{
          title,
          year,
          mainImage,
          technique,
          dimensions
        }
      }
    }
  `, { slug: params.slug });

    if (!portfolio) {
        notFound();
    }

    return (
        <>
            <style dangerouslySetInnerHTML={{
                __html: `
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;500;700&family=Lato:wght@300;400&family=Azeret+Mono:wght@300;400&display=swap');
        
        /* PRINT SPECIFIC STYLES */
        @media print {
          @page { size: A4 portrait; margin: 0; }
          body { background: white; padding: 0; margin: 0; }
          .page { margin: 0 !important; box-shadow: none !important; border: none !important; width: 210mm !important; height: 297mm !important; page-break-after: always; }
          .no-print { display: none !important; }
          
          /* Hide site header/nav if not handled by global CSS */
          nav, header, footer { display: none !important; }
          
          /* Ensure backgrounds print */
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }

        .font-lato { font-family: 'Lato', sans-serif; }
        .font-poppins { font-family: 'Poppins', sans-serif; }
        .font-azeret { font-family: 'Azeret Mono', monospace; }
        
        .page {
           width: 210mm;
           min-height: 297mm;
           background-color: #fff;
           margin: 20px auto;
           position: relative;
           padding: 25mm 20mm;
           box-shadow: 0 10px 30px rgba(0,0,0,0.1);
           display: flex;
           flex-direction: column;
        }

        .bw-filter { filter: grayscale(100%) contrast(105%); }
      `}} />

            <div className="min-h-screen bg-[#f0f0f0] flex flex-col items-center py-8 font-lato text-[#1a1a1a]">

                {/* Floating Print Button */}
                <div className="no-print fixed bottom-8 right-8 z-[200]">
                    <button
                        onClick={() => typeof window !== 'undefined' && window.print()}
                        // Using simple button for now, can hydrate with client component if needed
                        className="bg-black text-white px-6 py-4 rounded-full font-azeret text-xs shadow-xl hover:scale-105 transition-transform flex items-center gap-2 cursor-pointer"
                        type="button"
                    >
                        {/* Using simple text or svg icon */}
                        <span>SAVE AS PDF (A4)</span>
                    </button>
                </div>

                {/* PAGE 1: COVER */}
                <div className="page" id="page1">
                    <div className="mt-[150px]">
                        <p className="font-azeret text-[10px] uppercase text-[#666] mb-2">Portfolio Submission // {portfolio.submissionYear}</p>
                        <h1 className="font-poppins text-[52px] font-light leading-[1.1] uppercase mb-5">
                            {portfolio.coverTitle?.split(' ').slice(0, 2).join(' ')}<br />
                            {portfolio.coverTitle?.split(' ').slice(2).join(' ')}
                        </h1>
                        <p className="italic text-[18px] text-[#555] max-w-[500px] font-light">
                            {portfolio.coverSubtitle}
                        </p>
                    </div>

                    <div className="mt-auto border-t border-black pt-10">
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="font-azeret text-[10px] uppercase text-[#666]">Candidate:</p>
                                <p className="text-24px font-medium">{portfolio.candidateName}</p>
                                <p className="font-azeret text-[10px] uppercase text-[#666] mt-1">{portfolio.candidateDegrees}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-azeret text-[10px] uppercase text-[#666]">Target Degree:</p>
                                <p className="text-[16px]">{portfolio.targetDegree}</p>
                                <p className="font-azeret text-[10px] uppercase text-[#666] mt-1">{portfolio.university}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* PAGE 2: ARTIST STATEMENT */}
                {portfolio.artistStatement && (
                    <div className="page" id="page2">
                        <h2 className="font-poppins text-[24px] font-medium mb-[30px] border-b-2 border-black pb-2 w-full uppercase">Artist Statement</h2>
                        <div className="max-w-[600px] text-[14px] leading-[1.6] font-light">
                            <PortableText value={portfolio.artistStatement} components={{
                                block: {
                                    normal: ({ children }) => <p className="mb-4">{children}</p>,
                                    h4: ({ children }) => <p className="text-[18px] font-medium mb-[30px] leading-[1.4]">{children}</p>
                                }
                            }} />
                        </div>
                    </div>
                )}

                {/* PAGE 3: CV */}
                {portfolio.cvSections && (
                    <div className="page" id="page3">
                        <h2 className="font-poppins text-[24px] font-medium mb-[30px] border-b-2 border-black pb-2 w-full uppercase">Curriculum Vitae</h2>

                        {portfolio.cvSections.map((section: any, idx: number) => (
                            <div key={idx} className="mb-10 last:mb-0">
                                <h3 className="font-azeret text-[10px] uppercase text-black mb-[15px]">{section.title}</h3>
                                {section.entries?.map((entry: any, eIdx: number) => (
                                    <div key={eIdx} className="grid grid-cols-[100px_1fr] gap-5 mb-5 border-b border-[#eee] pb-[15px] last:border-0">
                                        <div className="font-azeret text-[11px] font-bold">{entry.year}</div>
                                        <div className="text-[14px] font-light">
                                            <strong>{entry.title}</strong><br />
                                            {entry.description}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                )}

                {/* PROJECTS */}
                {portfolio.projects?.map((project: any, idx: number) => (
                    <div className="page" id={`project-${idx}`} key={idx}>
                        <h2 className="font-poppins text-[24px] font-medium mb-[30px] border-b-2 border-black pb-2 w-full uppercase">{project.categoryTitle}</h2>
                        <div className="project-section mb-[60px]">
                            <h3 className="font-poppins text-[38px] font-light uppercase leading-[1.1] mb-2 text-[28px]">{project.customTitle || project.artwork?.title}</h3>
                            <p className="font-azeret text-[10px] uppercase text-[#666] mt-[5px]">{project.iterationText}</p>

                            <div className={`w-full aspect-[16/10] bg-[#f8f9fa] border border-[#eee] my-5 overflow-hidden relative ${project.useBWFilter ? 'bw-filter' : ''}`}>
                                {project.artwork?.mainImage && (
                                    <img
                                        src={urlFor(project.artwork.mainImage).width(1200).url()}
                                        alt={project.artwork.title}
                                        className="w-full h-full object-cover"
                                    />
                                )}
                            </div>

                            <p className="text-[14px] font-light leading-[1.6]">
                                {project.description}
                            </p>

                            <div className="border border-black p-[15px] mt-[15px] text-[12px] bg-[#fafafa]">
                                <span className="font-azeret text-[9px] font-bold block mb-[5px] text-[#888]">{project.matrixLabel}</span>
                                <p className="font-azeret text-[10px] uppercase text-[#666]">{project.matrixContent}</p>
                            </div>
                        </div>

                        {idx === portfolio.projects.length - 1 && (
                            <div className="mt-auto border-t border-[#eee] pt-5">
                                <p className="font-azeret text-[10px] uppercase text-center text-[#666]">{portfolio.candidateName} // PHD Submission // w26.vercel.app</p>
                            </div>
                        )}
                    </div>
                ))}

            </div>

            {/* Hydration fix script for inline styles */}
            <script dangerouslySetInnerHTML={{
                __html: `
        // Simple script to handle print button in case hydration fails
        document.querySelector('.btn-print')?.addEventListener('click', () => window.print());
      `}} />
        </>
    );
}
