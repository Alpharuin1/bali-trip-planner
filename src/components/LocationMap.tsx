import { useEffect, useRef } from "react";
import { Box } from "@mui/material";
import L from "leaflet";
import type { LatLng, TileStyle } from "../types";

interface LocationMapProps {
  coords: LatLng;
  label: string;
  tile: TileStyle;
  zoom?: number;
  highlightRing?: { center: LatLng; radiusMeters: number } | null;
}

const TILE_URLS: Record<TileStyle, string> = {
  osm: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  positron: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
  satellite:
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
};

const HIGHLIGHT_COLOR = "#7c3aed";

export function LocationMap({
  coords,
  label,
  tile,
  zoom = 8,
  highlightRing = null,
}: LocationMapProps) {
  const mapEl = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileRef = useRef<L.TileLayer | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const ringRef = useRef<L.Circle | null>(null);

  useEffect(() => {
    if (mapRef.current || !mapEl.current) return;

    const map = L.map(mapEl.current, {
      zoomControl: true,
      attributionControl: false,
    }).setView(coords, zoom);

    tileRef.current = L.tileLayer(TILE_URLS[tile], { maxZoom: 19 }).addTo(map);
    mapRef.current = map;

    const observer = new ResizeObserver(() => mapRef.current?.invalidateSize());
    observer.observe(mapEl.current);

    return () => {
      observer.disconnect();
      map.remove();
      mapRef.current = null;
      tileRef.current = null;
      markerRef.current = null;
      ringRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !tileRef.current) return;
    map.removeLayer(tileRef.current);
    tileRef.current = L.tileLayer(TILE_URLS[tile], { maxZoom: 19 }).addTo(map);
  }, [tile]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (markerRef.current) markerRef.current.remove();
    if (ringRef.current) ringRef.current.remove();

    if (highlightRing) {
      ringRef.current = L.circle(highlightRing.center, {
        radius: highlightRing.radiusMeters,
        color: HIGHLIGHT_COLOR,
        weight: 2,
        opacity: 0.75,
        fillColor: HIGHLIGHT_COLOR,
        fillOpacity: 0.06,
        dashArray: "6 7",
      }).addTo(map);
    }

    const icon = L.divIcon({
      className: "",
      html: `<div class="day-marker day-marker-sm" style="background:${HIGHLIGHT_COLOR};color:#fff;border-color:${HIGHLIGHT_COLOR};">●</div>`,
      iconSize: [18, 18],
      iconAnchor: [9, 9],
    });

    markerRef.current = L.marker(coords, { icon })
      .bindTooltip(label, { direction: "top", offset: [0, -10] })
      .addTo(map);

    map.setView(coords, zoom, { animate: true });
  }, [coords, label, zoom, highlightRing]);

  return (
    <Box
      ref={mapEl}
      sx={{
        height: "100%",
        width: "100%",
        bgcolor: "#dfeaf2",
      }}
    />
  );
}
