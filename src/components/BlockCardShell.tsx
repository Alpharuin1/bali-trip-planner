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
}

const CONTROL_SIZE = 22;
/** Half control size — bleed room in scroll areas without shrinking block width. */
export const BLOCK_CONTROL_BLEED = CONTROL_SIZE / 2 + 1;
const CONTROL_Z = 20;

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

  return (
    <Box
      sx={{
        position: "relative",
        overflow: "visible",
        width: "100%",
        isolation: "isolate",
        "&:hover": { zIndex: CONTROL_Z },
      }}
    >
      <Box
        sx={{
          position: "relative",
          zIndex: 0,
          p: 1,
          bgcolor: t.innerSurface,
          ...(borderless ? {} : { border: `1px solid ${t.innerBorder}` }),
          borderRadius,
          overflow: "visible",
          "&:hover .block-hover-control": {
            opacity: 1,
            pointerEvents: "auto",
          },
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
              zIndex: CONTROL_Z,
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
            className="block-hover-control"
            sx={{
              ...controlSx,
              ...circleSx,
              position: "absolute",
              top: 0,
              right: 0,
              transform: "translate(50%, -50%)",
              zIndex: CONTROL_Z,
              p: 0,
              m: 0,
              cursor: "pointer",
              "&:hover": { color: "text.primary" },
            }}
          >
            <CloseIcon sx={{ fontSize: 13 }} />
          </Box>
        </Tooltip>
      )}
    </Box>
  );
}
