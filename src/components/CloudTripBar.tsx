import { useMemo, useState } from "react";
import {
  Alert,
  Button,
  Chip,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import CloudDoneIcon from "@mui/icons-material/CloudDone";
import CloudOffIcon from "@mui/icons-material/CloudOff";
import CloudSyncIcon from "@mui/icons-material/CloudSync";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import IosShareIcon from "@mui/icons-material/IosShare";
import type { CloudSyncStatus } from "../hooks/useCloudTrip";
import { shareLinkFor } from "../services/tripCloud";
import type { ThemeMode } from "../types";
import { tokens } from "../theme";

interface CloudTripBarProps {
  configured: boolean;
  shareCode: string | null;
  syncStatus: CloudSyncStatus;
  error: string | null;
  themeMode: ThemeMode;
  onCreateSharedTrip: () => Promise<string | null>;
  onCopyShareLink: () => Promise<boolean>;
  onStopSharing: () => void;
}

const statusLabel: Record<CloudSyncStatus, string> = {
  local: "Not shared yet",
  loading: "Loading trip…",
  saving: "Saving…",
  saved: "Synced",
  error: "Sync error",
};

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    window.prompt("Copy this link and send it to your group:", text);
    return true;
  }
}

export function CloudTripBar({
  configured,
  shareCode,
  syncStatus,
  error,
  themeMode,
  onCreateSharedTrip,
  onCopyShareLink,
  onStopSharing,
}: CloudTripBarProps) {
  const t = tokens(themeMode);
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);

  const shareLink = useMemo(
    () => (shareCode ? shareLinkFor(shareCode) : null),
    [shareCode]
  );

  const flashCopied = () => {
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2500);
  };

  const handleShareTrip = async () => {
    if (shareLink) {
      const ok = await onCopyShareLink();
      if (ok) flashCopied();
      return;
    }

    setSharing(true);
    try {
      const code = await onCreateSharedTrip();
      if (code) {
        await copyText(shareLinkFor(code));
        flashCopied();
      }
    } finally {
      setSharing(false);
    }
  };

  const handleCopyLink = async () => {
    if (!shareLink) return;
    await copyText(shareLink);
    flashCopied();
  };

  return (
    <Paper
      elevation={0}
      sx={{
        px: 2,
        py: 1.25,
        borderRadius: "12px",
        boxShadow: t.cardShadow,
      }}
    >
      <Stack spacing={1}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          sx={{ alignItems: { xs: "stretch", sm: "center" } }}
        >
          <Stack direction="row" spacing={1} sx={{ alignItems: "center", flex: 1 }}>
            {configured ? (
              <CloudSyncIcon sx={{ fontSize: 18, color: "primary.main" }} />
            ) : (
              <CloudOffIcon sx={{ fontSize: 18, color: "text.secondary" }} />
            )}
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Share with group
            </Typography>
            {configured && shareCode && syncStatus !== "local" && (
              <Chip
                size="small"
                icon={
                  syncStatus === "saved" ? <CloudDoneIcon /> : <CloudSyncIcon />
                }
                label={statusLabel[syncStatus]}
                color={
                  syncStatus === "error"
                    ? "error"
                    : syncStatus === "saved"
                      ? "success"
                      : "default"
                }
                variant={syncStatus === "saved" ? "filled" : "outlined"}
              />
            )}
            {!configured && (
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Add Supabase keys to <code>.env</code>
              </Typography>
            )}
          </Stack>

          {configured && !shareLink && (
            <Button
              size="small"
              variant="contained"
              startIcon={<IosShareIcon />}
              disabled={sharing}
              onClick={() => void handleShareTrip()}
              sx={{ flexShrink: 0, alignSelf: { xs: "stretch", sm: "center" } }}
            >
              {sharing ? "Creating link…" : "Share trip"}
            </Button>
          )}
        </Stack>

        {configured && shareLink && (
          <Stack spacing={0.75}>
            <TextField
              size="small"
              fullWidth
              value={shareLink}
              slotProps={{
                input: {
                  readOnly: true,
                  sx: { fontSize: 13 },
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title="Copy link">
                        <IconButton size="small" onClick={() => void handleCopyLink()}>
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  ),
                },
              }}
              onFocus={(e) => e.target.select()}
            />
            <Stack
              direction="row"
              spacing={1}
              sx={{ alignItems: "center", justifyContent: "space-between" }}
            >
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {copied
                  ? "Link copied — paste it in WhatsApp, iMessage, etc."
                  : "Send this link to your friends. Opening it loads the same trip."}
              </Typography>
              <Button
                size="small"
                variant="text"
                sx={{ flexShrink: 0, fontSize: 12 }}
                onClick={onStopSharing}
              >
                Stop sharing
              </Button>
            </Stack>
          </Stack>
        )}

        {error && (
          <Alert severity="error" sx={{ py: 0 }}>
            {error}
          </Alert>
        )}
      </Stack>
    </Paper>
  );
}
