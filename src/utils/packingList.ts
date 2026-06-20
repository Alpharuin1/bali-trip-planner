import type { PersonalProfile, Plan } from "../types";
import { addDays, fmtDate, fmtDay, parseISO } from "./date";

export interface PackingListBlock {
  name: string;
  kind: "outfit" | "activity";
  items: string[];
}

export interface PackingListDay {
  dayNumber: number;
  dateLabel: string;
  placeLabel: string;
  outfits: PackingListBlock[];
  activities: PackingListBlock[];
}

export interface PackingListDocument {
  profileName: string;
  tripRange: string;
  days: PackingListDay[];
  combinedItems: string[];
  essentials: string[];
}

export const GENERAL_ESSENTIALS = [
  "Passport & travel documents",
  "Travel insurance details",
  "Phone, charger & power bank",
  "Universal power adapter (Type C / F)",
  "Cash (IDR) & payment cards",
  "Sunscreen (SPF 50+)",
  "Insect repellent",
  "Reusable water bottle",
  "Personal toiletries & medications",
  "Light rain jacket or packable umbrella",
  "Sarong or scarf (temple visits)",
  "Small day bag or crossbody",
];

const normalizeItem = (text: string) => text.trim().toLowerCase();

const uniqueItems = (items: string[]): string[] => {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of items) {
    const trimmed = item.trim();
    if (!trimmed) continue;
    const key = normalizeItem(trimmed);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(trimmed);
  }
  return out;
};

const blockItems = (block: { items: { text: string }[] }) =>
  uniqueItems(block.items.map((i) => i.text));

export function buildPackingList(profile: PersonalProfile, squadPlan: Plan): PackingListDocument {
  const dateBase = parseISO(squadPlan.startDate);
  const tripEnd = parseISO(squadPlan.endDate);
  const tripRange = `${fmtDate(dateBase)} – ${fmtDate(tripEnd)}, ${dateBase.getFullYear()}`;

  const allCollected: string[] = [];
  const days: PackingListDay[] = profile.days.map((day, index) => {
    const date = addDays(dateBase, index);
    const squadDay = squadPlan.days[index];
    const place = squadDay?.place?.trim();
    const endPlace = squadDay?.endPlace?.trim();
    const placeLabel =
      place && endPlace && place !== endPlace
        ? `${place} → ${endPlace}`
        : place || endPlace || "Location TBD";

    const outfits: PackingListBlock[] = [];
    const activities: PackingListBlock[] = [];

    for (const block of day.clothingBlocks) {
      const items = blockItems(block);
      if (items.length === 0) continue;
      allCollected.push(...items);
      const entry: PackingListBlock = {
        name: block.name.trim() || (block.squadActivityRef ? "Activity" : "Outfit"),
        kind: block.squadActivityRef ? "activity" : "outfit",
        items,
      };
      if (block.squadActivityRef) activities.push(entry);
      else outfits.push(entry);
    }

    return {
      dayNumber: index + 1,
      dateLabel: `${fmtDate(date)}, ${fmtDay(date)}`,
      placeLabel,
      outfits,
      activities,
    };
  });

  const combinedItems = uniqueItems(allCollected).sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: "base" })
  );

  return {
    profileName: profile.name,
    tripRange,
    days,
    combinedItems,
    essentials: GENERAL_ESSENTIALS,
  };
}

export function packingItemKey(text: string): string {
  return `item:${text.trim().toLowerCase()}`;
}

export function essentialItemKey(index: number): string {
  return `essential:${index}`;
}

const CHECKS_STORAGE_PREFIX = "btp.packingChecks.v1";

export function loadPackingChecks(profileId: string): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(`${CHECKS_STORAGE_PREFIX}.${profileId}`);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed ? parsed : {};
  } catch {
    return {};
  }
}

export function savePackingChecks(profileId: string, checks: Record<string, boolean>): void {
  localStorage.setItem(`${CHECKS_STORAGE_PREFIX}.${profileId}`, JSON.stringify(checks));
}

export function packingListFilename(profileName: string): string {
  const safe = profileName.trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-") || "packing-list";
  return `${safe}-packing-list.pdf`;
}
