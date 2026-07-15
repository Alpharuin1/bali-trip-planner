import {
  Paper,
  Box,
  Typography,
  Autocomplete,
  TextField,
  Stack,
  IconButton,
  Tooltip,
  Button,
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
import { AccommodationCard } from "./AccommodationCard";
import { DeletedBlockSnackbar } from "./DeletedBlockSnackbar";
import { SortableItem } from "./SortableItem";
import { BALI_LOCATIONS, findLoc } from "../locations";
import type { ActivityBlock, Day, Location, ThemeMode } from "../types";
import { fmtDate } from "../utils/date";
import { blankBlock, formatDayRouteLabel } from "../utils/plan";
import { dayHasAccommodationContent } from "../utils/accommodation";
import { blockListScrollBleedSx } from "./BlockCardShell";
import { SQUAD_DAY_CARD_WIDTH } from "../layout";
import { tokens } from "../theme";
import { typingFieldKeyDownProps } from "../utils/keyboard";
import { useActivityBlockDeleteUndo } from "../hooks/useActivityBlockDeleteUndo";
import { useIsMobile } from "../hooks/useIsMobile";
import type { DragHandleProps } from "./SortableItem";

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
  /** Full-width card for mobile single-day layout. */
  fill?: boolean;
  /** Hide day title row (shown in mobile header instead). */
  hideHeader?: boolean;
  /** Mobile read-only layout: hide place fields, accom first, no add/reorder. */
  readOnly?: boolean;
}

function blockHasContent(block: ActivityBlock): boolean {
  return Boolean(
    block.name.trim() ||
      block.activities.some((a) => a.text.trim()) ||
      block.attachment
  );
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
  fill = false,
  hideHeader = false,
  readOnly = false,
}: DayBlockProps) {
  const t = tokens(mode);
  const isMobile = useIsMobile();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const updatePlace = (val: Location | null) =>
    onChange({ ...day, place: val ? val.name : "" });
  const updateEnd = (val: Location | null) =>
    onChange({ ...day, endPlace: val ? val.name : "" });

  const setBlocks = (blocks: ActivityBlock[]) =>
    onChange({ ...day, activityBlocks: blocks });

  const {
    snackbarOpen,
    removeBlockWithUndo,
    undoDelete,
    dismissSnackbar,
  } = useActivityBlockDeleteUndo(day.activityBlocks, setBlocks);

  const updateBlock = (id: string, next: ActivityBlock) =>
    setBlocks(day.activityBlocks.map((b) => (b.id === id ? next : b)));

  const addBlock = () =>
    setBlocks([...day.activityBlocks, blankBlock(day.activityBlocks.length + 1)]);

  const onBlockDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = day.activityBlocks.findIndex((b) => b.id === active.id);
    const newIdx = day.activityBlocks.findIndex((b) => b.id === over.id);
    if (oldIdx < 0 || newIdx < 0) return;
    setBlocks(arrayMove(day.activityBlocks, oldIdx, newIdx));
  };

  const clearDay = () => {
    onChange({
      ...day,
      place: "",
      endPlace: "",
      accommodationPrice: undefined,
      accommodationNights: undefined,
      accommodationName: "",
      accommodationLink: "",
      accommodationAttachment: undefined,
      activityBlocks: [],
    });
  };

  const isEmpty =
    !day.place &&
    !day.endPlace &&
    !dayHasAccommodationContent(day) &&
    day.activityBlocks.every((b) => !blockHasContent(b));

  const placeValue = findLoc(day.place);
  const endValue = findLoc(day.endPlace);
  const routeLabel = formatDayRouteLabel(day.place, day.endPlace);

  const sectionPaperSx = {
    p: 2,
    bgcolor: "background.paper" as const,
    borderRadius: cardRadius,
    boxShadow: "none" as const,
    border: `1px solid ${t.dayCardBorder}`,
    width: "100%",
    overflow: "visible" as const,
  };

  const sectionLabelSx = {
    mb: 1.25,
    fontWeight: 500,
    color: "text.disabled",
  };

  const activityBlockGap = 2;

  const deleteSnackbar = (
    <DeletedBlockSnackbar
      open={snackbarOpen}
      isMobile={isMobile}
      onUndo={undoDelete}
      onClose={dismissSnackbar}
    />
  );

  if (readOnly) {
    return (
      <>
      <Stack
        spacing={1.25}
        sx={{
          width: fill ? "100%" : SQUAD_DAY_CARD_WIDTH,
          flexShrink: fill ? 1 : 0,
        }}
      >
        <Paper elevation={0} sx={sectionPaperSx}>
          <FieldLabel sx={sectionLabelSx}>Accommodation</FieldLabel>
          <AccommodationCard borderless mode={mode} day={day} onChange={onChange} />
        </Paper>

        {!compact ? (
          <Paper elevation={0} sx={sectionPaperSx}>
            <FieldLabel sx={sectionLabelSx}>Activities</FieldLabel>
            <Box sx={{ ...blockListScrollBleedSx, overflowX: "hidden" }}>
              <Stack spacing={activityBlockGap}>
              {day.activityBlocks.map((block) => (
                <ActivityBlockCard
                  key={block.id}
                  block={block}
                  mode={mode}
                  borderless
                  showDeleteAlways
                  onChange={(next) => updateBlock(block.id, next)}
                  onDelete={() => removeBlockWithUndo(block.id)}
                />
              ))}
              </Stack>
            </Box>
          </Paper>
        ) : null}
      </Stack>
      {deleteSnackbar}
      </>
    );
  }

  return (
    <>
    <Paper
      elevation={0}
      onMouseEnter={() => onHover?.(true)}
      onMouseLeave={() => onHover?.(false)}
      sx={{
        width: fill ? "100%" : SQUAD_DAY_CARD_WIDTH,
        flexShrink: fill ? 1 : 0,
        ...(fill
          ? { height: "auto", overflow: "visible" }
          : compact
            ? null
            : { height: "100%", overflow: "visible" }),
        p: 2,
        bgcolor: "background.paper",
        borderRadius: cardRadius,
        boxShadow: "none",
        border: `1px solid ${t.dayCardBorder}`,
        display: "flex",
        flexDirection: "column",
        gap: 0,
        minHeight: 0,
      }}
    >
      {!hideHeader ? (
      <Stack
        direction="row"
        sx={{ alignItems: "flex-start", gap: 0.75, pb: 1.25, flexShrink: 0 }}
      >
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
            sx={{ fontSize: 11, color: "text.secondary", fontWeight: 600, lineHeight: 1.35 }}
          >
            Day {index + 1} – {fmtDate(date)}
          </Typography>
          {routeLabel ? (
            <Typography
              sx={{
                fontSize: 14,
                fontWeight: 700,
                mt: 0.25,
                lineHeight: 1.35,
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {routeLabel}
            </Typography>
          ) : null}
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
      ) : null}

      <Box
        sx={{
          flexShrink: 0,
          pb: 1.25,
          borderBottom: `1px solid ${t.innerBorder}`,
        }}
      >
        <FieldLabel>Place</FieldLabel>
        <Autocomplete
          size="small"
          options={BALI_LOCATIONS}
          getOptionLabel={(o) => o.name}
          groupBy={(o) => o.region}
          value={placeValue}
          onChange={(_, v) => updatePlace(v)}
          isOptionEqualToValue={(o, v) => o.name === v.name}
          renderInput={(params) => (
            <TextField {...params} placeholder="Select" {...typingFieldKeyDownProps} />
          )}
        />
      </Box>

      {!compact && (
        <Box
          sx={{
            ...(fill ? {} : { flex: 1, minHeight: 0 }),
            display: "flex",
            flexDirection: "column",
            py: 1.25,
            borderBottom: `1px solid ${t.innerBorder}`,
            overflow: "visible",
          }}
        >
          <FieldLabel sx={{ mb: 0.25 }}>Activities</FieldLabel>
          <Box
            sx={{
              ...(fill ? {} : { flex: 1, minHeight: 0 }),
              overflowY: fill ? "visible" : "auto",
              overflowX: "hidden",
              ...blockListScrollBleedSx,
            }}
          >
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={onBlockDragEnd}
            >
              <SortableContext
                items={day.activityBlocks.map((b) => b.id)}
                strategy={verticalListSortingStrategy}
              >
                <Stack spacing={1}>
                  {day.activityBlocks.map((block) => (
                    <SortableItem key={block.id} id={block.id}>
                      {(handle) => (
                        <ActivityBlockCard
                          block={block}
                          mode={mode}
                          dragHandle={handle}
                          onChange={(next) => updateBlock(block.id, next)}
                          onDelete={() => removeBlockWithUndo(block.id)}
                        />
                      )}
                    </SortableItem>
                  ))}
                </Stack>
              </SortableContext>
            </DndContext>
          </Box>

          <Button
            variant="text"
            size="small"
            onClick={addBlock}
            sx={{
              alignSelf: "flex-start",
              mt: 1,
              px: 0.5,
              minWidth: 0,
              fontSize: 13,
              textTransform: "none",
            }}
          >
            + Add activity block
          </Button>
        </Box>
      )}

      <Stack
        spacing={1.25}
        sx={{
          flexShrink: 0,
          pt: 1.25,
          ...(compact ? { mt: "auto" } : null),
        }}
      >
        <Box>
          <FieldLabel sx={{ mb: 0.25 }}>Accommodation</FieldLabel>
          <AccommodationCard mode={mode} day={day} onChange={onChange} />
        </Box>

        <Box>
          <FieldLabel>End the day at</FieldLabel>
          <Autocomplete
            size="small"
            options={BALI_LOCATIONS}
            getOptionLabel={(o) => o.name}
            groupBy={(o) => o.region}
            value={endValue}
            onChange={(_, v) => updateEnd(v)}
            isOptionEqualToValue={(o, v) => o.name === v.name}
            renderInput={(params) => (
              <TextField {...params} placeholder="Select" {...typingFieldKeyDownProps} />
            )}
          />
        </Box>
      </Stack>
    </Paper>
    {deleteSnackbar}
    </>
  );
}
