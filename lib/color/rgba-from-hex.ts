/** Единый вид цвета на web / iOS / Android (без `#RRGGBBAA`, у которых на нативе часто другая интерпретация). */
export function rgbaFromHex(hex: string, alpha: number): string {
  const h = hex.trim().replace('#', '');
  if (h.length !== 6 || Number.isNaN(parseInt(h, 16))) {
    return hex;
  }
  const n = parseInt(h, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  const a = Math.min(1, Math.max(0, alpha));
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

/** Альфа как байт 0x00–0xFF (как в прежних суффиксах `18`, `AA` …). */
export function rgbaFromHexByte(hex: string, alphaByte: number): string {
  return rgbaFromHex(hex, alphaByte / 255);
}
