import type { Day } from "../types";

function accommodationKey(day: Day): string {
  return (day.accommodationLink ?? "").trim().toLowerCase();
}

function accommodationTotalPrice(day: Day): number | undefined {
  const v = day.accommodationPrice;
  return typeof v === "number" && Number.isFinite(v) && v > 0 ? v : undefined;
}

/**
 * Sum accommodation totals without double-counting multi-night stays or
 * consecutive days at the same place with the same booking.
 */
export function computeTotalAccommodation(days: Day[]): number {
  let total = 0;
  let i = 0;

  while (i < days.length) {
    const day = days[i];
    const price = accommodationTotalPrice(day);

    if (price == null) {
      i += 1;
      continue;
    }

    total += price;

    const nights = day.accommodationNights;
    if (typeof nights === "number" && Number.isFinite(nights) && nights > 1) {
      i += nights;
      continue;
    }

    const key = accommodationKey(day);
    if (key) {
      let j = i + 1;
      while (j < days.length && accommodationKey(days[j]) === key) {
        j += 1;
      }
      i = j;
      continue;
    }

    i += 1;
  }

  return total;
}

export function dayHasAccommodationContent(day: Day): boolean {
  return Boolean(
    day.accommodationLink?.trim() ||
      day.accommodationAttachment ||
      accommodationTotalPrice(day) != null ||
      (typeof day.accommodationNights === "number" &&
        Number.isFinite(day.accommodationNights) &&
        day.accommodationNights > 0)
  );
}
