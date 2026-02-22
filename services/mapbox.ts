import axios from "axios";

const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_PUBLIC_TOKEN;
const MAPBOX_BASE_URL = "https://api.mapbox.com/search/geocode/v6";

// ── Types ────────────────────────────────────────────────────────────────

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface CitySuggestion {
  id: string;
  name: string;
  fullAddress?: string;
  region?: string;
  country?: string;
}

export interface ReverseGeocodeResult {
  cityName: string;
  countryName?: string;
  countryCode?: string;
}

// ── Module-level cache ───────────────────────────────────────────────────

const forwardGeocodeCache = new Map<string, Coordinates | null>();

// ── Service functions ────────────────────────────────────────────────────

/**
 * Forward geocode a city name to coordinates (single best result).
 * Results are cached at module level.
 */
export async function geocodeCity(city: string): Promise<Coordinates | null> {
  if (forwardGeocodeCache.has(city)) return forwardGeocodeCache.get(city)!;

  try {
    if (!MAPBOX_TOKEN) {
      console.warn("[mapbox] EXPO_PUBLIC_MAPBOX_PUBLIC_TOKEN not set");
      return null;
    }

    const res = await fetch(
      `${MAPBOX_BASE_URL}/forward?q=${encodeURIComponent(city)}&types=place&limit=1&access_token=${MAPBOX_TOKEN}`,
    );

    if (!res.ok) {
      forwardGeocodeCache.set(city, null);
      return null;
    }

    const data = (await res.json()) as {
      features?: { geometry?: { coordinates?: [number, number] } }[];
    };
    const coords = data.features?.[0]?.geometry?.coordinates;

    if (!coords) {
      forwardGeocodeCache.set(city, null);
      return null;
    }

    const result: Coordinates = { lat: coords[1], lng: coords[0] };
    forwardGeocodeCache.set(city, result);
    return result;
  } catch {
    forwardGeocodeCache.set(city, null);
    return null;
  }
}

/**
 * Search cities by text query (multiple suggestions).
 * NOT cached — results change with each keystroke.
 */
export async function searchCities(query: string): Promise<CitySuggestion[]> {
  if (query.trim().length < 2) return [];

  try {
    const res = await axios.get(`${MAPBOX_BASE_URL}/forward`, {
      params: {
        q: query.trim(),
        types: "place",
        limit: "5",
        language: "en",
        access_token: MAPBOX_TOKEN ?? "",
      },
    });

    const features: Array<{
      id: string;
      properties: {
        name: string;
        full_address?: string;
        context?: {
          region?: { name: string };
          country?: { name: string };
        };
      };
    }> = res.data.features ?? [];

    return features.map((f) => ({
      id: f.id,
      name: f.properties.name,
      fullAddress: f.properties.full_address,
      region: f.properties.context?.region?.name,
      country: f.properties.context?.country?.name,
    }));
  } catch {
    return [];
  }
}

/**
 * Reverse geocode coordinates to a city name.
 */
export async function reverseGeocode(
  latitude: number,
  longitude: number,
): Promise<ReverseGeocodeResult | null> {
  try {
    const res = await axios.get(`${MAPBOX_BASE_URL}/reverse`, {
      params: {
        longitude: longitude.toString(),
        latitude: latitude.toString(),
        types: "place",
        limit: "1",
        access_token: MAPBOX_TOKEN ?? "",
      },
    });

    const feature = res.data.features?.[0];
    if (!feature) return null;

    return {
      cityName: feature.properties.name,
      countryName: feature.properties.context?.country?.name,
      countryCode:
        feature.properties.context?.country?.country_code?.toUpperCase(),
    };
  } catch {
    return null;
  }
}
