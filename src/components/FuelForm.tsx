'use client';

import { useEffect, useState } from 'react';
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const res = calculateFuelCost(distance, consumption, price);

    if (res === null) {
      setError('Please enter valid positive numbers.');
      setResult(null);
      return;
    }

    setError(null);
    setResult(res);
  };

  const handleReset = () => {
    setDistance('');
    setConsumption('');
    setPrice('');
    setResult(null);
  };

  const isFormFilled = distance && consumption && price;

  return (
    <div
      className={`w-full max-w-md rounded-2xl bg-white/80 p-6 shadow-lg ring-1 ring-slate-300 backdrop-blur-sm ${
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
        <div className="space-y-5">
          <CityAutocomplete
            id="from"
            label="From"
            placeholder="e.g., Tallinn"
            value={from}
            city={fromCity}
            onChange={(value, city) => {
              setFrom(value);
              setFromCity(city);
            }}
          />

          <CityAutocomplete
            id="to"
            label="To"
            placeholder="e.g., Riga"
            value={to}
            city={toCity}
            onChange={(value, city) => {
              setTo(value);
              setToCity(city);
            }}
          />

          <FuelDetailsFields
            consumption={consumption}
            price={price}
            onConsumptionChange={setConsumption}
            onPriceChange={setPrice}
          />
        </div>
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
        </form>
      )}
    </div>
  );
}
