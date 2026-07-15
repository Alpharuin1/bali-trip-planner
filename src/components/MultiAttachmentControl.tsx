import { useRef, useState } from "react";
import {
  Box,
  Button,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import CloseIcon from "@mui/icons-material/Close";
import type { FileAttachment, ThemeMode } from "../types";
import {
  BOOKING_ATTACHMENT_ACCEPT,
  fileToAttachment,
  isImageAttachment,
} from "../utils/attachments";
import { tokens } from "../theme";
import { PdfViewerDialog } from "./PdfViewerDialog";

interface MultiAttachmentControlProps {
  attachments: FileAttachment[];
  mode: ThemeMode;
  onChange: (attachments: FileAttachment[]) => void;
  buttonLabel?: string;
}

function AttachmentRow({
  attachment,
  mode,
  onRemove,
}: {
  attachment: FileAttachment;
  mode: ThemeMode;
  onRemove: () => void;
}) {
  const t = tokens(mode);
  const [showActions, setShowActions] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const AttachmentIcon = isImageAttachment(attachment)
    ? ImageOutlinedIcon
    : PictureAsPdfOutlinedIcon;

  return (
    <>
      <Box
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.25,
          py: 0.25,
          px: 0.5,
          mx: -0.5,
          borderRadius: 1,
          "&:hover": { bgcolor: t.surface },
        }}
      >
        <AttachmentIcon sx={{ fontSize: 15, color: "text.secondary", flexShrink: 0 }} />
        <Button
          variant="text"
          size="small"
          onClick={() => setViewerOpen(true)}
          sx={{
            flex: 1,
            minWidth: 0,
            justifyContent: "flex-start",
            px: 0,
            py: 0,
            fontSize: 12,
            fontWeight: 500,
            textTransform: "none",
            color: "text.primary",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {attachment.name}
        </Button>
        <Stack
          direction="row"
          spacing={0.25}
          sx={{
            flexShrink: 0,
            opacity: showActions ? 1 : 0,
            transition: "opacity 0.15s ease",
            pointerEvents: showActions ? "auto" : "none",
          }}
        >
          <Tooltip title="Remove file">
            <IconButton size="small" onClick={onRemove} sx={{ p: 0.375 }}>
              <CloseIcon sx={{ fontSize: 15 }} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>
      <PdfViewerDialog
        attachment={attachment}
        open={viewerOpen}
        onClose={() => setViewerOpen(false)}
      />
    </>
  );
}

export function MultiAttachmentControl({
  attachments,
  mode,
  onChange,
  buttonLabel = "Attach file",
}: MultiAttachmentControlProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePick = async (file: File | null) => {
    if (!file) return;
    try {
      setError(null);
      const next = await fileToAttachment(file);
      onChange([...attachments, next]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not attach file.");
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const removeAt = (index: number) => {
    onChange(attachments.filter((_, i) => i !== index));
  };

  return (
    <Stack spacing={0.5}>
      {attachments.map((attachment, i) => (
        <AttachmentRow
          key={`${attachment.name}-${i}`}
          attachment={attachment}
          mode={mode}
          onRemove={() => removeAt(i)}
        />
      ))}

      <input
        ref={inputRef}
        type="file"
        hidden
        accept={BOOKING_ATTACHMENT_ACCEPT}
        onChange={(e) => void handlePick(e.target.files?.[0] ?? null)}
      />
      <Button
        variant="text"
        size="small"
        onClick={() => inputRef.current?.click()}
        disableRipple
        sx={{
          alignSelf: "flex-start",
          display: "inline-flex",
          alignItems: "center",
          gap: 0.375,
          px: 0.25,
          py: 0.25,
          minWidth: 0,
          fontSize: 12,
          textTransform: "none",
          color: "text.secondary",
          "&:hover": {
            bgcolor: "transparent",
            color: "text.primary",
          },
        }}
      >
        <AddIcon sx={{ fontSize: 14 }} />
        {buttonLabel}
      </Button>
      {error ? (
        <Typography variant="caption" color="error" sx={{ lineHeight: 1.3 }}>
          {error}
        </Typography>
      ) : null}
    </Stack>
  );
}
