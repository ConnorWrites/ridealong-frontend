const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY;

export interface Coordinates {
  lng: number;
  lat: number;
}

export async function geocode(place: string): Promise<Coordinates> {
  const url = `https://api.maptiler.com/geocoding/${encodeURIComponent(place)}.json?key=${MAPTILER_KEY}&bbox=16,-35,33,-22&language=en`;
  const res = await fetch(url);
  const data = await res.json();

  if (!data.features || data.features.length === 0) {
    throw new Error(`Could not geocode: ${place}`);
  }

  const [lng, lat] = data.features[0].geometry.coordinates;
  return { lng, lat };
}

export interface RouteGeoJSON {
  type: "Feature";
  geometry: {
    type: "LineString";
    coordinates: number[][];
  };
}

export async function getRoute(
  origin: Coordinates,
  destination: Coordinates
): Promise<RouteGeoJSON> {
  const url = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`;
  const res = await fetch(url);
  const data = await res.json();

  if (!data.routes || data.routes.length === 0) {
    throw new Error("Could not find a route between these locations");
  }

  return {
    type: "Feature",
    geometry: data.routes[0].geometry,
  };
}