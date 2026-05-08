/**
 * Открывает Telegram «Поделиться» с URL и текстом (официальный формат t.me/share).
 * @see https://core.telegram.org/widgets/share#custom-url
 */
export function buildTelegramShareUrl(text: string, url: string): string {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(text);
  return `https://t.me/share/url?url=${u}&text=${t}`;
}
