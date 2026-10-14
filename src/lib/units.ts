export type Unit = "C" | "F";

export function formatTemp(celsius: number, unit: Unit): string {
  const value = unit === "C" ? celsius : (celsius * 9) / 5 + 32;
  return `${Math.round(value)}°`;
}