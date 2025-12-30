'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { GoogleMap, LoadScript, Marker, Polyline, InfoWindow } from '@react-google-maps/api';
import exhibitionDataRaw from '@/data/exhibition-map-data.json';

const exhibitionData = exhibitionDataRaw as Record<string, { 
  title: string; 
  institution: string; 
  date: number; 
  imageUrl: string | null; 
  count: number;
  shows?: Array<{
    title: string;
    institution: string;
    date: number;
    imageUrl: string | null;
  }>;
}>;

const containerStyle = {
  width: '100%',
  height: '100%'
};

// Coordinates
const LOCATIONS = [
  { name: 'Atelier Dornbirn', lat: 47.4196, lng: 9.7345 }, // Spinnergasse 1, 6850 Dornbirn
  { name: 'Atelier Wien', lat: 48.1638, lng: 16.4124 }, // Medwedweg 3, 1110 Wien
  { name: 'c.art, Prantl & Boch', lat: 47.4135, lng: 9.7425 }, // Dr. Anton Schneider Straße 28b, 6850 Dornbirn
];

const EXHIBITION_LOCATIONS = [
  { name: 'Dornbirn, AT', lat: 47.4125, lng: 9.7417 },
  { name: 'Lustenau, AT', lat: 47.4258, lng: 9.6594 },
  { name: 'Arbon, CH', lat: 47.5136, lng: 9.4294 },
  { name: 'Hohenems, AT', lat: 47.3633, lng: 9.6892 },
  { name: 'Bludenz, AT', lat: 47.1537, lng: 9.8227 },
  { name: 'Biel, CH', lat: 47.1368, lng: 7.2468 },
  { name: 'Wien, AT', lat: 48.2082, lng: 16.3738 },
  { name: 'Weinfelden, CH', lat: 47.5667, lng: 9.1000 },
  { name: 'Zagreb, HR', lat: 45.8150, lng: 15.9819 },
  { name: 'Athens, GR', lat: 37.9838, lng: 23.7275 },
  { name: 'Bozen, IT', lat: 46.4983, lng: 11.3548 },
  { name: 'Feldkirch, AT', lat: 47.2372, lng: 9.5980 },
  { name: 'Berlin, DE', lat: 52.5200, lng: 13.4050 },
  { name: 'Bern, CH', lat: 46.9480, lng: 7.4474 },
  { name: 'Innsbruck, AT', lat: 47.2692, lng: 11.4041 },
  { name: 'St. Pölten, AT', lat: 48.2044, lng: 15.6229 },
  { name: 'Kempten, DE', lat: 47.7286, lng: 10.3158 },
  { name: 'Zürich, CH', lat: 47.3769, lng: 8.5417 },
  { name: 'Chemnitz, DE', lat: 50.8278, lng: 12.9214 },
  { name: 'Dublin, IE', lat: 53.3498, lng: -6.2603 },
  { name: 'Bregenz, AT', lat: 47.5031, lng: 9.7471 },
  { name: 'Warth, CH', lat: 47.5833, lng: 8.8500 },
  { name: 'Frauenfeld, CH', lat: 47.5536, lng: 8.8989 },
  { name: 'Basel, CH', lat: 47.5596, lng: 7.5886 },
  { name: 'Wels, AT', lat: 48.1575, lng: 14.0289 },
  { name: 'St. Gallen, CH', lat: 47.4245, lng: 9.3767 },
  { name: 'Schnepfau, AT', lat: 47.3500, lng: 9.9500 },
  { name: 'Milan, IT', lat: 45.4642, lng: 9.1900 },
  { name: 'Innichen, IT', lat: 46.7333, lng: 12.2833 },
  { name: 'Antwerp, BE', lat: 51.2194, lng: 4.4025 },
  { name: 'Eschlikon, CH', lat: 47.4667, lng: 8.9667 },
  { name: 'Vaduz, LI', lat: 47.1410, lng: 9.5209 },
  { name: 'Bangkok, TH', lat: 13.7563, lng: 100.5018 },
  { name: 'Turin, IT', lat: 45.0703, lng: 7.6869 },
  { name: 'Cologne, DE', lat: 50.9375, lng: 6.9603 },
  { name: 'Leipzig, DE', lat: 51.3397, lng: 12.3731 },
  { name: 'Luxemburg, LU', lat: 49.6116, lng: 6.1319 },
  { name: 'Havana, CU', lat: 23.1136, lng: -82.3666 },
  { name: 'Safiental, CH', lat: 46.6794, lng: 9.3136 },
  { name: 'Lech, AT', lat: 47.2122, lng: 10.1436 },
  { name: 'Vienna, AT', lat: 48.2082, lng: 16.3738 },
  { name: 'Athen, GR', lat: 37.9838, lng: 23.7275 },
  { name: 'Zurich, CH', lat: 47.3769, lng: 8.5417 },
];

const ENRICHED_EXHIBITION_LOCATIONS = EXHIBITION_LOCATIONS.map(loc => {
  const city = loc.name.split(',')[0].trim();
  // Try to find data for the city
  // Some cities might have different names in Sanity vs here (e.g. English vs German)
  // But let's try direct match first.
  const data = exhibitionData[city];
  return { ...loc, ...data };
});

const CENTER = {
  lat: 47.8, 
  lng: 13.0
};

// Styles
const LIGHT_STYLE = [
  {
    "stylers": [
      { "saturation": -100 },
      { "visibility": "simplified" }
    ]
  },
  {
    "elementType": "geometry",
    "stylers": [{ "color": "#f5f5f5" }]
  },
  {
    "elementType": "labels.icon",
    "stylers": [{ "visibility": "off" }]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#616161" }]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [{ "color": "#f5f5f5" }]
  },
  {
    "featureType": "administrative.land_parcel",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#bdbdbd" }]
  },
  {
    "featureType": "poi",
    "elementType": "geometry",
    "stylers": [{ "color": "#eeeeee" }]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#757575" }]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [{ "color": "#e5e5e5" }]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#9e9e9e" }]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [{ "color": "#ffffff" }]
  },
  {
    "featureType": "road.arterial",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#757575" }]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [{ "color": "#dadada" }]
  },
  {
    "featureType": "road.highway",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#616161" }]
  },
  {
    "featureType": "road.local",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#9e9e9e" }]
  },
  {
    "featureType": "transit.line",
    "elementType": "geometry",
    "stylers": [{ "color": "#e5e5e5" }]
  },
  {
    "featureType": "transit.station",
    "elementType": "geometry",
    "stylers": [{ "color": "#eeeeee" }]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [{ "color": "#c9c9c9" }]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#9e9e9e" }]
  }
];

const DARK_STYLE = [
  {
    "stylers": [
      { "saturation": -100 },
      { "visibility": "simplified" }
    ]
  },
  {
    "elementType": "geometry",
    "stylers": [{ "color": "#212121" }]
  },
  {
    "elementType": "labels.icon",
    "stylers": [{ "visibility": "off" }]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#757575" }]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [{ "color": "#212121" }]
  },
  {
    "featureType": "administrative",
    "elementType": "geometry",
    "stylers": [{ "color": "#757575" }]
  },
  {
    "featureType": "administrative.country",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#9e9e9e" }]
  },
  {
    "featureType": "administrative.land_parcel",
    "stylers": [{ "visibility": "off" }]
  },
  {
    "featureType": "administrative.locality",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#bdbdbd" }]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#757575" }]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [{ "color": "#181818" }]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#616161" }]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.stroke",
    "stylers": [{ "color": "#1b1b1b" }]
  },
  {
    "featureType": "road",
    "elementType": "geometry.fill",
    "stylers": [{ "color": "#2c2c2c" }]
  },
  {
    "featureType": "road",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#8a8a8a" }]
  },
  {
    "featureType": "road.arterial",
    "elementType": "geometry",
    "stylers": [{ "color": "#373737" }]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [{ "color": "#3c3c3c" }]
  },
  {
    "featureType": "road.highway.controlled_access",
    "elementType": "geometry",
    "stylers": [{ "color": "#4e4e4e" }]
  },
  {
    "featureType": "road.local",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#616161" }]
  },
  {
    "featureType": "transit",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#757575" }]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [{ "color": "#000000" }]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#3d3d3d" }]
  }
];

export default function StudioMap() {
  const [isDark, setIsDark] = useState(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);

  useEffect(() => {
    // Function to check theme
    const checkTheme = () => {
      const isDarkMode = document.body.classList.contains('theme-black') || 
                         document.body.classList.contains('theme-darkGrey') ||
                         document.body.classList.contains('theme-blue');
      setIsDark(isDarkMode);
    };

    // Initial check
    checkTheme();

    // Observer for body class changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  const mapOptions = useMemo(() => ({
    styles: isDark ? DARK_STYLE : LIGHT_STYLE,
    disableDefaultUI: true,
    zoomControl: true,
    scrollwheel: true,
    gestureHandling: 'greedy',
  }), [isDark]);

  // Polyline path
  const path = LOCATIONS.map(loc => ({ lat: loc.lat, lng: loc.lng }));

  const onLoad = React.useCallback(function callback(map: google.maps.Map) {
    const bounds = new window.google.maps.LatLngBounds();
    LOCATIONS.forEach(loc => {
      bounds.extend({ lat: loc.lat, lng: loc.lng });
    });
    ENRICHED_EXHIBITION_LOCATIONS.forEach(loc => {
      bounds.extend({ lat: loc.lat, lng: loc.lng });
    });
    map.fitBounds(bounds);
    setMap(map);
  }, []);

  // Custom marker icon (simple circle)
  const markerIcon = {
    path: "M 0, 0 m -5, 0 a 5,5 0 1,0 10,0 a 5,5 0 1,0 -10,0",
    fillColor: isDark ? "#ffffff" : "#000000",
    fillOpacity: 1,
    strokeColor: isDark ? "#000000" : "#ffffff",
    strokeWeight: 2,
    scale: 2.5, // Bigger circle for studios
  };

  // Exhibition marker icon
  const getExhibitionMarkerIcon = (isHovered: boolean) => ({
    path: "M 0, 0 m -4, 0 a 4,4 0 1,0 8,0 a 4,4 0 1,0 -8,0",
    fillColor: isHovered ? "#ff6600" : (isDark ? "#aaaaaa" : "#555555"),
    fillOpacity: isHovered ? 1 : 0.8,
    strokeColor: isHovered ? "#ffffff" : (isDark ? "#555555" : "#aaaaaa"),
    strokeWeight: 1,
    scale: 1.5,
  });

  // Explode locations based on count
  const explodedLocations = useMemo(() => {
    const exploded: any[] = [];
    ENRICHED_EXHIBITION_LOCATIONS.forEach(loc => {
      const count = loc.count || 1;
      const shows = loc.shows || [];

      if (count === 1) {
        exploded.push(loc);
      } else {
        // Grid layout logic
        const cols = Math.ceil(Math.sqrt(count));
        const rows = Math.ceil(count / cols);
        const spacing = 0.002; // Adjust spacing as needed

        for (let i = 0; i < count; i++) {
          const row = Math.floor(i / cols);
          const col = i % cols;

          // Center the grid
          const latOffset = (row - (rows - 1) / 2) * spacing;
          const lngOffset = ((col - (cols - 1) / 2) * spacing) / Math.cos(loc.lat * Math.PI / 180);

          // Get specific show data if available
          const showData = shows[i] || {};

          exploded.push({
            ...loc,
            ...showData, // Overwrite with specific show data
            lat: loc.lat - latOffset, // Invert lat offset to match visual grid (top to bottom)
            lng: loc.lng + lngOffset,
            originalIndex: i
          });
        }
      }
    });
    return exploded;
  }, []);

  return (
    <div className="w-full h-full bg-white dark:bg-white">
      <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={CENTER}
          zoom={2}
          options={mapOptions}
          onLoad={onLoad}
        >
          {LOCATIONS.map((loc, idx) => (
            <Marker
              key={`studio-${idx}`}
              position={{ lat: loc.lat, lng: loc.lng }}
              title={loc.name}
              icon={markerIcon}
              zIndex={2000} // Studios always on top
            />
          ))}
          
          {explodedLocations.map((loc, idx) => (
            <Marker
              key={`exhibition-${idx}`}
              position={{ lat: loc.lat, lng: loc.lng }}
              icon={getExhibitionMarkerIcon(selectedLocation?.name === loc.name && selectedLocation?.lat === loc.lat && selectedLocation?.title === loc.title)}
              onMouseOver={() => setSelectedLocation(loc)}
              onMouseOut={() => setSelectedLocation(null)}
              zIndex={selectedLocation?.name === loc.name && selectedLocation?.title === loc.title ? 1000 : 1}
            />
          ))}

          {selectedLocation && selectedLocation.title && (
            <InfoWindow
              position={{ lat: selectedLocation.lat, lng: selectedLocation.lng }}
              onCloseClick={() => setSelectedLocation(null)}
              options={{
                pixelOffset: new window.google.maps.Size(0, -10),
                disableAutoPan: true,
              }}
            >
              <div className={`${selectedLocation.imageUrl ? 'max-w-[400px]' : 'max-w-[200px]'} p-1`}>
                {selectedLocation.imageUrl && (
                  <div className="mb-2 w-full h-[300px] relative overflow-hidden bg-white">
                    <img 
                      src={selectedLocation.imageUrl} 
                      alt={selectedLocation.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <h3 className="font-bold text-sm mb-1 text-black">{selectedLocation.title}</h3>
                <p className="text-xs text-black mb-0.5">{selectedLocation.institution}</p>
                <p className="text-xs text-black">{selectedLocation.date} • {selectedLocation.name}</p>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScript>
    </div>
  );
}
