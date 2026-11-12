import { NextRequest, NextResponse } from 'next/server';
import type { City } from '@/types/city';

function respond(body: object, status = 200) {
  return NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
}

export async function GET(request: NextRequest) {
  const text = request.nextUrl.searchParams.get('text')?.trim() ?? '';
  if (text.length < 3 || text.length > 120) {
    return respond({ error: 'Enter between 3 and 120 characters.' }, 400);
  }

  const apiKey = process.env.GEOAPIFY_API_KEY?.trim();
  if (!apiKey) {
    return respond({ error: 'City search is not configured yet. Please try again later.' }, 503);
  }

  const url = new URL('https://api.geoapify.com/v1/geocode/autocomplete');
  url.search = new URLSearchParams({
    text,
    type: 'city',
    format: 'json',
    lang: 'en',
    limit: '5',
    apiKey,
  }).toString();

  try {
    const response = await fetch(url, {
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) {
      return respond(
        {
          error:
            response.status === 429
              ? 'Too many searches. Please try again shortly.'
              : 'City search is temporarily unavailable. Please try again.',
        },
        response.status === 429 ? 429 : 502,
      );
    }

    const data: unknown = await response.json();
    if (!data || typeof data !== 'object' || !('results' in data) || !Array.isArray(data.results)) {
      return respond({ error: 'City search returned an invalid response. Please try again.' }, 502);
    }

    const cities: City[] = [];
    for (const raw of data.results as unknown[]) {
      if (!raw || typeof raw !== 'object') continue;
      const { place_id, city, name, country, formatted, lat, lon, result_type } = raw as Record<
        string,
        unknown
      >;
      if (
        result_type !== 'city' ||
        typeof place_id !== 'string' ||
        typeof country !== 'string' ||
        typeof lat !== 'number' ||
        typeof lon !== 'number' ||
        !Number.isFinite(lat) ||
        !Number.isFinite(lon) ||
        Math.abs(lat) > 90 ||
        Math.abs(lon) > 180
      )
        continue;

      const title = typeof city === 'string' ? city : name;
      if (typeof title !== 'string' || cities.some((candidate) => candidate.id === place_id))
        continue;
      cities.push({
        id: place_id,
        label: typeof formatted === 'string' ? formatted : `${title}, ${country}`,
        latitude: lat,
        longitude: lon,
      });
      if (cities.length === 5) break;
    }

    return respond({ cities });
  } catch {
    // Never expose provider responses or URLs containing the server API key.
    return respond({ error: 'City search is temporarily unavailable. Please try again.' }, 502);
  }
}
