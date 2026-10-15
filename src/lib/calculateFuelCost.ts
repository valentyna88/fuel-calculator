export function calculateFuelCost(
  distance: string,
  consumption: string,
  price: string,
): { cost: number; liters: number } | null {
  const distanceKm = Number(distance.replace(',', '.'));
  const consumptionPer100Km = Number(consumption.replace(',', '.'));
  const pricePerLiter = Number(price.replace(',', '.'));

  if (
    Number.isFinite(distanceKm) &&
    Number.isFinite(consumptionPer100Km) &&
    Number.isFinite(pricePerLiter) &&
    distanceKm > 0 &&
    consumptionPer100Km > 0 &&
    pricePerLiter > 0
  ) {
    const liters = (distanceKm / 100) * consumptionPer100Km;
    const cost = liters * pricePerLiter;

    if (!Number.isFinite(liters) || !Number.isFinite(cost)) {
      return null;
    }

    return {
      cost: parseFloat(cost.toFixed(2)),
      liters: parseFloat(liters.toFixed(2)),
    };
  }

  return null;
}
