export function cn(...classes: Array<string | undefined | null | false>) {
  return classes.filter(Boolean).join(" ");
}
export function money(n: number) {
  return n.toLocaleString(undefined, { style: "currency", currency: "USD" });
}
export function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}
