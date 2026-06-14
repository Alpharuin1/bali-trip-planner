export type LatLng = [number, number];

export interface Location {
  name: string;
  region: string;
  coords: LatLng;
}

/**
 * One row in an activity block. `time` is optional and stored as
 * a 24h "HH:mm" string so it round-trips trivially with localStorage / JSON.
 */
export interface Activity {
  text: string;
  time?: string;
}

export interface ActivityBlock {
  id: string; // stable id for drag-and-drop reordering
  name: string;
  activities: Activity[];
}

export interface Day {
  id: string; // stable id for drag-and-drop reordering
  place: string;
  endPlace: string;
  accommodationPrice?: number;
  activityBlocks: ActivityBlock[];
}

export interface Plan {
  startDate: string; // ISO yyyy-mm-dd
  endDate: string;
  days: Day[];
}

export type ViewMode = "plan" | "compare";

/** Compare-mode sub-layout. */
export type CompareLayout = "stacked" | "side-by-side";

/** Map basemap style. */
export type TileStyle = "osm" | "positron" | "satellite";

export type ThemeMode = "light" | "dark";

export interface Stop {
  /** Internal kind: a regular day "place" or an "end-of-day" stop. */
  kind: "place" | "end";
  /** Sequential label, "1" / "2" / … in route order. */
  label: string;
  /** Tooltip / display name. */
  name: string;
  /** Latitude, longitude. */
  coords: LatLng;
  /** Index of the day this stop belongs to (used for hover-link). */
  dayIndex: number;
}

/** Result of an OSRM driving request, one entry per consecutive pair of stops. */
export interface RouteLeg {
  /** Distance in metres. */
  distance: number;
  /** Duration in seconds. */
  duration: number;
}
