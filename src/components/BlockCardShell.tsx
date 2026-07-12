import { type ReactNode } from "react";
import { Box, Tooltip } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import type { ThemeMode } from "../types";
import { tokens } from "../theme";
import type { DragHandleProps } from "./SortableItem";

interface BlockCardShellProps {
  mode: ThemeMode;
  children: ReactNode;
  dragHandle?: DragHandleProps;
  onDelete?: () => void;
  canDelete?: boolean;
  deleteTooltip?: string;
  borderRadius?: string;
  borderless?: boolean;
  /** Keep the delete control visible instead of hover-only. */
  showDeleteAlways?: boolean;
}

const CONTROL_SIZE = 22;
const DELETE_CONTROL_SIZE = 18;
/** Bleed room so corner delete controls are not clipped by scroll parents. */
export const DELETE_CONTROL_BLEED = DELETE_CONTROL_SIZE / 2 + 2;
/** Bleed room in scroll areas without shrinking block width. */
export const BLOCK_CONTROL_BLEED = CONTROL_SIZE / 2 + 1;
const DELETE_CONTROL_Z = 1400;

/** Scroll/list wrapper — edge controls bleed into this padding instead of being clipped. */
export const blockListScrollBleedSx = {
  pt: `${BLOCK_CONTROL_BLEED}px`,
  mt: `-${BLOCK_CONTROL_BLEED}px`,
  pl: `${BLOCK_CONTROL_BLEED}px`,
  pr: `${BLOCK_CONTROL_BLEED}px`,
  ml: `-${BLOCK_CONTROL_BLEED}px`,
  mr: `-${BLOCK_CONTROL_BLEED}px`,
};

const controlSx = {
  opacity: 0,
  pointerEvents: "none" as const,
  transition: "opacity 0.15s ease",
};

export function BlockCardShell({
  mode,
  children,
  dragHandle,
  onDelete,
  canDelete = true,
  deleteTooltip = "Remove block",
  borderRadius = "8px",
  borderless = false,
  showDeleteAlways = false,
}: BlockCardShellProps) {
  const t = tokens(mode);
  const controlBorder =
    mode === "light" ? "rgba(16, 24, 40, 0.14)" : "rgba(255, 255, 255, 0.2)";

  const circleSx = {
    width: CONTROL_SIZE,
    height: CONTROL_SIZE,
    borderRadius: "50%",
    bgcolor: "background.paper",
    border: `1px solid ${controlBorder}`,
    boxShadow: "0 1px 3px rgba(16, 24, 40, 0.14)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "text.secondary",
  };

  const deleteCircleSx = {
    width: DELETE_CONTROL_SIZE,
    height: DELETE_CONTROL_SIZE,
    borderRadius: "50%",
    bgcolor: "background.paper",
    border: `1px solid ${controlBorder}`,
    boxShadow: "0 2px 6px rgba(16, 24, 40, 0.16)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "text.secondary",
  };

  return (
    <Box
      sx={{
        position: "relative",
        overflow: "visible",
        width: "100%",
        zIndex: showDeleteAlways ? DELETE_CONTROL_Z : undefined,
        "&:hover": { zIndex: DELETE_CONTROL_Z },
        ...(!showDeleteAlways
          ? {
              "&:hover .block-hover-control": {
                opacity: 1,
                pointerEvents: "auto",
              },
            }
          : {}),
      }}
    >
      <Box
        sx={{
          position: "relative",
          zIndex: 0,
          py: 0.75,
          px: 1,
          bgcolor: t.innerSurface,
          ...(borderless ? {} : { border: `1px solid ${t.innerBorder}` }),
          borderRadius,
          overflow: "hidden",
        }}
      >
        {children}
      </Box>

      {dragHandle && (
        <Tooltip title="Drag to reorder">
          <Box
            {...dragHandle.attributes}
            {...dragHandle.listeners}
            className="block-hover-control"
            sx={{
              ...controlSx,
              ...circleSx,
              position: "absolute",
              left: 0,
              top: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: DELETE_CONTROL_Z,
              cursor: "grab",
              "&:active": { cursor: "grabbing" },
              "&:hover": { color: "text.primary" },
            }}
          >
            <DragIndicatorIcon sx={{ fontSize: 14 }} />
          </Box>
        </Tooltip>
      )}

      {onDelete && canDelete && (
        <Tooltip title={deleteTooltip}>
          <Box
            component="button"
            type="button"
            onClick={onDelete}
            className={showDeleteAlways ? undefined : "block-hover-control"}
            sx={{
              ...(showDeleteAlways ? {} : controlSx),
              ...deleteCircleSx,
              position: "absolute",
              top: 0,
              right: 0,
              transform: "translate(50%, -50%)",
              zIndex: DELETE_CONTROL_Z,
              p: 0,
              m: 0,
              cursor: "pointer",
              "&:hover": { color: "text.primary" },
            }}
          >
            <CloseIcon sx={{ fontSize: 11 }} />
          </Box>
        </Tooltip>
      )}
    </Box>
  );
}
