export function normalizeUrl(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function linkLabel(url: string): string {
  try {
    const parsed = new URL(url);
    const path =
      parsed.pathname && parsed.pathname !== "/" ? parsed.pathname.replace(/\/$/, "") : "";
    const host = parsed.hostname.replace(/^www\./, "");
    return path ? `${host}${path}` : host;
  } catch {
    return url;
  }
}
