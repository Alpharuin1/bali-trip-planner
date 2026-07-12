import { useState } from "react";
import {
  Box,
  Button,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import type { Day, Plan, ThemeMode } from "../types";
import { addDays, fmtDate, parseISO } from "../utils/date";
import { tokens } from "../theme";

const POPOVER_GAP = 1;

interface MobileDayNavProps {
  plan: Plan;
  dayIndex: number;
  themeMode: ThemeMode;
  onDayIndexChange: (index: number) => void;
  onPrevious: () => void;
  onNext: () => void;
}

function dayLocationLabel(day: Day): string | null {
  const place = day.place.trim();
  if (place) return place;
  const end = day.endPlace.trim();
  if (end) return end;
  return null;
}

export function MobileDayNav({
  plan,
  dayIndex,
  themeMode,
  onDayIndexChange,
  onPrevious,
  onNext,
}: MobileDayNavProps) {
  const t = tokens(themeMode);
  const [menuOpen, setMenuOpen] = useState(false);
  const dateBase = parseISO(plan.startDate);
  const atStart = dayIndex <= 0;
  const atEnd = dayIndex >= plan.days.length - 1;

  const pickDay = (index: number) => {
    onDayIndexChange(index);
    setMenuOpen(false);
  };

  return (
    <>
      {menuOpen ? (
        <Box
          aria-hidden
          onClick={() => setMenuOpen(false)}
          sx={{
            position: "fixed",
            inset: 0,
            bgcolor: "rgba(16, 24, 40, 0.24)",
            zIndex: (theme) => theme.zIndex.modal,
          }}
        />
      ) : null}

      <Paper
        elevation={0}
        sx={{
          flexShrink: 0,
          pb: "calc(12px + env(safe-area-inset-bottom))",
          borderRadius: 0,
          borderTop: `1px solid ${t.innerBorder}`,
          boxShadow: "none",
          bgcolor: "background.paper",
          position: "relative",
          zIndex: (theme) => theme.zIndex.modal + 1,
        }}
      >
        <Box sx={{ position: "relative" }}>
          {menuOpen ? (
            <Box
              role="listbox"
              aria-label="Select day"
              sx={{
                position: "absolute",
                left: (theme) => theme.spacing(POPOVER_GAP),
                right: (theme) => theme.spacing(POPOVER_GAP),
                bottom: (theme) => `calc(100% + ${theme.spacing(POPOVER_GAP)})`,
                bgcolor: "background.paper",
                border: `1px solid ${t.innerBorder}`,
                borderRadius: "12px",
                boxShadow: (theme) => theme.shadows[8],
                zIndex: 1,
                maxHeight: "min(50vh, 360px)",
                overflowY: "auto",
                overflowX: "hidden",
                WebkitOverflowScrolling: "touch",
              }}
            >
            {plan.days.map((day, i) => {
              const date = addDays(dateBase, i);
              const location = dayLocationLabel(day);
              const selected = i === dayIndex;
              return (
                <Box
                  key={day.id}
                  role="option"
                  aria-selected={selected}
                  onClick={() => pickDay(i)}
                  sx={{
                    py: 1.25,
                    px: 2,
                    cursor: "pointer",
                    bgcolor: selected ? "action.selected" : "transparent",
                    "&:hover": {
                      bgcolor: selected ? "action.selected" : "action.hover",
                    },
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                      width: "100%",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 1,
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: selected ? 600 : 500, minWidth: 0 }}
                    >
                      Day {i + 1}
                      {location ? `: ${location}` : ""}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: "text.secondary", flexShrink: 0 }}
                    >
                      {fmtDate(date)}
                    </Typography>
                  </Stack>
                </Box>
              );
            })}
            </Box>
          ) : null}

          <Stack
            direction="row"
            sx={{ alignItems: "center", width: "100%", px: 1.5, py: 1.25 }}
          >
          <Box sx={{ flex: 1, display: "flex", justifyContent: "flex-start", minWidth: 0 }}>
            <Button
              variant="text"
              size="small"
              startIcon={<ChevronLeftIcon />}
              disabled={atStart}
              onClick={onPrevious}
              sx={{
                textTransform: "none",
                minWidth: 0,
                px: 0.5,
                color: atStart ? "text.disabled" : "text.secondary",
              }}
            >
              Previous
            </Button>
          </Box>

          <Button
            variant="text"
            size="small"
            endIcon={
              <ArrowDropDownIcon
                sx={{
                  fontSize: 20,
                  transform: menuOpen ? "rotate(180deg)" : "none",
                  transition: "transform 0.15s ease",
                }}
              />
            }
            onClick={() => setMenuOpen((open) => !open)}
            aria-haspopup="listbox"
            aria-expanded={menuOpen}
            aria-label="Select day"
            sx={{
              flex: "0 0 auto",
              textTransform: "none",
              minWidth: 0,
              px: 1,
              fontSize: 13,
              fontWeight: 600,
              color: "text.primary",
            }}
          >
            Day {dayIndex + 1}
          </Button>

          <Box sx={{ flex: 1, display: "flex", justifyContent: "flex-end", minWidth: 0 }}>
            <Button
              variant="text"
              size="small"
              endIcon={<ChevronRightIcon />}
              disabled={atEnd}
              onClick={onNext}
              sx={{
                textTransform: "none",
                minWidth: 0,
                px: 0.5,
                color: atEnd ? "text.disabled" : "primary.main",
              }}
            >
              Next
            </Button>
          </Box>
        </Stack>
        </Box>
      </Paper>
    </>
  );
}
