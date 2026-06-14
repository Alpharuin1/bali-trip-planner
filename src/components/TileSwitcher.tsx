import { ToggleButton, ToggleButtonGroup, Paper } from "@mui/material";
import MapIcon from "@mui/icons-material/Map";
import BrightnessLowIcon from "@mui/icons-material/BrightnessLow";
import SatelliteAltIcon from "@mui/icons-material/SatelliteAlt";
import type { TileStyle } from "../types";

interface TileSwitcherProps {
  value: TileStyle;
  onChange: (next: TileStyle) => void;
}

export function TileSwitcher({ value, onChange }: TileSwitcherProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        position: "absolute",
        top: 12,
        right: 12,
        p: 0.5,
        borderRadius: 2,
        bgcolor: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(6px)",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        zIndex: 500,
      }}
    >
      <ToggleButtonGroup
        value={value}
        exclusive
        size="small"
        onChange={(_, v: TileStyle | null) => v && onChange(v)}
        sx={{
          "& .MuiToggleButton-root": {
            border: "none",
            color: "#666",
            px: 1,
            py: 0.5,
            "&.Mui-selected": {
              bgcolor: "primary.main",
              color: "#fff",
              "&:hover": { bgcolor: "primary.main" },
            },
          },
        }}
      >
        <ToggleButton value="osm" title="OpenStreetMap">
          <MapIcon sx={{ fontSize: 16 }} />
        </ToggleButton>
        <ToggleButton value="positron" title="Minimal (CartoDB Positron)">
          <BrightnessLowIcon sx={{ fontSize: 16 }} />
        </ToggleButton>
        <ToggleButton value="satellite" title="Satellite (Esri)">
          <SatelliteAltIcon sx={{ fontSize: 16 }} />
        </ToggleButton>
      </ToggleButtonGroup>
    </Paper>
  );
}
