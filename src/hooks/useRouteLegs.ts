import { useEffect, useState } from "react";
import type { RouteLeg, Stop } from "../types";

/**
 * Fetches driving distances + durations between consecutive stops via the
 * free OSRM demo server. Debounced + cached against the coordinate string so
 * a slight edit storm doesn't hammer the API.
 */
const cache = new Map<string, RouteLeg[]>();

const keyFor = (stops: Stop[]) =>
  stops.map((s) => `${s.coords[0].toFixed(4)},${s.coords[1].toFixed(4)}`).join("|");

export function useRouteLegs(stops: Stop[]): RouteLeg[] | null {
  const [legs, setLegs] = useState<RouteLeg[] | null>(null);

  useEffect(() => {
    if (stops.length < 2) {
      setLegs(null);
      return;
    }
    const k = keyFor(stops);
    const hit = cache.get(k);
    if (hit) {
      setLegs(hit);
      return;
    }

    let cancelled = false;
    const handle = window.setTimeout(async () => {
      try {
        // OSRM expects "lng,lat" pairs separated by ";".
        const coords = stops
          .map((s) => `${s.coords[1]},${s.coords[0]}`)
          .join(";");
        const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=false&alternatives=false`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`OSRM ${res.status}`);
        const data = await res.json();
        const route = data?.routes?.[0];
        if (!route?.legs) throw new Error("No legs in OSRM response");
        const next: RouteLeg[] = route.legs.map(
          (leg: { distance: number; duration: number }) => ({
            distance: leg.distance,
            duration: leg.duration,
          })
        );
        cache.set(k, next);
        if (!cancelled) setLegs(next);
      } catch {
        if (!cancelled) setLegs(null);
      }
    }, 400);

    return () => {
      cancelled = true;
      window.clearTimeout(handle);
    };
  }, [stops]);

  return legs;
}
