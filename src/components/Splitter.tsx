import { Box, Tooltip } from "@mui/material";
import type { MouseEvent as ReactMouseEvent } from "react";

interface SplitterProps {
  onDrag: (deltaX: number) => void;
  onDoubleClick?: () => void;
}

export function Splitter({ onDrag, onDoubleClick }: SplitterProps) {
  const onMouseDown = (e: ReactMouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    let lastX = e.clientX;

    const onMove = (ev: MouseEvent) => {
      const dx = ev.clientX - lastX;
      if (dx !== 0) {
        onDrag(dx);
        lastX = ev.clientX;
      }
    };
    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  return (
    <Tooltip title="Drag to resize · double-click to reset" placement="top">
      <Box
        onMouseDown={onMouseDown}
        onDoubleClick={onDoubleClick}
        sx={{
          flex: "0 0 16px",
          width: 16,
          cursor: "col-resize",
          position: "relative",
          "&::before": {
            content: '""',
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 3,
            height: 44,
            bgcolor: "rgba(120, 120, 120, 0.32)",
            borderRadius: 1.5,
            transition: "background-color 0.15s",
          },
          "&:hover::before, &:active::before": {
            bgcolor: "primary.main",
          },
        }}
      />
    </Tooltip>
  );
}
