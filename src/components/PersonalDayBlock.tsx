import {
  Paper,
  Box,
  Typography,
  Stack,
  Button,
  IconButton,
  Tooltip,
  Divider,
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
import { ClothingBlockCard } from "./ClothingBlockCard";
import { BLOCK_CONTROL_BLEED } from "./BlockCardShell";
import { SortableItem, type DragHandleProps } from "./SortableItem";
import type { ClothingBlock, Day, PersonalDay, ThemeMode } from "../types";
import { fmtDate, fmtDay } from "../utils/date";
import { formatDayRouteLabel } from "../utils/plan";
import { blankClothingBlock, reconcilePersonalDayWithSquad } from "../utils/personalPlan";
import { PERSONAL_DAY_CARD_WIDTH } from "../layout";
import { tokens } from "../theme";

interface PersonalDayBlockProps {
  index: number;
  date: Date;
  day: PersonalDay;
  squadDay?: Day;
  mode: ThemeMode;
  selected?: boolean;
  onFocus?: () => void;
  onChange: (next: PersonalDay) => void;
  cardRadius?: string | number;
  dragHandle?: DragHandleProps;
  /** Full-width card for mobile single-day layout. */
  fill?: boolean;
  /** Hide day title row (shown in mobile header instead). */
  hideHeader?: boolean;
}

function splitClothingBlocks(blocks: ClothingBlock[]) {
  const outfitBlocks = blocks.filter((b) => !b.squadActivityRef);
  const activityBlocks = blocks.filter((b) => b.squadActivityRef);
  return { outfitBlocks, activityBlocks };
}

function mergeClothingBlocks(outfitBlocks: ClothingBlock[], activityBlocks: ClothingBlock[]) {
  return [...outfitBlocks, ...activityBlocks];
}

export function PersonalDayBlock({
  date,
  day,
  squadDay,
  mode,
  selected = false,
  onFocus,
  onChange,
  cardRadius = "12px",
  dragHandle,
  fill = false,
  hideHeader = false,
}: PersonalDayBlockProps) {
  const t = tokens(mode);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const { outfitBlocks, activityBlocks } = splitClothingBlocks(day.clothingBlocks);

  const setBlocks = (outfits: ClothingBlock[], activities: ClothingBlock[]) =>
    onChange({ ...day, clothingBlocks: mergeClothingBlocks(outfits, activities) });

  const updateBlock = (id: string, next: ClothingBlock) =>
    onChange({
      ...day,
      clothingBlocks: day.clothingBlocks.map((b) => (b.id === id ? next : b)),
    });

  const addOutfitBlock = () =>
    setBlocks(
      [...outfitBlocks, blankClothingBlock(outfitBlocks.length + 1)],
      activityBlocks
    );

  const removeBlock = (id: string) => {
    const block = day.clothingBlocks.find((b) => b.id === id);
    if (!block) return;
    if (block.squadActivityRef) {
      setBlocks(outfitBlocks, activityBlocks.filter((b) => b.id !== id));
    } else {
      setBlocks(
        outfitBlocks.filter((b) => b.id !== id),
        activityBlocks
      );
    }
  };

  const onOutfitDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = outfitBlocks.findIndex((b) => b.id === active.id);
    const newIdx = outfitBlocks.findIndex((b) => b.id === over.id);
    if (oldIdx < 0 || newIdx < 0) return;
    setBlocks(arrayMove(outfitBlocks, oldIdx, newIdx), activityBlocks);
  };

  const onActivityDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = activityBlocks.findIndex((b) => b.id === active.id);
    const newIdx = activityBlocks.findIndex((b) => b.id === over.id);
    if (oldIdx < 0 || newIdx < 0) return;
    setBlocks(outfitBlocks, arrayMove(activityBlocks, oldIdx, newIdx));
  };

  const clearDay = () =>
    onChange(
      reconcilePersonalDayWithSquad({ ...day, clothingBlocks: [] }, squadDay)
    );

  const squadPlace = squadDay?.place ?? "";
  const squadEnd = squadDay?.endPlace ?? "";
  const routeLabel = formatDayRouteLabel(squadPlace, squadEnd);

  const canDeleteBlock = (block: ClothingBlock) => {
    if (block.squadActivityRef) return false;
    return outfitBlocks.length > 1 || activityBlocks.length > 0;
  };

  const renderBlock = (block: ClothingBlock, handle: DragHandleProps) => (
    <ClothingBlockCard
      block={block}
      mode={mode}
      onChange={(next) => updateBlock(block.id, next)}
      onDelete={() => removeBlock(block.id)}
      canDelete={canDeleteBlock(block)}
      dragHandle={handle}
    />
  );

  return (
    <Paper
      elevation={0}
      onClick={fill ? undefined : onFocus}
      tabIndex={fill ? undefined : onFocus ? 0 : undefined}
      onKeyDown={
        fill
          ? undefined
          : (e) => {
              if (onFocus && (e.key === "Enter" || e.key === " ")) {
                e.preventDefault();
                onFocus();
              }
            }
      }
      sx={{
        width: fill ? "100%" : PERSONAL_DAY_CARD_WIDTH,
        flexShrink: fill ? 1 : 0,
        height: fill ? "auto" : "100%",
        p: 2,
        bgcolor: "background.paper",
        borderRadius: cardRadius,
        boxShadow: "none",
        border: selected
          ? "2px solid"
          : `1px solid ${t.dayCardBorder}`,
        borderColor: selected ? "primary.main" : undefined,
        display: "flex",
        flexDirection: "column",
        gap: 0,
        minHeight: 0,
        overflow: fill ? "visible" : "hidden",
        outline: "none",
        cursor: fill ? undefined : onFocus ? "pointer" : undefined,
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
            }}
          >
            <DragIndicatorIcon sx={{ fontSize: 18 }} />
          </Box>
        )}
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            sx={{ fontSize: 11, color: "text.secondary", fontWeight: 600, lineHeight: 1.35 }}
          >
            {fmtDate(date)}, {fmtDay(date)}
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
          <IconButton size="small" onClick={clearDay} sx={{ p: 0.5, color: "text.secondary" }}>
            <RestartAltIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      </Stack>
      ) : null}

      <Box
        sx={{
          ...(fill ? {} : { flex: 1, minHeight: 0 }),
          display: "flex",
          flexDirection: "column",
          py: hideHeader ? 0 : 1.25,
          borderTop: hideHeader ? "none" : `1px solid ${t.innerBorder}`,
        }}
      >
        <Box
          sx={{
            ...(fill ? {} : { flex: 1, minHeight: 0 }),
            overflowY: fill ? "visible" : "auto",
            overflowX: "clip",
            pt: `${BLOCK_CONTROL_BLEED}px`,
            mt: `-${BLOCK_CONTROL_BLEED}px`,
          }}
        >
          <FieldLabel>Outfits</FieldLabel>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={onOutfitDragEnd}
          >
            <SortableContext
              items={outfitBlocks.map((b) => b.id)}
              strategy={verticalListSortingStrategy}
            >
              <Stack
                spacing={1}
                sx={{
                  mt: 0.75,
                  px: `${BLOCK_CONTROL_BLEED}px`,
                  mx: `-${BLOCK_CONTROL_BLEED}px`,
                }}
              >
                {outfitBlocks.map((block) => (
                  <SortableItem key={block.id} id={block.id}>
                    {(handle) => renderBlock(block, handle)}
                  </SortableItem>
                ))}
              </Stack>
            </SortableContext>
          </DndContext>

          <Button
            onClick={addOutfitBlock}
            fullWidth
            sx={{
              mt: 1.25,
              bgcolor: t.surface,
              color: "text.secondary",
              fontSize: 13,
              "&:hover": { bgcolor: t.innerBorder },
            }}
          >
            + Add block
          </Button>

          <Divider sx={{ mt: 1.5, mb: 1.25 }} />

          <FieldLabel sx={{ mb: 0.75 }}>Activities</FieldLabel>
          {activityBlocks.length === 0 ? (
            <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 1 }}>
              Add activities on the squad plan to pack for them here.
            </Typography>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={onActivityDragEnd}
            >
              <SortableContext
                items={activityBlocks.map((b) => b.id)}
                strategy={verticalListSortingStrategy}
              >
                <Stack
                  spacing={1}
                  sx={{
                    mt: 0.25,
                    px: `${BLOCK_CONTROL_BLEED}px`,
                    mx: `-${BLOCK_CONTROL_BLEED}px`,
                  }}
                >
                  {activityBlocks.map((block) => (
                    <SortableItem key={block.id} id={block.id}>
                      {(handle) => renderBlock(block, handle)}
                    </SortableItem>
                  ))}
                </Stack>
              </SortableContext>
            </DndContext>
          )}
        </Box>
      </Box>
    </Paper>
  );
}
