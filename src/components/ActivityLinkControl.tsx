import { useRef, useState } from "react";
import {
  Box,
  Button,
  IconButton,
  Link,
  Stack,
  TextField,
  Tooltip,
  type SxProps,
  type Theme,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import type { ThemeMode } from "../types";
import { linkLabel, normalizeUrl } from "../utils/links";
import { stopTypingKeyPropagation, stopTypingInputPropagation } from "../utils/keyboard";
import { tokens } from "../theme";

interface ActivityLinkControlProps {
  url: string;
  mode: ThemeMode;
  onChange: (url: string) => void;
  /** Show URL field directly instead of "+ Add link" button when empty */
  inline?: boolean;
  textFieldSx?: SxProps<Theme>;
}

function LinkInputRow({
  value,
  onChange,
  onConfirm,
  onCancel,
  textFieldSx,
  autoFocus = false,
}: {
  value: string;
  onChange: (value: string) => void;
  onConfirm: () => void;
  onCancel?: () => void;
  textFieldSx?: SxProps<Theme>;
  autoFocus?: boolean;
}) {
  return (
    <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
      <TextField
        autoFocus={autoFocus}
        fullWidth
        size="small"
        placeholder="https://..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          stopTypingKeyPropagation(e);
          if (e.key === "Enter") onConfirm();
          if (e.key === "Escape") onCancel?.();
        }}
        onInput={stopTypingInputPropagation}
        sx={textFieldSx}
      />
      <IconButton size="small" color="primary" onClick={onConfirm}>
        <CheckIcon fontSize="small" />
      </IconButton>
    </Stack>
  );
}

function LinkRow({
  url,
  mode,
  onEdit,
  onDelete,
}: {
  url: string;
  mode: ThemeMode;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const t = tokens(mode);
  const [showActions, setShowActions] = useState(false);
  const hoverTimer = useRef<number | null>(null);

  const startHover = () => {
    if (hoverTimer.current) window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => setShowActions(true), 450);
  };

  const endHover = () => {
    if (hoverTimer.current) window.clearTimeout(hoverTimer.current);
    setShowActions(false);
  };

  return (
    <Box
      onMouseEnter={startHover}
      onMouseLeave={endHover}
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
      <Link
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        underline="hover"
        sx={{
          flex: 1,
          minWidth: 0,
          fontSize: 12,
          fontWeight: 500,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {linkLabel(url)}
      </Link>
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
        <Tooltip title="Edit link">
          <IconButton size="small" onClick={onEdit} sx={{ p: 0.375 }}>
            <EditOutlinedIcon sx={{ fontSize: 15 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Remove link">
          <IconButton size="small" onClick={onDelete} sx={{ p: 0.375 }}>
            <CloseIcon sx={{ fontSize: 15 }} />
          </IconButton>
        </Tooltip>
      </Stack>
    </Box>
  );
}

export function ActivityLinkControl({
  url,
  mode,
  onChange,
  inline = false,
  textFieldSx,
}: ActivityLinkControlProps) {
  const saved = url.trim();
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const [editing, setEditing] = useState(false);
  const [editDraft, setEditDraft] = useState("");

  const confirmAdd = () => {
    const next = normalizeUrl(draft);
    if (!next) return;
    onChange(next);
    setDraft("");
    setAdding(false);
  };

  const confirmEdit = () => {
    const next = normalizeUrl(editDraft);
    if (!next) return;
    onChange(next);
    setEditing(false);
    setEditDraft("");
  };

  if (editing) {
    return (
      <LinkInputRow
        value={editDraft}
        onChange={setEditDraft}
        onConfirm={confirmEdit}
        onCancel={() => {
          setEditing(false);
          setEditDraft("");
        }}
        textFieldSx={textFieldSx}
        autoFocus
      />
    );
  }

  if (saved) {
    return (
      <LinkRow
        url={saved}
        mode={mode}
        onEdit={() => {
          setEditing(true);
          setEditDraft(saved);
          setAdding(false);
        }}
        onDelete={() => onChange("")}
      />
    );
  }

  if (adding || inline) {
    return (
      <LinkInputRow
        value={draft}
        onChange={setDraft}
        onConfirm={confirmAdd}
        onCancel={
          inline
            ? undefined
            : () => {
                setAdding(false);
                setDraft("");
              }
        }
        textFieldSx={textFieldSx}
        autoFocus={!inline}
      />
    );
  }

  return (
    <Button
      variant="text"
      size="small"
      onClick={() => setAdding(true)}
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
      Add link
    </Button>
  );
}
