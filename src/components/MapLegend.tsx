import { Paper, Stack, Box, Typography } from "@mui/material";

interface MapLegendProps {
  /** Active template colour (used for the "Day stop" swatch). */
  color: string;
}

export function MapLegend({ color }: MapLegendProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        position: "absolute",
        top: 12,
        left: 12,
        px: 1.25,
        py: 1,
        borderRadius: 2,
        bgcolor: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(6px)",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        zIndex: 500,
      }}
    >
      <Stack spacing={0.5}>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <Box
            sx={{
              width: 14,
              height: 14,
              borderRadius: "50%",
              bgcolor: color,
              border: "2px solid #fff",
              boxShadow: `0 2px 6px ${color}66`,
            }}
          />
          <Typography variant="body2" sx={{ color: "#333" }}>
            Day stop
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <Box
            sx={{
              width: 14,
              height: 14,
              borderRadius: "50%",
              border: `2px dashed ${color}`,
            }}
          />
          <Typography variant="body2" sx={{ color: "#333" }}>
            End-of-day
          </Typography>
        </Stack>
      </Stack>
    </Paper>
  );
}
