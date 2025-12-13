export type Exhibition = {
  _id: string;
  title: string;
  year?: string | number;
  exhibitionType?: string;
  venue?: {
    _id?: string;
    name?: string;
    city?: string;
    state?: string;
    country?: string;
  };
};

// Helper function to format exhibition entry
export function formatExhibitionEntry(exhibition: Exhibition) {
  const year = exhibition.year || ''
  const title = exhibition.title || ''
  
  // Handle venue information
  let location = ''
  if (exhibition.venue) {
    let venueName = exhibition.venue.name

    // If name is null, try to extract from venue ID (fallback for legacy data)
    if (!venueName && exhibition.venue._id) {
      const venueId = exhibition.venue._id
      if (venueId.startsWith('venue-')) {
        venueName = venueId
          .replace('venue-', '')
          .replace(/-/g, ' ')
          .split(' ')
          .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')
      }
    }

    const city = exhibition.venue.city
    const country = exhibition.venue.country
    const state = exhibition.venue.state
    
    // Build location string based on available data
    const locationParts = []
    if (venueName && venueName !== 'Unknown') {
      locationParts.push(venueName)
    }
    if (city && city !== 'Unknown') {
      locationParts.push(city)
    }
    if (state) {
      locationParts.push(state)
    }
    if (country) {
      locationParts.push(country)
    }
    
    location = locationParts.length > 0 ? locationParts.join(', ') : ''
  }
  
  // Format the complete entry: Year, Title, Venue, City, State, Country
  const parts = [year, title].filter(Boolean)
  if (location) {
    return `${parts.join(', ')}, ${location}`
  } else {
    return parts.join(', ')
  }
}

export function formatExhibitionDetails(exhibition: Exhibition) {
  const title = exhibition.title || ''
  
  // Handle venue information
  let location = ''
  if (exhibition.venue) {
    let venueName = exhibition.venue.name

    // If name is null, try to extract from venue ID (fallback for legacy data)
    if (!venueName && exhibition.venue._id) {
      const venueId = exhibition.venue._id
      if (venueId.startsWith('venue-')) {
        venueName = venueId
          .replace('venue-', '')
          .replace(/-/g, ' ')
          .split(' ')
          .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')
      }
    }

    const city = exhibition.venue.city
    const country = exhibition.venue.country
    const state = exhibition.venue.state
    
    // Build location string based on available data
    const locationParts = []
    if (venueName && venueName !== 'Unknown') {
      locationParts.push(venueName)
    }
    if (city && city !== 'Unknown') {
      locationParts.push(city)
    }
    if (state) {
      locationParts.push(state)
    }
    if (country) {
      locationParts.push(country)
    }
    
    location = locationParts.length > 0 ? locationParts.join(', ') : ''
  }
  
  if (location) {
    return `${title}, ${location}`
  } else {
    return title
  }
}
