import { Box, IconButton, InputAdornment, Stack, TextField } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import type { Day, ThemeMode } from "../types";
import { tokens } from "../theme";
import { typingFieldKeyDownProps } from "../utils/keyboard";
import { ActivityLinkControl } from "./ActivityLinkControl";
import { AttachmentControl } from "./AttachmentControl";
import { FieldLabel } from "./FieldLabel";

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    bgcolor: "background.paper",
    borderRadius: "6px",
  },
};

const nightsFieldSx = {
  ...fieldSx,
  "& .MuiOutlinedInput-input": {
    paddingRight: "26px",
  },
};

interface AccommodationCardProps {
  mode: ThemeMode;
  day: Day;
  onChange: (next: Day) => void;
  borderless?: boolean;
}

function parseOptionalInt(raw: string): number | undefined {
  if (!raw.trim()) return undefined;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) return undefined;
  return Math.floor(n);
}

function parseOptionalPrice(raw: string): number | undefined {
  if (!raw.trim()) return undefined;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) return undefined;
  return n;
}

export function AccommodationCard({ mode, day, onChange, borderless = false }: AccommodationCardProps) {
  const t = tokens(mode);

  const adjustNights = (delta: number) => {
    const current = day.accommodationNights ?? 0;
    const next = current + delta;
    onChange({
      ...day,
      accommodationNights: next > 0 ? next : undefined,
    });
  };

  return (
    <Box
      sx={{
        p: 1,
        bgcolor: t.innerSurface,
        ...(borderless ? {} : { border: `1px solid ${t.innerBorder}` }),
        borderRadius: "8px",
        width: "100%",
      }}
    >
      <Stack spacing={0.75} sx={{ width: "100%" }}>
        <ActivityLinkControl
          url={day.accommodationLink ?? ""}
          mode={mode}
          inline
          textFieldSx={fieldSx}
          onChange={(accommodationLink) => onChange({ ...day, accommodationLink })}
        />

        <AttachmentControl
          attachment={day.accommodationAttachment}
          mode={mode}
          buttonLabel="Attach Booking"
          onChange={(accommodationAttachment) => onChange({ ...day, accommodationAttachment })}
        />

        <Stack direction="row" spacing={0.75} sx={{ alignItems: "flex-end" }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <FieldLabel sx={{ mb: 0.25 }}>Nights</FieldLabel>
            <TextField
              size="small"
              fullWidth
              type="number"
              value={
                day.accommodationNights == null || Number.isNaN(day.accommodationNights)
                  ? ""
                  : String(day.accommodationNights)
              }
              onChange={(e) =>
                onChange({
                  ...day,
                  accommodationNights: parseOptionalInt(e.target.value),
                })
              }
              {...typingFieldKeyDownProps}
              slotProps={{
                htmlInput: { min: 0, step: 1, inputMode: "numeric" },
                input: {
                  endAdornment: (
                    <InputAdornment position="end" sx={{ mr: -0.25 }}>
                      <Stack sx={{ height: 28, justifyContent: "center" }}>
                        <IconButton
                          size="small"
                          aria-label="Increase nights"
                          onClick={() => adjustNights(1)}
                          sx={{ p: 0, height: 14, width: 18, borderRadius: 0.5 }}
                        >
                          <KeyboardArrowUpIcon sx={{ fontSize: 15 }} />
                        </IconButton>
                        <IconButton
                          size="small"
                          aria-label="Decrease nights"
                          onClick={() => adjustNights(-1)}
                          sx={{ p: 0, height: 14, width: 18, borderRadius: 0.5 }}
                        >
                          <KeyboardArrowDownIcon sx={{ fontSize: 15 }} />
                        </IconButton>
                      </Stack>
                    </InputAdornment>
                  ),
                },
              }}
              sx={nightsFieldSx}
            />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <FieldLabel sx={{ mb: 0.25 }}>Price</FieldLabel>
            <TextField
              size="small"
              fullWidth
              type="number"
              value={
                day.accommodationPrice == null || Number.isNaN(day.accommodationPrice)
                  ? ""
                  : String(day.accommodationPrice)
              }
              onChange={(e) =>
                onChange({
                  ...day,
                  accommodationPrice: parseOptionalPrice(e.target.value),
                })
              }
              {...typingFieldKeyDownProps}
              slotProps={{ htmlInput: { min: 0, step: 1 } }}
              sx={fieldSx}
            />
          </Box>
        </Stack>
      </Stack>
    </Box>
  );
}
