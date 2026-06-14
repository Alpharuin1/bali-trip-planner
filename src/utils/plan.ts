import type { Activity, ActivityBlock, Day, Plan } from "../types";
import { addDays, daysBetween, isoDate, today } from "./date";

const rand = () => Math.random().toString(36).slice(2, 10);
export const newId = (prefix: string) => `${prefix}_${Date.now().toString(36)}_${rand()}`;

export const blankActivity = (): Activity => ({ text: "" });

export const blankBlock = (n = 1): ActivityBlock => ({
  id: newId("blk"),
  name: `Activity Block ${n}`,
  activities: [blankActivity()],
});

export const blankDay = (): Day => ({
  id: newId("day"),
  place: "",
  endPlace: "",
  accommodationPrice: undefined,
  activityBlocks: [blankBlock(1)],
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
    activityBlocks: (d.activityBlocks ?? []).map((b) => ({
      ...b,
      id: b.id ?? newId("blk"),
      activities: (b.activities ?? []).map((a) =>
        // Old shape was a bare string; coerce that into Activity for safety.
        typeof a === "string" ? { text: a } : a
      ),
    })),
  })),
});
