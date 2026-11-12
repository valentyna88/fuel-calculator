type FuelDetailsFieldsProps = {
  consumption: string;
  price: string;
  onConsumptionChange: (value: string) => void;
  onPriceChange: (value: string) => void;
};

export default function FuelDetailsFields({
  consumption,
  price,
  onConsumptionChange,
  onPriceChange,
}: FuelDetailsFieldsProps) {
  return (
    <>
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
          onChange={(e) => onConsumptionChange(e.target.value)}
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
          onChange={(e) => onPriceChange(e.target.value)}
          className="w-full rounded-lg border border-slate-300 p-2 transition focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          autoComplete="off"
        />
      </div>
    </>
  );
}
