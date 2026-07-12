import { useCallback, useEffect, useRef, useState } from "react";
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import type { FileAttachment } from "../types";
import { downloadAttachment, isImageAttachment } from "../utils/attachments";
import { useIsMobile } from "../hooks/useIsMobile";

interface PdfViewerDialogProps {
  attachment: FileAttachment | null;
  open: boolean;
  onClose: () => void;
}

function touchDistance(a: { clientX: number; clientY: number }, b: { clientX: number; clientY: number }): number {
  return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
}

function PinchZoomImage({ src, alt, resetKey }: { src: string; alt: string; resetKey: string }) {
  const [{ scale, x, y }, setTransform] = useState({ scale: 1, x: 0, y: 0 });
  const pinchRef = useRef<{ distance: number; scale: number } | null>(null);
  const panRef = useRef<{ startX: number; startY: number; x: number; y: number } | null>(null);

  useEffect(() => {
    setTransform({ scale: 1, x: 0, y: 0 });
  }, [resetKey]);

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2) {
        pinchRef.current = {
          distance: touchDistance(e.touches[0], e.touches[1]),
          scale,
        };
        panRef.current = null;
      } else if (e.touches.length === 1 && scale > 1) {
        panRef.current = { startX: e.touches[0].clientX, startY: e.touches[0].clientY, x, y };
        pinchRef.current = null;
      }
    },
    [scale, x, y]
  );

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchRef.current) {
      e.preventDefault();
      const distance = touchDistance(e.touches[0], e.touches[1]);
      const nextScale = Math.min(
        4,
        Math.max(1, pinchRef.current.scale * (distance / pinchRef.current.distance))
      );
      setTransform((current) => ({ ...current, scale: nextScale }));
      return;
    }

    if (e.touches.length === 1 && panRef.current) {
      e.preventDefault();
      const dx = e.touches[0].clientX - panRef.current.startX;
      const dy = e.touches[0].clientY - panRef.current.startY;
      setTransform((current) => ({
        ...current,
        x: panRef.current!.x + dx,
        y: panRef.current!.y + dy,
      }));
    }
  }, []);

  const onTouchEnd = useCallback(() => {
    pinchRef.current = null;
    panRef.current = null;
    setTransform((current) =>
      current.scale <= 1 ? { scale: 1, x: 0, y: 0 } : current
    );
  }, []);

  return (
    <Box
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      sx={{
        minHeight: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        touchAction: "none",
      }}
    >
      <Box
        component="img"
        src={src}
        alt={alt}
        draggable={false}
        sx={{
          display: "block",
          maxWidth: "100%",
          height: "auto",
          transform: `translate(${x}px, ${y}px) scale(${scale})`,
          transformOrigin: "center center",
          userSelect: "none",
        }}
      />
    </Box>
  );
}

export function PdfViewerDialog({ attachment, open, onClose }: PdfViewerDialogProps) {
  const isMobile = useIsMobile();

  if (!attachment) return null;

  const isImage = isImageAttachment(attachment);
  const viewerHeight = "calc(100dvh - 8px - 52px)";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      scroll="paper"
      disableScrollLock={isMobile}
      slotProps={{
        paper: {
          sx: {
            m: "4px",
            width: "calc(100% - 8px)",
            height: "calc(100% - 8px)",
            maxWidth: "calc(100% - 8px)",
            maxHeight: "calc(100% - 8px)",
            display: "flex",
            flexDirection: "column",
          },
        },
      }}
    >
      <DialogTitle sx={{ pr: 1, py: 1, flexShrink: 0 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <Typography
            variant="subtitle2"
            sx={{
              flex: 1,
              minWidth: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {attachment.name}
          </Typography>
          <Tooltip title="Download">
            <IconButton size="small" onClick={() => downloadAttachment(attachment)}>
              <FileDownloadOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <IconButton size="small" onClick={onClose} aria-label="Close">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent
        sx={{
          flex: 1,
          minHeight: 0,
          p: 0,
          overflow: isImage && isMobile ? "hidden" : "auto",
          WebkitOverflowScrolling: "touch",
          touchAction: isImage && isMobile ? "none" : "pan-x pan-y pinch-zoom",
          bgcolor: "background.default",
        }}
      >
        {isImage ? (
          isMobile ? (
            <PinchZoomImage
              src={attachment.dataUrl}
              alt={attachment.name}
              resetKey={attachment.dataUrl}
            />
          ) : (
            <Box
              component="img"
              src={attachment.dataUrl}
              alt={attachment.name}
              sx={{
                display: "block",
                width: "100%",
                height: "auto",
              }}
            />
          )
        ) : isMobile ? (
          <Box
            component="embed"
            src={attachment.dataUrl}
            type="application/pdf"
            title={attachment.name}
            sx={{
              display: "block",
              width: "100%",
              height: viewerHeight,
              minHeight: viewerHeight,
              border: 0,
              bgcolor: "background.paper",
            }}
          />
        ) : (
          <Box
            component="iframe"
            src={attachment.dataUrl}
            title={attachment.name}
            sx={{
              display: "block",
              width: "100%",
              height: viewerHeight,
              minHeight: viewerHeight,
              border: 0,
              bgcolor: "background.paper",
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
