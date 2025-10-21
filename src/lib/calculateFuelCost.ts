export function calculateFuelCost(
  distance: string,
  consumption: string,
  price: string,
): { cost: number; liters: number } | null {
  const d = parseFloat(distance.replace(',', '.'));
  const c = parseFloat(consumption.replace(',', '.'));
  const p = parseFloat(price.replace(',', '.'));

  if (!isNaN(d) && !isNaN(c) && !isNaN(p)) {
    const liters = (d / 100) * c;
    const cost = liters * p;

    return {
      cost: parseFloat(cost.toFixed(2)),
      liters: parseFloat(liters.toFixed(2)),
    };
  }

  return null;
}
