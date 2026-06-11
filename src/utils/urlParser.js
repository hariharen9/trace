export async function parseMapUrlOrCoordinates(searchQuery) {
  let parsedCoords = null;
  let fallbackQuery = searchQuery;

  // 1. Check raw coordinates: e.g. "12.9001, 77.6661"
  const coordMatch = searchQuery.match(/^([-+]?\d{1,2}\.\d+)[,\s]+([-+]?\d{1,3}\.\d+)$/);
  if (coordMatch) {
    return { 
      type: 'coordinate', 
      lat: parseFloat(coordMatch[1]), 
      lng: parseFloat(coordMatch[2]), 
      title: 'Pinned Coordinates', 
      desc: searchQuery 
    };
  }

  // 2. Check Google Maps URLs
  const isGoogleMapsUrl = searchQuery.includes('google.com/maps') || 
                          searchQuery.includes('maps.app.goo.gl') || 
                          searchQuery.includes('goo.gl/maps') || 
                          searchQuery.includes('share.google');
  
  if (isGoogleMapsUrl) {
    let finalUrl = searchQuery;
    let htmlContent = '';

    // Handle short links via CORS proxy
    if (searchQuery.includes('maps.app.goo.gl') || searchQuery.includes('goo.gl/maps') || searchQuery.includes('share.google')) {
      try {
        const proxyUrl = `https://corsproxy.io/?url=${encodeURIComponent(searchQuery)}`;
        const res = await fetch(proxyUrl);
        htmlContent = await res.text();
        finalUrl = res.url || searchQuery;
      } catch (err) {
        console.error('Failed to resolve short link', err);
        return { 
          error: true, 
          title: "Blocked by Browser Security", 
          desc: "Short links cannot be read directly due to CORS. Please paste the full Google Maps URL instead." 
        };
      }
    }

    // Try to extract coordinates from URL or HTML
    const exactMatch = finalUrl.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
    if (exactMatch) {
      parsedCoords = { lat: parseFloat(exactMatch[1]), lng: parseFloat(exactMatch[2]) };
    } else {
      const atMatch = finalUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/) || htmlContent.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (atMatch) {
        parsedCoords = { lat: parseFloat(atMatch[1]), lng: parseFloat(atMatch[2]) };
      } else {
        const metaMatch = htmlContent.match(/center=(-?\d+\.\d+)(?:%2C|,)(-?\d+\.\d+)/) || htmlContent.match(/ll=(-?\d+\.\d+)(?:%2C|,)(-?\d+\.\d+)/);
        if (metaMatch) {
          parsedCoords = { lat: parseFloat(metaMatch[1]), lng: parseFloat(metaMatch[2]) };
        }
      }
    }

    if (parsedCoords) {
      return { 
        type: 'coordinate', 
        lat: parsedCoords.lat, 
        lng: parsedCoords.lng, 
        title: 'Shared Map Location', 
        desc: 'Extracted from Google Maps Link' 
      };
    }

    // If no coordinates, try to extract place name
    const placeMatch = finalUrl.match(/\/place\/([^/]+)/);
    if (placeMatch) {
      fallbackQuery = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
      return {
        type: 'place_query',
        query: fallbackQuery
      };
    } else {
      return { 
        error: true, 
        title: "Could not read location", 
        desc: "No coordinates or place name found in the provided link." 
      };
    }
  }

  // If it's not a google maps URL or coordinate, it's just a text query
  return {
    type: 'text_query',
    query: searchQuery
  };
}

export function isInstantQuery(query) {
  return query.match(/^[-+]?\d{1,2}\.\d+[,\s]+[-+]?\d{1,3}\.\d+$/) || 
         query.includes('google.com/maps') || 
         query.includes('maps.app.goo.gl') || 
         query.includes('share.google') ||
         query.includes('goo.gl/maps');
}

export function isGoogleMapsLink(query) {
    return query.includes('google.com/maps') || 
           query.includes('maps.app.goo.gl') || 
           query.includes('goo.gl/maps') || 
           query.includes('share.google');
}
