'use client';

import { useState, useEffect } from "react";

export default function ArtistsList({ initialArtists }: { initialArtists: any[] }) {
    const [filteredArtists, setFilteredArtists] = useState<any[]>(initialArtists);
    const [activeYear, setActiveYear] = useState<string>('all');
    const [activeType, setActiveType] = useState<string>('all');
    const [activeFocus, setActiveFocus] = useState<string>('all');

    const years = ['2022', '2023', '2024', '2025', '2026'];
    const types = [
        { label: 'Temporär', value: 'temporar' },
        { label: 'Stationär', value: 'stationar' },
        { label: 'Praktikum', value: 'praktikum' }
    ];
    const focuses = [
        { label: 'Workshops', value: 'workshops' },
        { label: 'Mentoring', value: 'mentoring' },
        { label: 'Kunstproduktion', value: 'produktion' },
        { label: 'Pinguin', value: 'pinguin' },
    ];

    useEffect(() => {
        let filtered = initialArtists;

        if (activeYear !== 'all') {
            filtered = filtered.filter(a => a.years?.includes(activeYear));
        }

        if (activeType !== 'all') {
            filtered = filtered.filter(a => a.artistType?.includes(activeType));
        }

        if (activeFocus !== 'all') {
            // normalize production values: some docs use 'produktion', others 'kunstproduktion'
            if (activeFocus === 'produktion') {
                filtered = filtered.filter(a => a.focus?.includes('produktion') || a.focus?.includes('kunstproduktion'));
            } else {
                filtered = filtered.filter(a => a.focus?.includes(activeFocus));
            }
        }

        setFilteredArtists(filtered);
    }, [activeYear, activeType, activeFocus, initialArtists]);

    const handleYearChange = (year: string) => {
        setActiveYear(year);
        if (year !== 'all') setActiveType('all');
    };

    const handleTypeChange = (type: string) => {
        setActiveType(type);
        if (type !== 'all') setActiveYear('all');
    };

    const handleFocusChange = (focus: string) => {
        setActiveFocus(focus);
        if (focus !== 'all') {
            setActiveYear('all');
            setActiveType('all');
        }
    };

    return (
        <div className="max-w-7xl mx-auto">
            {/* Filters */}
            <header className="mb-6 md:mb-10">

                <div className="flex flex-col md:flex-row gap-6 md:gap-12 mt-2 md:mt-6">
                    {/* Year Filter */}
                    <div className="flex-1">
                        <h2 className="text-xl md:text-2xl font-black uppercase mb-1 md:mb-2 text-[#FF3100]">Jahr</h2>
                        <div className="flex flex-wrap gap-2">
                            <FilterButton
                                label="Alle"
                                active={activeYear === 'all'}
                                onClick={() => handleYearChange('all')}
                            />
                            {years.map(y => (
                                <FilterButton
                                    key={y}
                                    label={y}
                                    active={activeYear === y}
                                    onClick={() => handleYearChange(y)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Type Filter */}
                    <div className="flex-1">
                        <h2 className="text-xl md:text-2xl font-black uppercase mb-1 md:mb-2 text-[#FF3100]">Status</h2>
                        <div className="flex flex-wrap gap-2">
                            <FilterButton
                                label="Alle"
                                active={activeType === 'all'}
                                onClick={() => handleTypeChange('all')}
                            />
                            {types.map(t => (
                                <FilterButton
                                    key={t.value}
                                    label={t.label}
                                    active={activeType === t.value}
                                    onClick={() => handleTypeChange(t.value)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Offers / Angebote Filter */}
                    <div className="flex-1">
                        <h2 className="text-xl md:text-2xl font-black uppercase mb-1 md:mb-2 text-[#FF3100]">Angebote</h2>
                        <div className="flex flex-wrap gap-2">
                            <FilterButton
                                label="Alle"
                                active={activeFocus === 'all'}
                                onClick={() => handleFocusChange('all')}
                            />
                            {focuses.map(f => (
                                <FilterButton
                                    key={f.value}
                                    label={f.label}
                                    active={activeFocus === f.value}
                                    onClick={() => handleFocusChange(f.value)}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </header>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredArtists.map((artist) => (
                    <ArtistCard key={artist._id} artist={artist} />
                ))}
                {filteredArtists.length === 0 && (
                    <div className="col-span-full py-20 border-4 border-dashed border-white text-center">
                        <p className="text-3xl font-bold uppercase italic">Keine Einträge gefunden</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function FilterButton({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`
        inline-block text-xs font-black uppercase border-2 px-2 py-0.5 transition-all
        ${active ? 'bg-white text-black' : 'bg-transparent text-white border-white'}
      `}
        >
            {label}
        </button>
    );
}

function ArtistCard({ artist }: { artist: any }) {
    return (
        <div className="bg-white text-black border-4 border-black p-4 flex flex-col justify-between hover:bg-[#FF3100] hover:text-white transition-colors group cursor-pointer shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div>
                <div className="mb-2">
                    {artist.artistType?.map((t: string) => (
                        <span key={t} className="text-xs font-black uppercase border-2 border-black px-2 py-0.5 mr-1 bg-black text-white group-hover:bg-white group-hover:text-black">
                            {t === 'temporar' ? 'Temporär' : t === 'stationar' ? 'Stationär' : t.charAt(0).toUpperCase() + t.slice(1)}
                        </span>
                    ))}
                </div>
                <h3 className="text-3xl font-black uppercase leading-none tracking-tighter mb-4 italic">
                    {artist.vorname} {artist.name}
                </h3>
            </div>

            {/* Angebote / Focus badges */}
            {artist.focus && artist.focus.length > 0 && (
                <div className="-mt-2">
                    {artist.focus.map((f: string) => (
                        <span
                            key={f}
                            className="inline-block text-xs font-bold uppercase border-2 border-black px-2 py-0.5 mr-1 mb-1 bg-white text-black group-hover:bg-black group-hover:text-white"
                        >
                            {f === 'workshops' ? 'Workshops' : f === 'mentoring' ? 'Mentoring' : (f === 'produktion' || f === 'kunstproduktion') ? 'Kunstproduktion' : f === 'shop' ? 'Shop' : f === 'pinguin' ? 'Pinguin' : f}
                        </span>
                    ))}
                </div>
            )}

            {artist.website && (
                <a
                    href={artist.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="mt-4 border-4 border-current px-4 py-2 text-sm font-black uppercase text-center hover:bg-black hover:text-white transition-all inline-block"
                >
                    Website ↗
                </a>
            )}
        </div>
    );
}
