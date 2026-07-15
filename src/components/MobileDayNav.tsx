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
import { PERSONAL_DOCS_PAGE_INDEX } from "../layout";
import { addDays, fmtDate, parseISO } from "../utils/date";
import { tokens } from "../theme";

const POPOVER_GAP = 1;

interface MobileDayNavProps {
  plan: Plan;
  pageIndex: number;
  themeMode: ThemeMode;
  /** When true, pageIndex -1 is the Docs tab (personal profiles only). */
  showDocs?: boolean;
  onPageIndexChange: (index: number) => void;
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
  pageIndex,
  themeMode,
  showDocs = false,
  onPageIndexChange,
  onPrevious,
  onNext,
}: MobileDayNavProps) {
  const t = tokens(themeMode);
  const [menuOpen, setMenuOpen] = useState(false);
  const dateBase = parseISO(plan.startDate);
  const minIndex = showDocs ? PERSONAL_DOCS_PAGE_INDEX : 0;
  const atStart = pageIndex <= minIndex;
  const atEnd = pageIndex >= plan.days.length - 1;
  const onDocs = showDocs && pageIndex === PERSONAL_DOCS_PAGE_INDEX;

  const pickPage = (index: number) => {
    onPageIndexChange(index);
    setMenuOpen(false);
  };

  const centerLabel = onDocs ? "Docs" : `Day ${pageIndex + 1}`;

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
              aria-label="Select page"
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
              {showDocs ? (
                <Box
                  role="option"
                  aria-selected={onDocs}
                  onClick={() => pickPage(PERSONAL_DOCS_PAGE_INDEX)}
                  sx={{
                    py: 1.25,
                    px: 2,
                    cursor: "pointer",
                    bgcolor: onDocs ? "action.selected" : "transparent",
                    "&:hover": {
                      bgcolor: onDocs ? "action.selected" : "action.hover",
                    },
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: onDocs ? 600 : 500 }}
                  >
                    Docs
                  </Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    Passports, insurance, tickets…
                  </Typography>
                </Box>
              ) : null}
              {plan.days.map((day, i) => {
                const date = addDays(dateBase, i);
                const location = dayLocationLabel(day);
                const selected = !onDocs && i === pageIndex;
                return (
                  <Box
                    key={day.id}
                    role="option"
                    aria-selected={selected}
                    onClick={() => pickPage(i)}
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
              aria-label="Select page"
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
              {centerLabel}
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
