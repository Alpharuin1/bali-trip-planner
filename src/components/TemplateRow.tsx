import { Box, Stack, Typography, Chip } from "@mui/material";
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
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";

import { DayBlock } from "./DayBlock";
import { SortableItem } from "./SortableItem";
import type { Day, Plan, ThemeMode } from "../types";
import { addDays, fmtDate, parseISO } from "../utils/date";

interface TemplateRowProps {
  name: string;
  plan: Plan;
  active: boolean;
  cardRadius?: string | number;
  color: string;
  mode: ThemeMode;
  /** "side-by-side" → cards stack vertically inside a column. */
  layout?: "row" | "column";
  onChange: (next: Plan) => void;
  onActivate: () => void;
}

export function TemplateRow({
  name,
  plan,
  active,
  cardRadius,
  color,
  mode,
  layout = "row",
  onChange,
  onActivate,
}: TemplateRowProps) {
  const dateBase = parseISO(plan.startDate);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const updateDay = (id: string, day: Day) =>
    onChange({
      ...plan,
      days: plan.days.map((d) => (d.id === id ? day : d)),
    });

  const onDragEnd = (e: DragEndEvent) => {
    const { active: a, over } = e;
    if (!over || a.id === over.id) return;
    const oldIdx = plan.days.findIndex((d) => d.id === a.id);
    const newIdx = plan.days.findIndex((d) => d.id === over.id);
    if (oldIdx < 0 || newIdx < 0) return;
    onChange({ ...plan, days: arrayMove(plan.days, oldIdx, newIdx) });
  };

  const isColumn = layout === "column";

  return (
    <Box
      sx={{
        mb: isColumn ? 0 : 2.5,
        flex: isColumn ? "0 0 280px" : undefined,
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
      }}
    >
      <Stack
        direction="row"
        spacing={1.5}
        sx={{ alignItems: "center", mb: 1, cursor: "pointer" }}
        onClick={onActivate}
      >
        <Box
          sx={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            bgcolor: color,
            border: "2px solid #fff",
            boxShadow: `0 2px 6px ${color}66`,
          }}
        />
        <Typography
          sx={{
            fontSize: 13,
            fontWeight: 700,
            color: active ? color : "text.primary",
          }}
        >
          {name}
        </Typography>
        {active && (
          <Chip
            label="active"
            size="small"
            sx={{
              height: 18,
              fontSize: 10,
              bgcolor: color,
              color: "#fff",
            }}
          />
        )}
        <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
          {plan.days.length} day{plan.days.length > 1 ? "s" : ""} ·{" "}
          {fmtDate(parseISO(plan.startDate))} → {fmtDate(parseISO(plan.endDate))}
        </Typography>
      </Stack>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={plan.days.map((d) => d.id)}
          strategy={horizontalListSortingStrategy}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: isColumn ? "column" : "row",
              gap: 1.5,
              overflowX: isColumn ? "hidden" : "auto",
              overflowY: isColumn ? "auto" : "hidden",
              pb: 1,
              alignItems: "stretch",
              flex: isColumn ? 1 : undefined,
              minHeight: 0,
            }}
          >
            {plan.days.map((day, i) => (
              <SortableItem key={day.id} id={day.id}>
                {(handle) => (
                  <DayBlock
                    index={i}
                    date={addDays(dateBase, i)}
                    day={day}
                    mode={mode}
                    compact
                    cardRadius={cardRadius}
                    dragHandle={handle}
                    onChange={(d) => updateDay(day.id, d)}
                  />
                )}
              </SortableItem>
            ))}
          </Box>
        </SortableContext>
      </DndContext>
    </Box>
  );
}
