import type { Location } from "../types";
import { findLoc } from "../locations";

export interface DayLocationInsights {
  locationName: string;
  region: string;
  coords: [number, number] | null;
  weather: {
    season: string;
    temperature: string;
    rainfall: string;
    humidity: string;
  };
  vibes: string;
  outfitTips: string[];
}

const MONTH_CLIMATE: Record<
  number,
  { season: string; temperature: string; rainfall: string; humidity: string }
> = {
  0: { season: "Wet season", temperature: "26–30°C", rainfall: "Heavy showers", humidity: "Very humid" },
  1: { season: "Wet season", temperature: "26–30°C", rainfall: "Heavy showers", humidity: "Very humid" },
  2: { season: "Wet season", temperature: "27–31°C", rainfall: "Moderate–heavy", humidity: "Humid" },
  3: { season: "Shoulder season", temperature: "27–31°C", rainfall: "Moderate", humidity: "Humid" },
  4: { season: "Dry season", temperature: "27–31°C", rainfall: "Low", humidity: "Moderate" },
  5: { season: "Dry season", temperature: "26–30°C", rainfall: "Low", humidity: "Moderate" },
  6: { season: "Dry season", temperature: "26–29°C", rainfall: "Very low", humidity: "Moderate" },
  7: { season: "Dry season", temperature: "26–29°C", rainfall: "Very low", humidity: "Moderate" },
  8: { season: "Dry season", temperature: "27–30°C", rainfall: "Low", humidity: "Moderate" },
  9: { season: "Dry season", temperature: "27–31°C", rainfall: "Low", humidity: "Moderate" },
  10: { season: "Shoulder season", temperature: "27–31°C", rainfall: "Rising", humidity: "Humid" },
  11: { season: "Wet season", temperature: "26–30°C", rainfall: "Heavy showers", humidity: "Very humid" },
};

const LOCATION_DETAILS: Record<
  string,
  { vibes: string; outfitTips: string[] }
> = {
  Ubud: {
    vibes: "Lush jungle, temples, rice terraces, and slow café culture.",
    outfitTips: [
      "Sarong or scarf for temple visits",
      "Breathable fabrics for humid walks",
      "Sturdy sandals or trainers for uneven paths",
    ],
  },
  Seminyak: {
    vibes: "Upscale beach town — sunset bars, boutiques, and dining.",
    outfitTips: [
      "Smart-casual for restaurants and beach clubs",
      "Light cover-up for evening breeze",
      "Sun hat and sunglasses for daytime",
    ],
  },
  Canggu: {
    vibes: "Surf, scooters, cafés, and a laid-back creative crowd.",
    outfitTips: [
      "Swimwear plus a quick-dry cover-up",
      "Casual layers for scooter rides",
      "Sand-friendly footwear",
    ],
  },
  Kuta: {
    vibes: "Busy beach strip — surf, shopping, and nightlife.",
    outfitTips: [
      "Casual beachwear by day",
      "Light evening outfit if going out",
      "Sunscreen-friendly open shoulders",
    ],
  },
  Uluwatu: {
    vibes: "Clifftop temples, surf breaks, and golden-hour views.",
    outfitTips: [
      "Modest clothing for cliff temples",
      "Secure shoes for limestone paths",
      "Wind-friendly layers at sunset",
    ],
  },
  "Nusa Penida": {
    vibes: "Rugged island — dramatic cliffs, snorkelling, and boat days.",
    outfitTips: [
      "Swimwear and a dry bag essentials",
      "Grip sandals for cliff viewpoints",
      "Motion-sickness friendly loose layers for the boat",
    ],
  },
  "Kintamani (Mt. Batur)": {
    vibes: "Cooler highlands, volcano views, and early-morning treks.",
    outfitTips: [
      "Light jacket or hoodie for dawn chill",
      "Long pants for trek comfort",
      "Closed-toe shoes with grip",
    ],
  },
};

const DEFAULT_DETAILS = {
  vibes: "Tropical Bali — mix of sun, humidity, and relaxed island style.",
  outfitTips: [
    "Light, breathable cotton or linen",
    "Sun protection: hat, SPF, sunglasses",
    "Easy layers for A/C indoors vs heat outside",
  ],
};

export function resolveDayLocation(place: string, endPlace: string): Location | null {
  const primary = place.trim();
  const end = endPlace.trim();
  return findLoc(primary) ?? findLoc(end) ?? null;
}

export function getDayLocationInsights(
  date: Date,
  place: string,
  endPlace: string,
  dayIndex = 0
): DayLocationInsights {
  const primaryPlace = place.trim();
  const end = endPlace.trim();
  const loc = resolveDayLocation(place, endPlace);
  const locationName = primaryPlace || end || `Day ${dayIndex + 1}`;
  const lookupKey = loc?.name ?? primaryPlace ?? end;
  const region = loc?.region ?? (primaryPlace || end ? "Bali" : "Squad plan");
  const details = LOCATION_DETAILS[lookupKey] ?? DEFAULT_DETAILS;
  const weather = MONTH_CLIMATE[date.getMonth()] ?? MONTH_CLIMATE[5];

  return {
    locationName,
    region,
    coords: loc?.coords ?? null,
    weather,
    vibes: details.vibes,
    outfitTips: details.outfitTips,
  };
}
