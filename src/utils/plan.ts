import type { Activity, ActivityBlock, Day, Plan } from "../types";
import { addDays, daysBetween, isoDate, today } from "./date";
import { linkLabel, normalizeUrl } from "./links";

const rand = () => Math.random().toString(36).slice(2, 10);
export const newId = (prefix: string) => `${prefix}_${Date.now().toString(36)}_${rand()}`;

export const blankActivity = (): Activity => ({ text: "" });

export const blankBlock = (_n = 1): ActivityBlock => ({
  id: newId("blk"),
  name: "",
  activities: [],
});

/** Backfill ids / shape only — does not rewrite names or links (safe while typing). */
export function ensureActivityBlockIds(blocks: ActivityBlock[]): ActivityBlock[] {
  return (blocks ?? []).map((b) => ({
    ...b,
    id: b.id ?? newId("blk"),
    name: b.name ?? "",
    activities: (b.activities ?? []).map((a) =>
      typeof a === "string" ? { text: a } : { ...a, text: a.text ?? "" }
    ),
  }));
}

function isLegacyLinkBucket(blocks: ActivityBlock[]): boolean {
  return (
    blocks.length === 1 &&
    blocks[0].name.trim().toLowerCase() === "links" &&
    blocks[0].activities.filter((a) => a.text.trim()).length > 1
  );
}

/** Heal ids on read; run full legacy migration only when the old shape is detected. */
export function healActivityBlocks(blocks: ActivityBlock[]): ActivityBlock[] {
  const withIds = ensureActivityBlockIds(blocks);
  if (isLegacyLinkBucket(withIds)) return normalizeDayActivityBlocks(withIds);
  return withIds;
}

/** One activity name + optional link per block; migrate legacy flattened link lists. */
export function normalizeDayActivityBlocks(blocks: ActivityBlock[]): ActivityBlock[] {
  const source = (blocks ?? []).map((b) => ({
    ...b,
    id: b.id ?? newId("blk"),
    name: b.name ?? "",
    activities: (b.activities ?? []).map((a) =>
      typeof a === "string" ? { text: a } : { ...a, text: a.text ?? "" }
    ),
  }));

  if (source.length === 0) return [];

  const isLegacyLinkBucket =
    source.length === 1 &&
    source[0].name.trim().toLowerCase() === "links" &&
    source[0].activities.filter((a) => a.text.trim()).length > 1;

  if (isLegacyLinkBucket) {
    return source[0].activities
      .map((a) => a.text.trim())
      .filter(Boolean)
      .map((url) => ({
        id: newId("blk"),
        name: linkLabel(url),
        activities: [{ text: url }],
      }));
  }

  return source.map((block) => {
    const acts = block.activities.filter((a) => a.text.trim());
    const urls = acts
      .map((a) => ({ raw: a.text.trim(), url: normalizeUrl(a.text) }))
      .filter((a): a is { raw: string; url: string } => Boolean(a.url));
    const nonUrls = acts.filter((a) => !normalizeUrl(a.text));

    // Preserve spaces while typing — only trim for legacy checks / empty fallbacks.
    let name = block.name ?? "";
    if (name.trim().toLowerCase() === "links") name = "";
    if (!name.trim() && nonUrls.length) name = nonUrls[0].text;
    if (!name.trim() && urls.length === 1) name = linkLabel(urls[0].url);

    const link = urls[0]?.url ?? "";
    return {
      ...block,
      name,
      activities: link ? [{ text: link }] : [],
    };
  });
}

export const blankDay = (): Day => ({
  id: newId("day"),
  place: "",
  endPlace: "",
  accommodationPrice: undefined,
  accommodationNights: undefined,
  accommodationName: "",
  accommodationLink: "",
  activityBlocks: [],
});

export const blankPlan = (lengthDays = 5): Plan => {
  const start = today();
  const end = addDays(start, lengthDays - 1);
  return {
    startDate: isoDate(start),
    endDate: isoDate(end),
    days: Array.from({ length: lengthDays }, blankDay),
  };
};

export const reconcileDays = (days: Day[], targetLength: number): Day[] => {
  if (days.length === targetLength) return days;
  if (days.length < targetLength) {
    return [
      ...days,
      ...Array.from({ length: targetLength - days.length }, blankDay),
    ];
  }
  return days.slice(0, targetLength);
};

export const planLength = (plan: Plan): number =>
  Math.max(1, daysBetween(plan.startDate, plan.endDate));

/**
 * Re-runs after a localStorage hydrate to make sure every Day / ActivityBlock
 * has a stable `id`. Older snapshots, if any, won't have ids — backfill them.
 */
export const ensureIds = (plan: Plan): Plan => ({
  ...plan,
  days: plan.days.map((d) => ({
    ...d,
    id: d.id ?? newId("day"),
    accommodationPrice:
      typeof (d as any).accommodationPrice === "number"
        ? (d as any).accommodationPrice
        : undefined,
    accommodationNights:
      typeof (d as any).accommodationNights === "number"
        ? (d as any).accommodationNights
        : undefined,
    accommodationName: (d as any).accommodationName ?? "",
    accommodationLink: (d as any).accommodationLink ?? "",
    accommodationAttachment: (d as any).accommodationAttachment,
    activityBlocks: healActivityBlocks(d.activityBlocks ?? []),
  })),
});

/** Squad day card subtitle from Place → End the day at fields. */
export function formatDayRouteLabel(place: string, endPlace: string): string | null {
  const start = place.trim();
  const end = endPlace.trim();
  if (!start && !end) return null;
  if (start && end && start.toLowerCase() !== end.toLowerCase()) {
    return `${start} -> ${end}`;
  }
  return start || end;
}
