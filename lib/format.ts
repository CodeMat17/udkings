const naira = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

/** All amounts are integers in naira. No floats anywhere. */
export function formatNaira(amount: number): string {
  return naira.format(Math.round(amount));
}

export function formatPieces(n: number): string {
  return `${n} ${n === 1 ? "piece" : "pieces"}`;
}

export function formatDate(value: string | number): string {
  const d = typeof value === "number" ? new Date(value) : new Date(`${value}T00:00:00`);
  if (Number.isNaN(d.getTime())) return String(value);
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}
