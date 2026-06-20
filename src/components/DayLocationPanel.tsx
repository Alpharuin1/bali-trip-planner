import { useMemo } from "react";
import { Box, Chip, Paper, Stack, Typography } from "@mui/material";
import WbSunnyOutlinedIcon from "@mui/icons-material/WbSunnyOutlined";
import StyleOutlinedIcon from "@mui/icons-material/StyleOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import type { TileStyle, ThemeMode } from "../types";
import { fmtDate, fmtDay } from "../utils/date";
import { getDayLocationInsights, resolveDayLocation } from "../utils/locationInsights";
import { getRegionHighlightRing } from "../utils/mapHighlight";
import { tokens } from "../theme";
import { FieldLabel } from "./FieldLabel";
import { LocationMap } from "./LocationMap";

interface DayLocationPanelProps {
  dayIndex: number;
  date: Date;
  place: string;
  endPlace: string;
  tile: TileStyle;
  themeMode: ThemeMode;
  cardRadius?: string | number;
}

export function DayLocationPanel({
  dayIndex,
  date,
  place,
  endPlace,
  tile,
  themeMode,
  cardRadius = "12px",
}: DayLocationPanelProps) {
  const t = tokens(themeMode);
  const insights = getDayLocationInsights(date, place, endPlace, dayIndex);
  const baliFallback: [number, number] = [-8.45, 115.18];
  const coords = insights.coords ?? baliFallback;
  const resolvedLocation = resolveDayLocation(place, endPlace);
  const highlightRing = useMemo(
    () => getRegionHighlightRing(resolvedLocation),
    [resolvedLocation?.name, resolvedLocation?.region]
  );

  return (
    <Paper
      elevation={0}
      sx={{
        height: "100%",
        p: 2,
        bgcolor: "background.paper",
        borderRadius: cardRadius,
        boxShadow:
          themeMode === "light"
            ? "0 1px 3px rgba(16, 24, 40, 0.08), 0 4px 12px rgba(16, 24, 40, 0.06)"
            : t.cardShadow,
        border: `1px solid ${t.innerBorder}`,
        display: "flex",
        flexDirection: "column",
        gap: 0,
        minHeight: 0,
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          height: "20%",
          minHeight: 96,
          maxHeight: 160,
          flexShrink: 0,
          borderRadius: "10px",
          overflow: "hidden",
          border: `1px solid ${t.innerBorder}`,
          bgcolor: t.innerSurface,
        }}
      >
        <LocationMap
          coords={coords}
          label={insights.locationName}
          tile={tile}
          zoom={8}
          highlightRing={highlightRing}
        />
      </Box>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          pt: 1.25,
          borderTop: `1px solid ${t.innerBorder}`,
          mt: 1.25,
        }}
      >
        <Box sx={{ flexShrink: 0, pb: 1 }}>
          <FieldLabel>Day context</FieldLabel>
          <Typography sx={{ fontSize: 14, fontWeight: 700, lineHeight: 1.3 }}>
            {insights.locationName}
          </Typography>
          <Typography sx={{ fontSize: 12, color: "text.secondary", mt: 0.25 }}>
            {fmtDate(date)}, {fmtDay(date)} · {insights.region}
          </Typography>
          <Stack direction="row" spacing={0.5} sx={{ flexWrap: "wrap", gap: 0.5, mt: 0.75 }}>
            <Chip
              size="small"
              icon={<PlaceOutlinedIcon sx={{ fontSize: 14 }} />}
              label={place.trim() || "Place TBD"}
              variant="outlined"
              sx={{ fontSize: 11 }}
            />
            {endPlace.trim() && endPlace.trim() !== place.trim() && (
              <Chip
                size="small"
                label={`Ends ${endPlace.trim()}`}
                variant="outlined"
                sx={{ fontSize: 11 }}
              />
            )}
          </Stack>
        </Box>

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            overflowX: "hidden",
            pr: 0.5,
            mr: -0.5,
          }}
        >
          <Stack spacing={1}>
            <Box
              sx={{
                p: 1,
                borderRadius: "8px",
                bgcolor: t.innerSurface,
                border: `1px solid ${t.innerBorder}`,
              }}
            >
              <Stack direction="row" spacing={0.5} sx={{ alignItems: "center", mb: 0.75 }}>
                <WbSunnyOutlinedIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                <Typography sx={{ fontSize: 12, fontWeight: 600 }}>Weather</Typography>
              </Stack>
              <Typography sx={{ fontSize: 12, fontWeight: 600 }}>
                {insights.weather.season} · {insights.weather.temperature}
              </Typography>
              <Typography sx={{ fontSize: 11, color: "text.secondary", mt: 0.25 }}>
                Rainfall: {insights.weather.rainfall} · Humidity: {insights.weather.humidity}
              </Typography>
            </Box>

            <Box
              sx={{
                p: 1,
                borderRadius: "8px",
                bgcolor: t.innerSurface,
                border: `1px solid ${t.innerBorder}`,
              }}
            >
              <Stack direction="row" spacing={0.5} sx={{ alignItems: "center", mb: 0.75 }}>
                <StyleOutlinedIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                <Typography sx={{ fontSize: 12, fontWeight: 600 }}>Vibes</Typography>
              </Stack>
              <Typography sx={{ fontSize: 12, color: "text.secondary", lineHeight: 1.45 }}>
                {insights.vibes}
              </Typography>
            </Box>

            <Box
              sx={{
                p: 1,
                borderRadius: "8px",
                bgcolor: t.innerSurface,
                border: `1px solid ${t.innerBorder}`,
              }}
            >
              <Typography sx={{ fontSize: 12, fontWeight: 600, mb: 0.75 }}>
                Packing hints
              </Typography>
              <Stack component="ul" spacing={0.375} sx={{ m: 0, pl: 2 }}>
                {insights.outfitTips.map((tip) => (
                  <Typography
                    key={tip}
                    component="li"
                    sx={{ fontSize: 12, color: "text.secondary", lineHeight: 1.45 }}
                  >
                    {tip}
                  </Typography>
                ))}
              </Stack>
            </Box>
          </Stack>
        </Box>
      </Box>
    </Paper>
  );
}
