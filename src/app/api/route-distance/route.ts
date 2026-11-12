import { NextRequest, NextResponse } from 'next/server';

function respond(body: object, status = 200) {
  return NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
}

function readCoordinate(params: URLSearchParams, name: string, maximum: number): number | null {
  const text = params.get(name)?.trim();
  if (!text || !/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(text)) return null;

  const value = Number(text);
  return Number.isFinite(value) && Math.abs(value) <= maximum ? value : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export async function GET(request: NextRequest) {
  // Use latitude/longitude from the selected City objects, not their labels.
  const params = request.nextUrl.searchParams;
  const fromLat = readCoordinate(params, 'fromLat', 90);
  const fromLon = readCoordinate(params, 'fromLon', 180);
  const toLat = readCoordinate(params, 'toLat', 90);
  const toLon = readCoordinate(params, 'toLon', 180);

  if (fromLat === null || fromLon === null || toLat === null || toLon === null) {
    return respond({ error: 'Provide valid fromLat, fromLon, toLat and toLon coordinates.' }, 400);
  }

  const apiKey = process.env.GEOAPIFY_API_KEY?.trim();
  if (!apiKey) {
    return respond({ error: 'Route search is not configured yet. Please try again later.' }, 503);
  }

  const url = new URL('https://api.geoapify.com/v1/routing');
  url.search = new URLSearchParams({
    waypoints: `${fromLat},${fromLon}|${toLat},${toLon}`,
    mode: 'drive',
    units: 'metric',
    format: 'json',
    apiKey,
  }).toString();

  const signal = AbortSignal.timeout(10000);

  try {
    const response = await fetch(url, { cache: 'no-store', signal });

    if (response.status === 429) {
      return respond({ error: 'Too many route requests. Please try again shortly.' }, 429);
    }

    if (!response.ok) {
      if (response.status === 400) {
        // Geoapify reports unreachable points and disconnected roads as HTTP 400.
        const failure: unknown = await response.json();
        const message =
          isRecord(failure) && typeof failure.message === 'string' ? failure.message : '';
        if (/no path could be found|no suitable edges near location/i.test(message)) {
          return respond({ error: 'No driving route was found between these locations.' }, 422);
        }
        if (/too long distance between locations/i.test(message)) {
          return respond(
            { error: 'These locations are too far apart for this routing service.' },
            422,
          );
        }
      }
      return respond({ error: 'Route search is temporarily unavailable. Please try again.' }, 502);
    }

    const data: unknown = await response.json();
    if (!isRecord(data) || !Array.isArray(data.results)) {
      return respond(
        { error: 'Route search returned an invalid response. Please try again.' },
        502,
      );
    }
    if (data.results.length === 0) {
      return respond({ error: 'No driving route was found between these locations.' }, 422);
    }

    const route: unknown = data.results[0];
    if (
      !isRecord(route) ||
      typeof route.distance !== 'number' ||
      !Number.isFinite(route.distance) ||
      route.distance < 0 ||
      typeof route.distance_units !== 'string' ||
      route.distance_units.toLowerCase() !== 'meters'
    ) {
      return respond(
        { error: 'Route search returned an invalid response. Please try again.' },
        502,
      );
    }

    return respond({ distanceKm: route.distance / 1000 });
  } catch {
    // Provider URLs, error details and the API key must never reach the client.
    if (signal.aborted) {
      return respond({ error: 'Route search timed out. Please try again.' }, 504);
    }
    return respond({ error: 'Route search is temporarily unavailable. Please try again.' }, 502);
  }
}
