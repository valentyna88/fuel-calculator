'use client';

import { useEffect, useRef, useState } from 'react';
import { calculateFuelCost } from '@/lib/calculateFuelCost';
import FuelDetailsFields from './FuelDetailsFields';
import CityAutocomplete from './CityAutocomplete';
import type { City } from '@/types/city';

export default function FuelForm() {
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<'distance' | 'route'>('distance');
  const [from, setFrom] = useState('');
  const [fromCity, setFromCity] = useState<City | null>(null);
  const [to, setTo] = useState('');
  const [toCity, setToCity] = useState<City | null>(null);
  const [routeResetKey, setRouteResetKey] = useState(0);
  const [routeDistance, setRouteDistance] = useState<number | null>(null);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [isRouteLoading, setIsRouteLoading] = useState(false);
  const routeRequest = useRef<AbortController | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState('');
  const [consumption, setConsumption] = useState('');
  const [price, setPrice] = useState('');
  const [result, setResult] = useState<{ cost: number; liters: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setResult(null);
    setError(null);
  }, [distance, consumption, price, mode, from, to]);

  useEffect(() => {
    return () => routeRequest.current?.abort();
  }, []);

  const blurActiveInput = () => {
    const activeInput = document.activeElement;
    if (activeInput instanceof HTMLInputElement && containerRef.current?.contains(activeInput)) {
      activeInput.blur();
    }
  };

  const resetRoute = () => {
    routeRequest.current?.abort();
    routeRequest.current = null;
    setRouteDistance(null);
    setRouteError(null);
    setIsRouteLoading(false);
    setResult(null);
    setError(null);
  };

  const handleRouteSearch = async () => {
    blurActiveInput();
    if (routeRequest.current) return;
    setRouteDistance(null);
    setRouteError(null);
    setResult(null);
    setError(null);

    if (!fromCity || !toCity) {
      setRouteError('Please choose both From and To cities from the suggestions.');
      return;
    }

    const controller = new AbortController();
    routeRequest.current = controller;
    setIsRouteLoading(true);

    const params = new URLSearchParams({
      fromLat: String(fromCity.latitude),
      fromLon: String(fromCity.longitude),
      toLat: String(toCity.latitude),
      toLon: String(toCity.longitude),
    });

    try {
      const response = await fetch(`/api/route-distance?${params}`, {
        signal: controller.signal,
        cache: 'no-store',
      });
      const data: unknown = await response.json();
      if (controller.signal.aborted || routeRequest.current !== controller) return;

      if (!response.ok) {
        setRouteError(
          data && typeof data === 'object' && 'error' in data && typeof data.error === 'string'
            ? data.error
            : 'Route search failed. Please try again.',
        );
        return;
      }

      if (
        !data ||
        typeof data !== 'object' ||
        !('distanceKm' in data) ||
        typeof data.distanceKm !== 'number' ||
        !Number.isFinite(data.distanceKm) ||
        data.distanceKm < 0
      ) {
        setRouteError('Route search returned an invalid distance. Please try again.');
        return;
      }

      setRouteDistance(data.distanceKm);
    } catch {
      if (!controller.signal.aborted && routeRequest.current === controller) {
        setRouteError('Route search failed. Check your connection and try again.');
      }
    } finally {
      if (routeRequest.current === controller) {
        routeRequest.current = null;
        setIsRouteLoading(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    blurActiveInput();

    if (mode === 'route' && (routeDistance === null || isRouteLoading)) {
      setError('Find a route before estimating fuel cost.');
      setResult(null);
      return;
    }

    const calculationDistance = mode === 'route' ? String(routeDistance) : distance;
    const res = calculateFuelCost(calculationDistance, consumption, price);

    if (res === null) {
      setError('Please enter valid positive numbers.');
      setResult(null);
      return;
    }

    setError(null);
    setResult(res);
  };

  const handleReset = () => {
    blurActiveInput();
    setDistance('');
    setConsumption('');
    setPrice('');
    setResult(null);
  };

  const handleRouteReset = () => {
    blurActiveInput();
    resetRoute();
    setFrom('');
    setTo('');
    setFromCity(null);
    setToCity(null);
    setConsumption('');
    setPrice('');
    // Remount both autocomplete fields to clear local messages and cancel their searches.
    setRouteResetKey((key) => key + 1);
  };

  const isFormFilled = distance && consumption && price;
  const hasRouteData = Boolean(
    from ||
      to ||
      consumption ||
      price ||
      fromCity ||
      toCity ||
      routeDistance !== null ||
      result ||
      routeError ||
      error ||
      isRouteLoading,
  );

  const calculationFeedback = (
    <>
      {error && (
        <p role="alert" className="text-center text-sm text-red-600">
          {error}
        </p>
      )}

      {result && (
        <div
          key={result.cost}
          className="mt-4 translate-y-2 animate-[fadeIn_0.5s_ease-out_forwards] text-center text-lg font-semibold text-slate-900 opacity-0 transition-all duration-500 ease-out"
        >
          <p>
            Estimated Trip Cost: <span className="text-emerald-600">{result.cost} €</span>
          </p>
          <p className="mt-1 text-base text-slate-600">
            Fuel Needed: <span className="text-indigo-600">{result.liters} L</span>
          </p>
        </div>
      )}
    </>
  );

  return (
    <div
      ref={containerRef}
      className={`w-full max-w-md min-w-0 rounded-2xl bg-white/80 p-6 [overflow-wrap:anywhere] shadow-lg ring-1 ring-slate-300 backdrop-blur-sm ${
        mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}
    >
      <p className="mb-4 text-center text-sm text-slate-600">
        Enter your trip details to calculate fuel expenses
      </p>

      <div className="mb-5 flex rounded-lg bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => setMode('distance')}
          aria-pressed={mode === 'distance'}
          className={`flex-1 cursor-pointer rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            mode === 'distance'
              ? 'bg-indigo-500 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-200'
          }`}
        >
          By Distance
        </button>

        <button
          type="button"
          onClick={() => setMode('route')}
          aria-pressed={mode === 'route'}
          className={`flex-1 cursor-pointer rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            mode === 'route'
              ? 'bg-indigo-500 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-200'
          }`}
        >
          By Route
        </button>
      </div>

      {mode === 'route' ? (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <div className="space-y-4">
              <CityAutocomplete
                key={`from-${routeResetKey}`}
                id="from"
                label="From"
                placeholder="e.g., Tallinn"
                value={from}
                city={fromCity}
                onChange={(value, city) => {
                  resetRoute();
                  setFrom(value);
                  setFromCity(city);
                }}
              />

              <CityAutocomplete
                key={`to-${routeResetKey}`}
                id="to"
                label="To"
                placeholder="e.g., Riga"
                value={to}
                city={toCity}
                onChange={(value, city) => {
                  resetRoute();
                  setTo(value);
                  setToCity(city);
                }}
              />
            </div>
            <p className="text-xs text-slate-500">
              Powered by{' '}
              <a href="https://www.geoapify.com/" className="underline">
                Geoapify
              </a>
              {' · '}
              <a href="https://www.openstreetmap.org/copyright" className="underline">
                © OpenStreetMap contributors
              </a>
            </p>
          </div>

          <button
            type="button"
            onClick={handleRouteSearch}
            disabled={isRouteLoading}
            className="w-full cursor-pointer rounded-lg bg-indigo-500 py-2 font-semibold text-white transition-colors hover:bg-indigo-600 disabled:cursor-wait disabled:opacity-60"
          >
            {isRouteLoading ? 'Finding Route…' : 'Find Route'}
          </button>

          {isRouteLoading && (
            <p role="status" className="text-center text-sm text-slate-600">
              Finding a driving route…
            </p>
          )}

          {routeError && (
            <p role="alert" className="text-center text-sm text-red-600">
              {routeError}
            </p>
          )}

          {routeDistance !== null && (
            <p role="status" className="text-center text-lg font-semibold text-slate-900">
              Driving Distance:{' '}
              <span className="text-indigo-600">
                {routeDistance.toLocaleString('en-GB', { maximumFractionDigits: 2 })} km
              </span>
            </p>
          )}

          <FuelDetailsFields
            consumption={consumption}
            price={price}
            onConsumptionChange={setConsumption}
            onPriceChange={setPrice}
          />

          <div className="flex gap-3">
            <button
              type="submit"
              aria-label="Estimate fuel cost"
              disabled={routeDistance === null || isRouteLoading}
              className="w-full cursor-pointer rounded-lg bg-indigo-500 py-2 font-semibold text-white transition-transform duration-200 enabled:hover:scale-[1.01] enabled:hover:bg-indigo-600 enabled:active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Estimate Cost
            </button>
            {hasRouteData && (
              <button
                type="button"
                onClick={handleRouteReset}
                className="w-full cursor-pointer rounded-lg border border-indigo-200 bg-indigo-50 py-2 font-semibold text-indigo-600 transition-all duration-200 hover:bg-indigo-100 hover:text-indigo-700 active:scale-[0.98]"
              >
                Reset
              </button>
            )}
          </div>

          {routeDistance === null && !isRouteLoading && (
            <p className="text-center text-sm text-slate-600">
              Find a route before estimating fuel cost.
            </p>
          )}

          {calculationFeedback}
        </form>
      ) : !mounted ? (
        <div className="space-y-4" aria-hidden="true">
          <div className="h-10 w-full animate-pulse rounded bg-slate-100" />
          <div className="h-10 w-full animate-pulse rounded bg-slate-100" />
          <div className="h-10 w-full animate-pulse rounded bg-slate-100" />
          <div className="h-10 w-full animate-pulse rounded bg-slate-200" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="distance" className="mb-1 block text-sm font-medium text-slate-700">
              Travel Distance (km)
            </label>
            <input
              id="distance"
              type="text"
              inputMode="decimal"
              enterKeyHint="done"
              onKeyDown={(event) => {
                if (
                  event.nativeEvent.isComposing ||
                  event.nativeEvent.keyCode === 229 ||
                  event.key !== 'Enter'
                ) {
                  return;
                }
                event.preventDefault();
                event.currentTarget.blur();
              }}
              placeholder="e.g., 250"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-2 transition focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              autoComplete="off"
            />
          </div>

          <FuelDetailsFields
            consumption={consumption}
            price={price}
            onConsumptionChange={setConsumption}
            onPriceChange={setPrice}
          />

          <div className="flex gap-3">
            <button
              type="submit"
              aria-label="Estimate fuel cost"
              className="w-full cursor-pointer rounded-lg bg-indigo-500 py-2 font-semibold text-white transition-transform duration-200 hover:scale-[1.01] hover:bg-indigo-600 active:scale-[0.98]"
            >
              Estimate Cost
            </button>
            {isFormFilled && (
              <button
                type="button"
                onClick={handleReset}
                className="w-full cursor-pointer rounded-lg border border-indigo-200 bg-indigo-50 py-2 font-semibold text-indigo-600 transition-all duration-200 hover:bg-indigo-100 hover:text-indigo-700 active:scale-[0.98]"
              >
                Reset
              </button>
            )}
          </div>

          {calculationFeedback}
        </form>
      )}
    </div>
  );
}
