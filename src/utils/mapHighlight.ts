import type { LatLng, Location } from "../types";
import { BALI_LOCATIONS } from "../locations";

const EARTH_RADIUS_M = 6_371_000;

function haversineMeters(a: LatLng, b: LatLng): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const lat1 = toRad(a[0]);
  const lat2 = toRad(b[0]);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

/** Dotted ring around the region cluster for the day's location. */
export function getRegionHighlightRing(
  location: Location | null
): { center: LatLng; radiusMeters: number } | null {
  if (!location) return null;

  const peers = BALI_LOCATIONS.filter((l) => l.region === location.region);
  if (peers.length === 0) return null;

  const centerLat = peers.reduce((sum, p) => sum + p.coords[0], 0) / peers.length;
  const centerLng = peers.reduce((sum, p) => sum + p.coords[1], 0) / peers.length;
  const center: LatLng = [centerLat, centerLng];

  let maxDist = 0;
  for (const peer of peers) {
    maxDist = Math.max(maxDist, haversineMeters(center, peer.coords));
  }

  return {
    center,
    radiusMeters: Math.max(maxDist * 1.25, 4_000),
  };
}
