import { createTheme } from "@mui/material/styles";
import type { ThemeMode } from "./types";

// Soft, modern, rounded — emulates the look of the original reference image.
// Two palettes: light (default) and dark (toggleable).
const lightPalette = {
  mode: "light" as const,
  background: { default: "#ececec", paper: "#ffffff" },
  primary: { main: "#6f42c1" },
  secondary: { main: "#d9488f" },
  text: { primary: "#1a1a1a", secondary: "#6b6b6b" },
};

const darkPalette = {
  mode: "dark" as const,
  background: { default: "#0f1115", paper: "#181b22" },
  primary: { main: "#9d6df0" },
  secondary: { main: "#f574ad" },
  text: { primary: "#e7e9ee", secondary: "#a0a4ad" },
};

const surfaceColor = (mode: ThemeMode) =>
  mode === "light" ? "#f5f5f7" : "#22262f";
const subtleBorder = (mode: ThemeMode) =>
  mode === "light" ? "#efefef" : "#262a33";

export const buildTheme = (mode: ThemeMode) =>
  createTheme({
    palette: mode === "light" ? lightPalette : darkPalette,
    shape: { borderRadius: 14 },
    typography: {
      fontFamily:
        'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      h6: { fontWeight: 700, letterSpacing: "-0.01em" },
      subtitle2: { fontWeight: 600 },
      body2: { fontSize: 13 },
    },
    components: {
      MuiPaper: {
        styleOverrides: { root: { backgroundImage: "none" } },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            background: surfaceColor(mode),
            "& fieldset": { borderColor: "transparent" },
            "&:hover fieldset": {
              borderColor:
                mode === "light"
                  ? "rgba(0,0,0,0.12) !important"
                  : "rgba(255,255,255,0.16) !important",
            },
            "&.Mui-focused fieldset": {
              borderColor:
                (mode === "light" ? "#6f42c1" : "#9d6df0") + " !important",
              borderWidth: "1px !important",
            },
          },
          input: { padding: "10px 12px", fontSize: 13 },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: { fontSize: 13, color: mode === "light" ? "#6b6b6b" : "#a0a4ad" },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: { textTransform: "none", borderRadius: 10, fontWeight: 600 },
        },
      },
    },
  });

// Tokens consumed by components that need to match the theme without
// re-implementing the same rules everywhere.
export const tokens = (mode: ThemeMode) => ({
  surface: surfaceColor(mode),
  border: subtleBorder(mode),
  cardShadow:
    mode === "light"
      ? "0 1px 2px rgba(16, 24, 40, 0.04), 0 6px 18px rgba(16, 24, 40, 0.06)"
      : "0 1px 2px rgba(0, 0, 0, 0.5), 0 6px 18px rgba(0, 0, 0, 0.35)",
  innerSurface: mode === "light" ? "#f9f9fb" : "#1f242c",
  innerBorder: mode === "light" ? "#ececec" : "#2a2f38",
});
