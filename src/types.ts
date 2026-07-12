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
  attachment?: FileAttachment;
}

/** Booking file stored inline (base64) so it syncs with the shared trip payload. */
export interface FileAttachment {
  name: string;
  mimeType: string;
  dataUrl: string;
}

export interface Day {
  id: string; // stable id for drag-and-drop reordering
  place: string;
  endPlace: string;
  accommodationPrice?: number;
  accommodationNights?: number;
  accommodationName?: string;
  accommodationLink?: string;
  accommodationAttachment?: FileAttachment;
  activityBlocks: ActivityBlock[];
}

export interface Plan {
  startDate: string; // ISO yyyy-mm-dd
  endDate: string;
  days: Day[];
}

export type ViewMode = "plan" | "compare";

/** Top-level app section: shared squad itinerary vs personal packing plan. */
export type AppSection = "squad" | "myplan";

/** Select value for the unified view dropdown — squad or a personal profile id. */
export const SQUAD_VIEW_ID = "squad";

export interface ClothingItem {
  text: string;
}

export interface ClothingBlock {
  id: string;
  name: string;
  items: ClothingItem[];
  notes?: string;
  /** `${activityBlockId}:${activityIndex}` — auto-synced from squad itinerary */
  squadActivityRef?: string;
}

export interface PersonalDay {
  id: string;
  clothingBlocks: ClothingBlock[];
  /** Personal travel bookings (flights, ferries, etc.) — same shape as squad activity blocks. */
  travelBlocks: ActivityBlock[];
  notes?: string;
}

export interface PersonalProfile {
  id: string;
  name: string;
  days: PersonalDay[];
  /** Synced metadata — passcode hash lives in Supabase, not in the trip payload. */
  hasPasscode?: boolean;
}

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
