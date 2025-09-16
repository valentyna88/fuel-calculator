export function calculateFuelCost(
  distance: string,
  consumption: string,
  price: string,
): number | null {
  const d = parseFloat(distance.replace(',', '.'));
  const c = parseFloat(consumption.replace(',', '.'));
  const p = parseFloat(price.replace(',', '.'));

  if (!isNaN(d) && !isNaN(c) && !isNaN(p)) {
    const total = (d / 100) * c * p;
    return parseFloat(total.toFixed(2));
  }

  return null;
}
