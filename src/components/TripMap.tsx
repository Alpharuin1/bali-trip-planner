import { useEffect, useRef } from "react";
import { Box } from "@mui/material";
import L from "leaflet";
import type { RouteLeg, Stop, TileStyle } from "../types";

interface TripMapProps {
  stops: Stop[];
  /** Active template colour, used for markers and the route polyline. */
  color: string;
  tile: TileStyle;
  /** Optional driving legs (length === stops.length - 1). */
  legs?: RouteLeg[] | null;
  /** Currently hovered day index (highlights the corresponding marker). */
  hoveredDayIndex: number | null;
  /** Marker click → bubble up so the parent can scroll its day card into view. */
  onMarkerClick?: (dayIndex: number) => void;
}

const TILE_URLS: Record<TileStyle, string> = {
  osm: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  positron: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
  satellite:
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
};

const fmtDuration = (sec: number) => {
  const mins = Math.round(sec / 60);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
};

const fmtDistance = (m: number) => {
  if (m < 1000) return `${Math.round(m)} m`;
  return `${(m / 1000).toFixed(m < 10000 ? 1 : 0)} km`;
};

const midpoint = (
  a: [number, number],
  b: [number, number]
): [number, number] => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];

export function TripMap({
  stops,
  color,
  tile,
  legs,
  hoveredDayIndex,
  onMarkerClick,
}: TripMapProps) {
  const mapEl = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileRef = useRef<L.TileLayer | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);

  // Init once + observe container resize
  useEffect(() => {
    if (mapRef.current || !mapEl.current) return;
    const map = L.map(mapEl.current, {
      zoomControl: true,
      attributionControl: false,
    }).setView([-8.45, 115.18], 10); // centred on Bali

    const tl = L.tileLayer(TILE_URLS[tile], { maxZoom: 19 }).addTo(map);

    mapRef.current = map;
    tileRef.current = tl;
    layerRef.current = L.layerGroup().addTo(map);

    const observer = new ResizeObserver(() => mapRef.current?.invalidateSize());
    observer.observe(mapEl.current);

    return () => {
      observer.disconnect();
      map.remove();
      mapRef.current = null;
      tileRef.current = null;
      layerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Swap tile layer when style changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !tileRef.current) return;
    map.removeLayer(tileRef.current);
    tileRef.current = L.tileLayer(TILE_URLS[tile], { maxZoom: 19 }).addTo(map);
  }, [tile]);

  // Re-render markers + route + ETAs whenever inputs change
  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;
    layer.clearLayers();

    if (!stops.length) return;

    stops.forEach((stop) => {
      const isHovered = stop.dayIndex === hoveredDayIndex;
      const icon = L.divIcon({
        className: "",
        html: `<div class="day-marker ${stop.kind === "end" ? "end" : ""} ${
          isHovered ? "hovered" : ""
        }" style="background:${stop.kind === "end" ? "#fff" : color};color:${
          stop.kind === "end" ? color : "#fff"
        };border-color:${color};box-shadow:0 4px 10px ${color}66;">${stop.label}</div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });
      const marker = L.marker(stop.coords, { icon })
        .bindTooltip(`${stop.label}. ${stop.name}`, {
          direction: "top",
          offset: [0, -14],
        })
        .addTo(layer);
      if (onMarkerClick) {
        marker.on("click", () => onMarkerClick(stop.dayIndex));
      }
    });

    if (stops.length >= 2) {
      L.polyline(
        stops.map((s) => s.coords),
        {
          color,
          weight: 3,
          opacity: 0.85,
          dashArray: "6 8",
        }
      ).addTo(layer);

      // Per-segment ETA labels (when available)
      if (legs && legs.length === stops.length - 1) {
        for (let i = 0; i < legs.length; i++) {
          const a = stops[i].coords;
          const b = stops[i + 1].coords;
          const mid = midpoint(a, b);
          const leg = legs[i];
          const html = `<div class="eta-label">${fmtDuration(
            leg.duration
          )} · ${fmtDistance(leg.distance)}</div>`;
          L.marker(mid, {
            icon: L.divIcon({ className: "", html, iconSize: [110, 22], iconAnchor: [55, 11] }),
            interactive: false,
          }).addTo(layer);
        }
      }
    }

    if (stops.length === 1) {
      map.setView(stops[0].coords, 12, { animate: true });
    } else {
      const bounds = L.latLngBounds(stops.map((s) => s.coords));
      map.fitBounds(bounds, { padding: [60, 60] });
    }
  }, [stops, color, legs, hoveredDayIndex, onMarkerClick]);

  return (
    <Box
      ref={mapEl}
      sx={{
        height: "100%",
        width: "100%",
        borderRadius: "16px",
        overflow: "hidden",
        bgcolor: "#dfeaf2",
      }}
    />
  );
}
