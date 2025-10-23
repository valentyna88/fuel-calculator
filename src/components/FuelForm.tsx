'use client';

import { useEffect, useState } from 'react';
import { calculateFuelCost } from '@/lib/calculateFuelCost';

export default function FuelForm() {
  const [mounted, setMounted] = useState(false);
  const [distance, setDistance] = useState('');
  const [consumption, setConsumption] = useState('');
  const [price, setPrice] = useState('');
  const [result, setResult] = useState<{ cost: number; liters: number } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setResult(null);
  }, [distance, consumption, price]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!distance || !consumption || !price) return;

    const res = calculateFuelCost(distance, consumption, price);
    setResult(res);
  };

  return (
    <div
      className={`w-full max-w-md rounded-2xl bg-white/80 p-6 shadow-lg ring-1 ring-slate-300 backdrop-blur-sm ${
        mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}
    >
      <p className="mb-4 text-center text-sm text-slate-600">
        Enter your trip details to calculate fuel expenses
      </p>

      {!mounted ? (
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

          <div>
            <label htmlFor="consumption" className="mb-1 block text-sm font-medium text-slate-700">
              Vehicle Consumption (L/100 km)
            </label>
            <input
              id="consumption"
              type="text"
              inputMode="decimal"
              placeholder="e.g., 7.2"
              value={consumption}
              onChange={(e) => setConsumption(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-2 transition focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              autoComplete="off"
            />
          </div>

          <div>
            <label htmlFor="price" className="mb-1 block text-sm font-medium text-slate-700">
              Fuel Price (€/L)
            </label>
            <input
              id="price"
              type="text"
              inputMode="decimal"
              placeholder="e.g., 1.89"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-2 transition focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              autoComplete="off"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              aria-label="Estimate fuel cost"
              className="w-full rounded-lg bg-indigo-500 py-2 font-semibold text-white transition-transform duration-200 hover:scale-[1.02] hover:bg-indigo-600 active:scale-[0.98]"
            >
              Estimate Cost
            </button>
            <button
              type="button"
              onClick={() => {
                setDistance('');
                setConsumption('');
                setPrice('');
                setResult(null);
              }}
              className="flex-1 rounded-lg border border-indigo-200 bg-white py-2 font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Reset
            </button>
          </div>
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
