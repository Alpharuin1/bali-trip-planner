export const fmtDate = (d: Date): string =>
  d.toLocaleDateString(undefined, { month: "short", day: "numeric" });

export const fmtDay = (d: Date): string =>
  d.toLocaleDateString(undefined, { weekday: "long" });

export const isoDate = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
};

export const parseISO = (s: string): Date => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export const daysBetween = (a: string, b: string): number => {
  const ms = parseISO(b).getTime() - parseISO(a).getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24)) + 1;
};

export const today = (): Date => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

export const addDays = (d: Date, n: number): Date => {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
};
