'use client';

import React, { useState, useEffect, useRef } from 'react';
import { client } from "@/sanity/client";
import BrutalistMap from "@/components/BrutalistMap";
import { PortableText } from '@portabletext/react';
import { urlFor } from '@/sanity/image';
import { useJsApiLoader, Autocomplete } from '@react-google-maps/api';

const LIBRARIES: ("places")[] = ["places"];
const HALLE5_COORDS = { lat: 47.405949, lng: 9.744962 };
const HALLE5_HUB = { stop_id: '1200586', name: 'Dornbirn, Sägerbrücke/Campus V', lat: 47.40607153, lng: 9.74233705 };

export default function VisitPage() {
    const [info, setInfo] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'welcome' | 'route'>('welcome');

    // Map & Routing State
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
        libraries: LIBRARIES,
        language: 'de',
    });

    const [origin, setOrigin] = useState("");
    const [originCoords, setOriginCoords] = useState<google.maps.LatLngLiteral | null>(null);
    const [travelMode, setTravelMode] = useState<google.maps.TravelMode | null>(null);
    const [directionsResponse, setDirectionsResponse] = useState<google.maps.DirectionsResult | null>(null);
    const [gtfsOptions, setGtfsOptions] = useState<any[] | null>(null);
    const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
    const [isRouting, setIsRouting] = useState(false);
    const routeRequestIdRef = useRef(0);
    
    // State for the directions panel element (passed to map)
    const [directionsPanelElement, setDirectionsPanelElement] = useState<HTMLDivElement | null>(null);

    const [timeOption, setTimeOption] = useState<'now' | 'depart_at' | 'arrive_by'>('now');
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');

    useEffect(() => {
        const now = new Date();
        setSelectedDate(now.toISOString().split('T')[0]);
        setSelectedTime(now.toTimeString().slice(0, 5));
    }, []);

    useEffect(() => {
        // Fetch both halle5Info (for general info) and visitPage (for the panel)
        Promise.all([
            client.fetch(`*[_type == "halle5Info"][0]`),
            client.fetch(`*[_type == "visitPage"][0]{ visitPanel }`)
        ]).then(([infoData, visitData]) => {
            setInfo({ ...infoData, visitPanel: visitData?.visitPanel });
        });
    }, []);

    // Set default travel mode once API is loaded
    useEffect(() => {
        if (isLoaded && !travelMode && typeof google !== 'undefined') {
            setTravelMode(google.maps.TravelMode.BICYCLING);
        }
    }, [isLoaded, travelMode]);

    const panelData = info?.visitPanel || {};

    const onPlaceChanged = () => {
        if (autocomplete !== null) {
            const place = autocomplete.getPlace();
            if (place.formatted_address) {
                setOrigin(place.formatted_address);
            }
            if (place.geometry && place.geometry.location) {
                setOriginCoords({ lat: place.geometry.location.lat(), lng: place.geometry.location.lng() });
            }
        }
    };

    const calculateRoute = async (modeOverride?: google.maps.TravelMode) => {
        if (!origin) return;
        
        const currentMode = modeOverride || travelMode;
        const requestId = ++routeRequestIdRef.current;
        setIsRouting(true);
        setGtfsOptions(null);
        setDirectionsResponse(null);

        try {
            let currentOriginCoords = originCoords;
            
            // Geocode if needed
            if (!currentOriginCoords && typeof google !== 'undefined' && google.maps) {
                try {
                    const geocoder = new google.maps.Geocoder();
                    const geo = await new Promise((resolve) => geocoder.geocode({ address: origin }, (results, status) => resolve({ results, status })));
                    // @ts-ignore
                    const { results, status } = geo;
                    if (status === 'OK' && results && results[0] && results[0].geometry) {
                        const coords = { lat: results[0].geometry.location.lat(), lng: results[0].geometry.location.lng() };
                        setOriginCoords(coords);
                        currentOriginCoords = coords;
                    }
                } catch (e) {
                    console.warn("Geocoding failed", e);
                }
            }

            if (requestId !== routeRequestIdRef.current) return;

            // VMOBIL / GTFS Check for Transit
            if (currentMode === google.maps.TravelMode.TRANSIT && currentOriginCoords) {
                try {
                    const destCoords = { lat: HALLE5_HUB.lat, lng: HALLE5_HUB.lng };
                    const apiResp = await fetch('/api/transport/vmobil/route', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ originCoords: currentOriginCoords, destinationCoords: destCoords }),
                    });
                    
                    if (requestId !== routeRequestIdRef.current) return;

                    const payload = await apiResp.json();
                    if (payload && payload.source === 'gtfs' && payload.options && payload.options.length > 0) {
                        setGtfsOptions(payload.options);
                        setIsRouting(false);
                        return;
                    }
                } catch (err) {
                    console.warn('VMOBIL GTFS route query failed; falling back to Google', err);
                }
            }

            // Google Directions Fallback
            if (typeof google !== 'undefined') {
                const directionsService = new google.maps.DirectionsService();
                const destForRequest = (currentMode === google.maps.TravelMode.TRANSIT) ? { lat: HALLE5_HUB.lat, lng: HALLE5_HUB.lng } : HALLE5_COORDS;
                
                const request: google.maps.DirectionsRequest = {
                    origin: origin,
                    destination: destForRequest,
                    travelMode: (currentMode ?? google.maps.TravelMode.BICYCLING) as google.maps.TravelMode,
                };

                // Handle Time Options
                let transitOptions: google.maps.TransitOptions = {};
                if (timeOption !== 'now' && selectedDate && selectedTime) {
                    const d = new Date(`${selectedDate}T${selectedTime}`);
                    if (timeOption === 'depart_at') {
                        transitOptions.departureTime = d;
                    } else if (timeOption === 'arrive_by') {
                        transitOptions.arrivalTime = d;
                    }
                } else {
                    transitOptions.departureTime = new Date();
                }

                if (currentMode === google.maps.TravelMode.TRANSIT) {
                    (request as any).transitOptions = transitOptions;
                } else if (currentMode === google.maps.TravelMode.DRIVING && timeOption === 'depart_at' && transitOptions.departureTime) {
                    (request as any).drivingOptions = {
                        departureTime: transitOptions.departureTime
                    };
                }

                const results = await directionsService.route(request);
                
                if (requestId === routeRequestIdRef.current) {
                    if (directionsPanelElement) directionsPanelElement.innerHTML = '';
                    setDirectionsResponse(results);
                }
            }
        } catch (error) {
            console.error("Directions request failed", error);
        } finally {
            if (requestId === routeRequestIdRef.current) {
                setIsRouting(false);
            }
        }
    };

    const clearRoute = () => {
        setOrigin("");
        setDirectionsResponse(null);
        setGtfsOptions(null);
        setOriginCoords(null);
    };

    // Helper to visualize a GTFS option on the map
    const visualizeGtfsOption = async (option: any) => {
        if (typeof google === 'undefined') return;
        try {
            setTravelMode(google.maps.TravelMode.TRANSIT);
            const ds = new google.maps.DirectionsService();
            const request = {
                origin: { lat: option.origin_stop_lat, lng: option.origin_stop_lon },
                destination: { lat: option.dest_stop_lat || HALLE5_COORDS.lat, lng: option.dest_stop_lon || HALLE5_COORDS.lng },
                travelMode: google.maps.TravelMode.TRANSIT,
                transitOptions: { departureTime: new Date() }
            };
            const results = await ds.route(request as any);
            setDirectionsResponse(results);
        } catch (e) {
            console.error("GTFS visualization failed", e);
        }
    };

    return (
        <main className="flex flex-col md:flex-row h-[calc(100vh-80px)] bg-white overflow-hidden">
            {/* Left/Top Panel: Content */}
            <div className="w-full md:w-1/2 lg:w-[600px] flex flex-col border-b-4 md:border-b-0 md:border-r-4 border-black bg-white z-10 h-1/2 md:h-full">
                {/* Navigation Tabs */}
                <div className="flex border-b-4 border-black shrink-0">
                    <button 
                        onClick={() => setActiveTab('welcome')}
                        className={`flex-1 py-4 font-black uppercase text-lg md:text-xl hover:bg-[#FF3100] hover:text-white transition-colors ${activeTab === 'welcome' ? 'bg-[#FF3100] text-white' : 'bg-white text-black'}`}
                    >
                        Willkommen
                    </button>
                    <button 
                        onClick={() => setActiveTab('route')}
                        className={`flex-1 py-4 font-black uppercase text-lg md:text-xl hover:bg-[#FF3100] hover:text-white transition-colors ${activeTab === 'route' ? 'bg-[#FF3100] text-white' : 'bg-white text-black border-l-4 border-black'}`}
                    >
                        Route Planen
                    </button>
                </div>

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10">
                    {activeTab === 'welcome' && (
                        <div className="space-y-8">
                            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none text-black">
                                {panelData.title || 'Besuchen'}
                            </h1>
                            
                            <div className="text-lg md:text-xl font-bold leading-tight uppercase space-y-6 text-black">
                                {panelData.text ? (
                                    <PortableText value={panelData.text} />
                                ) : (
                                    <>
                                        <p>Du findest Halle 5 im Herzen Dornbirns. Zugang ist über unserer Künstler:innen möglich oder besuche eine Veranstaltung des Designforums oder der CampusVäre und schau vorbei.</p>
                                        <p>Wir freuen uns, dich in Halle 5 willkommen zu heißen.</p>
                                    </>
                                )}
                            </div>

                            {panelData.images && panelData.images.length > 0 && (
                                <div className="w-full border-4 border-black">
                                    <img 
                                        src={urlFor(panelData.images[0]).url()} 
                                        alt={panelData.images[0].alt || ''} 
                                        className="w-full h-auto object-cover" 
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'route' && (
                        <div className="space-y-6">
                            {isLoaded && (
                                <div className="border-4 border-black p-4 bg-white space-y-4">
                                    {/* Origin Input */}
                                    <div className="relative">
                                        <Autocomplete
                                            onLoad={(auto) => setAutocomplete(auto)}
                                            onPlaceChanged={onPlaceChanged}
                                        >
                                            <input
                                                type="text"
                                                placeholder="Startpunkt eingeben..."
                                                value={origin}
                                                onChange={(e) => setOrigin(e.target.value)}
                                                className="w-full h-12 bg-gray-100 border-2 border-black px-4 font-bold uppercase text-sm text-black focus:bg-white focus:outline-none transition-all placeholder:text-black/50"
                                            />
                                        </Autocomplete>
                                        {origin && (
                                            <button
                                                onClick={clearRoute}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 font-black text-black hover:text-[#FF3100]"
                                            >
                                                [X]
                                            </button>
                                        )}
                                    </div>

                                    {/* Transport Modes */}
                                    <div>
                                        <div className="flex flex-wrap gap-2">
                                            {[
                                                { mode: google.maps.TravelMode.BICYCLING, label: '🚲 Fahrrad' },
                                                { mode: google.maps.TravelMode.WALKING, label: '🚶 zu Fuss' },
                                                { mode: google.maps.TravelMode.TRANSIT, label: '🚌 Öffis' },
                                                { mode: google.maps.TravelMode.DRIVING, label: '🚗 Auto' }
                                            ].map((opt) => (
                                                <button
                                                    key={opt.mode}
                                                    onClick={() => { 
                                                        setTravelMode(opt.mode); 
                                                        setGtfsOptions(null); 
                                                        setDirectionsResponse(null);
                                                        if (origin) calculateRoute(opt.mode);
                                                    }}
                                                    className={`flex-1 min-w-[80px] px-2 py-2 border-2 border-black font-black uppercase text-xs transition-colors ${travelMode === opt.mode ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'}`}
                                                >
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Time Options */}
                                    <div>
                                        <div className="flex gap-2 mb-2">
                                            <button 
                                                onClick={() => setTimeOption('now')}
                                                className={`flex-1 py-2 text-xs font-bold uppercase border-2 border-black transition-colors ${timeOption === 'now' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'}`}
                                            >
                                                Jetzt
                                            </button>
                                            <button 
                                                onClick={() => setTimeOption('depart_at')}
                                                className={`flex-1 py-2 text-xs font-bold uppercase border-2 border-black transition-colors ${timeOption === 'depart_at' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'}`}
                                            >
                                                Abfahrt
                                            </button>
                                            <button 
                                                onClick={() => setTimeOption('arrive_by')}
                                                className={`flex-1 py-2 text-xs font-bold uppercase border-2 border-black transition-colors ${timeOption === 'arrive_by' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'}`}
                                            >
                                                Ankunft
                                            </button>
                                        </div>

                                        {timeOption !== 'now' && (
                                            <div className="flex gap-2">
                                                <input 
                                                    type="date" 
                                                    value={selectedDate}
                                                    onChange={(e) => setSelectedDate(e.target.value)}
                                                    className="flex-1 h-10 border-2 border-black px-2 font-bold uppercase text-sm bg-white text-black"
                                                />
                                                <input 
                                                    type="time" 
                                                    value={selectedTime}
                                                    onChange={(e) => setSelectedTime(e.target.value)}
                                                    className="flex-1 h-10 border-2 border-black px-2 font-bold uppercase text-sm bg-white text-black"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {!directionsResponse && !gtfsOptions && (
                                        <button
                                            onClick={() => calculateRoute()}
                                            disabled={!origin || isRouting}
                                            className="w-full h-12 bg-[#FF3100] text-white font-black uppercase text-base hover:bg-black transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                                        >
                                            {isRouting ? 'Lade...' : 'Anreise Planen'}
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* GTFS Options List */}
                            {gtfsOptions && (
                                <div className="mt-6 space-y-2">
                                    <h4 className="font-black uppercase text-lg">Öffi Vorschläge:</h4>
                                    {gtfsOptions.map((o, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => visualizeGtfsOption(o)}
                                            className="w-full text-left border-2 border-black p-3 hover:bg-gray-100 transition-colors text-black"
                                        >
                                            <div className="font-bold">{o.origin_stop_name} → {o.dest_stop_name}</div>
                                            <div className="text-sm">Abfahrt: {o.departure_time} — Ankunft: {o.arrival_time}</div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Directions Panel Container */}
                            <div 
                                id="directions-panel-content" 
                                ref={setDirectionsPanelElement}
                                className={`mt-6 directions-panel ${directionsResponse ? 'block' : 'hidden'}`}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Right/Bottom Panel: Map */}
            <div className="flex-1 relative h-1/2 md:h-full bg-gray-100">
                <BrutalistMap 
                    directionsResponse={directionsResponse}
                    originCoords={originCoords}
                    travelMode={travelMode}
                    directionsPanelElement={directionsPanelElement}
                />
            </div>

            <style jsx global>{`
                .directions-panel { color: black !important; }
                .directions-panel * { color: black !important; }
                .directions-panel .adp-list { border: none !important; }
                .directions-panel .adp-step { 
                    background: white !important; 
                    color: black !important; 
                    border-bottom: 2px solid black !important;
                    padding: 12px 0 !important;
                    font-weight: 800 !important;
                    text-transform: uppercase !important;
                    cursor: pointer;
                    font-size: 0.85rem !important;
                }
                .directions-panel .adp-step:hover { background: #f0f0f0 !important; }
                .directions-panel .adp-substep { padding-left: 20px !important; border: none !important; }
                .directions-panel .adp-text { color: black !important; }
                .directions-panel .adp-summary { 
                    font-size: 1.25rem !important; 
                    margin-bottom: 24px !important; 
                    border-bottom: 4px solid black !important;
                    padding-bottom: 12px !important;
                    color: black !important;
                    font-weight: 900 !important;
                    text-transform: uppercase;
                }
                .directions-panel .adp-hub-note {
                    font-size: 0.95rem !important;
                    font-weight: 800 !important;
                    color: #FF3100 !important;
                    margin-bottom: 8px !important;
                    text-transform: none !important;
                }
                .directions-panel .adp-loading {
                    font-size: 0.95rem !important;
                    color: #333333 !important;
                    margin-bottom: 12px !important;
                    font-weight: 700 !important;
                }
                .directions-panel .adp-legal { display: none; }
                .directions-panel table, .directions-panel tr, .directions-panel td {
                    background: transparent !important;
                }
                .custom-scrollbar::-webkit-scrollbar { width: 10px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: black; }
                .custom-scrollbar::-webkit-scrollbar-thumb { 
                    background: #FF3100; 
                    border: 2px solid black; 
                }
            `}</style>
        </main>
    );
}
