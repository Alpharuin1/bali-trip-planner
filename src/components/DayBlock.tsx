import {
  Paper,
  Box,
  Typography,
  Autocomplete,
  TextField,
  Stack,
  Button,
  IconButton,
  Tooltip,
} from "@mui/material";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { FieldLabel } from "./FieldLabel";
import { ActivityBlockCard } from "./ActivityBlockCard";
import { SortableItem, type DragHandleProps } from "./SortableItem";
import { BALI_LOCATIONS, findLoc } from "../locations";
import type { ActivityBlock, Day, Location, ThemeMode } from "../types";
import { fmtDate, fmtDay } from "../utils/date";
import { blankBlock } from "../utils/plan";
import { tokens } from "../theme";

interface DayBlockProps {
  index: number;
  date: Date;
  day: Day;
  mode: ThemeMode;
  onChange: (next: Day) => void;
  /** When true: hide activity blocks and let the card size to its content. */
  compact?: boolean;
  /** Border radius (sections vs day cards). */
  cardRadius?: string | number;
  /** Drag handle props from a parent SortableItem. */
  dragHandle?: DragHandleProps;
  /** Card → marker hover-link callback (no visual change on the card itself). */
  onHover?: (hovered: boolean) => void;
}

export function DayBlock({
  index,
  date,
  day,
  mode,
  onChange,
  compact = false,
  cardRadius = "12px",
  dragHandle,
  onHover,
}: DayBlockProps) {
  const t = tokens(mode);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const updatePlace = (val: Location | null) =>
    onChange({ ...day, place: val ? val.name : "" });
  const updateEnd = (val: Location | null) =>
    onChange({ ...day, endPlace: val ? val.name : "" });

  const updateBlock = (id: string, next: ActivityBlock) =>
    onChange({
      ...day,
      activityBlocks: day.activityBlocks.map((b) => (b.id === id ? next : b)),
    });

  const addBlock = () =>
    onChange({
      ...day,
      activityBlocks: [
        ...day.activityBlocks,
        blankBlock(day.activityBlocks.length + 1),
      ],
    });

  const removeBlock = (id: string) =>
    onChange({
      ...day,
      activityBlocks: day.activityBlocks.filter((b) => b.id !== id),
    });

  const onBlocksDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = day.activityBlocks.findIndex((b) => b.id === active.id);
    const newIdx = day.activityBlocks.findIndex((b) => b.id === over.id);
    if (oldIdx < 0 || newIdx < 0) return;
    onChange({
      ...day,
      activityBlocks: arrayMove(day.activityBlocks, oldIdx, newIdx),
    });
  };

  const clearDay = () => {
    onChange({
      ...day,
      place: "",
      endPlace: "",
      accommodationPrice: undefined,
      activityBlocks: [blankBlock(1)],
    });
  };

  const isEmpty =
    !day.place &&
    !day.endPlace &&
    (day.accommodationPrice == null || Number.isNaN(day.accommodationPrice)) &&
    day.activityBlocks.length === 1 &&
    day.activityBlocks[0].activities.every((a) => !a.text);

  const placeValue = findLoc(day.place);
  const endValue = findLoc(day.endPlace);

  return (
    <Paper
      elevation={0}
      onMouseEnter={() => onHover?.(true)}
      onMouseLeave={() => onHover?.(false)}
      sx={{
        // Fixed-width card. flexShrink: 0 protects against an enclosing
        // flex parent trying to shrink it; width works whether the parent
        // is a flex container or a normal block.
        width: 240,
        flexShrink: 0,
        // Fill the parent's vertical height in the full (plan-mode) view.
        ...(compact ? null : { height: "100%" }),
        p: 2,
        bgcolor: "background.paper",
        borderRadius: cardRadius,
        boxShadow: t.cardShadow,
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
        minHeight: 0,
        overflow: "hidden",
      }}
    >
      {/* Day header — drag handle, day number/date, clear button */}
      <Stack direction="row" sx={{ alignItems: "flex-start", gap: 0.75 }}>
        {dragHandle && (
          <Box
            {...dragHandle.attributes}
            {...dragHandle.listeners}
            sx={{
              cursor: "grab",
              display: "flex",
              color: "text.secondary",
              opacity: 0.55,
              mt: 0.25,
              "&:active": { cursor: "grabbing" },
              "&:hover": { opacity: 1 },
            }}
          >
            <DragIndicatorIcon sx={{ fontSize: 18 }} />
          </Box>
        )}
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            sx={{ fontSize: 11, color: "text.secondary", fontWeight: 600 }}
          >
            Day {index + 1}
          </Typography>
          <Typography sx={{ fontSize: 14, fontWeight: 700 }}>
            {fmtDate(date)}, {fmtDay(date)}
          </Typography>
        </Box>
        <Tooltip title="Clear this day">
          <span>
            <IconButton
              size="small"
              onClick={clearDay}
              disabled={isEmpty}
              sx={{ p: 0.5, color: "text.secondary" }}
            >
              <RestartAltIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </span>
        </Tooltip>
      </Stack>

      {/* Place */}
      <Box>
        <FieldLabel>Place</FieldLabel>
        <Autocomplete
          size="small"
          options={BALI_LOCATIONS}
          getOptionLabel={(o) => o.name}
          groupBy={(o) => o.region}
          value={placeValue}
          onChange={(_, v) => updatePlace(v)}
          isOptionEqualToValue={(o, v) => o.name === v.name}
          renderInput={(params) => <TextField {...params} placeholder="Select" />}
        />
      </Box>

      {/* Activity blocks (scrollable internally; hidden in compact mode) */}
      {!compact && (
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <FieldLabel>Activities</FieldLabel>
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              overflowY: "auto",
              overflowX: "hidden",
              pr: 0.5,
              mr: -0.5, // bleed scrollbar into the card padding so content lines up
            }}
          >
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={onBlocksDragEnd}
            >
              <SortableContext
                items={day.activityBlocks.map((b) => b.id)}
                strategy={verticalListSortingStrategy}
              >
                <Stack spacing={1}>
                  {day.activityBlocks.map((block) => (
                    <SortableItem key={block.id} id={block.id}>
                      {(handle) => (
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <ActivityBlockCard
                            block={block}
                            mode={mode}
                            onChange={(next) => updateBlock(block.id, next)}
                            onDelete={() => removeBlock(block.id)}
                            canDelete={day.activityBlocks.length > 1}
                            dragHandle={handle}
                          />
                        </Box>
                      )}
                    </SortableItem>
                  ))}
                </Stack>
              </SortableContext>
            </DndContext>
          </Box>
          <Button
            onClick={addBlock}
            fullWidth
            sx={{
              mt: 1,
              flexShrink: 0,
              bgcolor: t.surface,
              color: "text.secondary",
              fontSize: 13,
              "&:hover": { bgcolor: t.innerBorder },
            }}
          >
            + Add Activity Block
          </Button>
        </Box>
      )}

      {/* Accommodation */}
      <Box sx={{ flexShrink: 0 }}>
        <FieldLabel>Accommodation</FieldLabel>
        <TextField
          size="small"
          fullWidth
          type="number"
          placeholder="Price"
          value={
            day.accommodationPrice == null || Number.isNaN(day.accommodationPrice)
              ? ""
              : String(day.accommodationPrice)
          }
          onChange={(e) => {
            const raw = e.target.value;
            if (!raw) {
              onChange({ ...day, accommodationPrice: undefined });
              return;
            }
            const n = Number(raw);
            onChange({ ...day, accommodationPrice: Number.isFinite(n) ? n : undefined });
          }}
          slotProps={{ htmlInput: { min: 0, step: 1 } }}
        />
      </Box>

      {/* End the day */}
      <Box sx={{ ...(compact ? { mt: "auto" } : null), flexShrink: 0 }}>
        <FieldLabel>End the day at</FieldLabel>
        <Autocomplete
          size="small"
          options={BALI_LOCATIONS}
          getOptionLabel={(o) => o.name}
          groupBy={(o) => o.region}
          value={endValue}
          onChange={(_, v) => updateEnd(v)}
          isOptionEqualToValue={(o, v) => o.name === v.name}
          renderInput={(params) => <TextField {...params} placeholder="Select" />}
        />
      </Box>
    </Paper>
  );
}
