import type { Location } from "./types";

// Curated list of popular Bali destinations.
// NOTE: kept sorted by `region` so MUI Autocomplete's `groupBy` works cleanly.
export const BALI_LOCATIONS: Location[] = ([
  { name: "Ubud",                       region: "Central",    coords: [-8.5069, 115.2625] },
  { name: "Seminyak",                   region: "South",      coords: [-8.6905, 115.1729] },
  { name: "Canggu",                     region: "South",      coords: [-8.6478, 115.1385] },
  { name: "Kuta",                       region: "South",      coords: [-8.7215, 115.1686] },
  { name: "Legian",                     region: "South",      coords: [-8.7050, 115.1700] },
  { name: "Jimbaran",                   region: "South",      coords: [-8.7908, 115.1606] },
  { name: "Uluwatu",                    region: "Bukit",      coords: [-8.8291, 115.0849] },
  { name: "Nusa Dua",                   region: "Bukit",      coords: [-8.8008, 115.2317] },
  { name: "Sanur",                      region: "South-East", coords: [-8.6878, 115.2625] },
  { name: "Denpasar",                   region: "Capital",    coords: [-8.6705, 115.2126] },
  { name: "Tanah Lot",                  region: "West",       coords: [-8.6212, 115.0868] },
  { name: "Tabanan",                    region: "West",       coords: [-8.5419, 115.1265] },
  { name: "Jatiluwih Rice Terraces",    region: "West",       coords: [-8.3697, 115.1376] },
  { name: "Munduk",                     region: "North",      coords: [-8.2625, 115.0866] },
  { name: "Lovina",                     region: "North",      coords: [-8.1582, 115.0259] },
  { name: "Singaraja",                  region: "North",      coords: [-8.1120, 115.0883] },
  { name: "Bedugul",                    region: "Central",    coords: [-8.2750, 115.1670] },
  { name: "Kintamani (Mt. Batur)",      region: "Central",    coords: [-8.2477, 115.3553] },
  { name: "Sidemen",                    region: "East",       coords: [-8.4870, 115.4456] },
  { name: "Amed",                       region: "East",       coords: [-8.3375, 115.6691] },
  { name: "Tulamben",                   region: "East",       coords: [-8.2741, 115.5921] },
  { name: "Candidasa",                  region: "East",       coords: [-8.5106, 115.5697] },
  { name: "Padang Bai",                 region: "East",       coords: [-8.5304, 115.5096] },
  { name: "Nusa Lembongan",             region: "Islands",    coords: [-8.6817, 115.4502] },
  { name: "Nusa Penida",                region: "Islands",    coords: [-8.7274, 115.5444] },
  { name: "Nusa Ceningan",              region: "Islands",    coords: [-8.6977, 115.4634] },
  { name: "Pemuteran",                  region: "North-West", coords: [-8.1378, 114.6558] },
  { name: "Menjangan Island",           region: "North-West", coords: [-8.0972, 114.5125] },
  { name: "Tirta Gangga",               region: "East",       coords: [-8.4117, 115.5867] },
  { name: "Tegallalang Rice Terraces",  region: "Central",    coords: [-8.4316, 115.2779] },
] as Location[]).sort((a, b) =>
  a.region < b.region ? -1 : a.region > b.region ? 1 : 0
);

export const findLoc = (name: string): Location | null =>
  BALI_LOCATIONS.find((l) => l.name === name) ?? null;
