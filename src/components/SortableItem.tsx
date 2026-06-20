import type { CSSProperties, ReactNode } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Box } from "@mui/material";

/** Render-prop value handed to children of SortableItem. */
export type DragHandleProps = {
  listeners: ReturnType<typeof useSortable>["listeners"];
  attributes: ReturnType<typeof useSortable>["attributes"];
  isDragging: boolean;
};

interface SortableItemProps {
  id: string;
  /**
   * When true, the wrapper stretches in its parent flex container so the
   * child can use `height: 100%` (e.g. day cards in the plan view that
   * should fill the itinerary section vertically).
   */
  fill?: boolean;
  /**
   * Render-prop receiving the drag-handle props.
   * Spread these onto the element you want to act as the grab handle
   * (e.g. a small icon) so the rest of the card stays interactive.
   */
  children: (handle: DragHandleProps) => ReactNode;
}

export function SortableItem({ id, fill = false, children }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    flex: "0 0 auto",
    ...(fill ? { alignSelf: "stretch", height: "100%" } : null),
  };

  return (
    <Box
      ref={setNodeRef}
      style={style}
      sx={{
        position: "relative",
        overflow: "visible",
        // Full width for vertical block lists only — not day cards in the horizontal strip.
        ...(fill ? null : { width: "100%" }),
        zIndex: isDragging ? 20 : 0,
      }}
    >
      {children({ listeners, attributes, isDragging })}
    </Box>
  );
}
