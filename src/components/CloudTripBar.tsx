import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import CloudDoneIcon from "@mui/icons-material/CloudDone";
import CloudOffIcon from "@mui/icons-material/CloudOff";
import CloudSyncIcon from "@mui/icons-material/CloudSync";
import LinkIcon from "@mui/icons-material/Link";
import LoginIcon from "@mui/icons-material/Login";
import type { CloudSyncStatus } from "../hooks/useCloudTrip";
import type { ThemeMode } from "../types";
import { tokens } from "../theme";

interface CloudTripBarProps {
  configured: boolean;
  shareCode: string | null;
  syncStatus: CloudSyncStatus;
  error: string | null;
  themeMode: ThemeMode;
  onCreateSharedTrip: () => Promise<string | null>;
  onJoinTrip: (code: string) => Promise<boolean>;
  onCopyShareLink: () => Promise<boolean>;
  onStopSharing: () => void;
}

const statusLabel: Record<CloudSyncStatus, string> = {
  local: "Local only",
  loading: "Loading…",
  saving: "Saving…",
  saved: "Saved to cloud",
  error: "Sync error",
};

const statusColor: Record<
  CloudSyncStatus,
  "default" | "info" | "success" | "warning" | "error"
> = {
  local: "default",
  loading: "info",
  saving: "warning",
  saved: "success",
  error: "error",
};

export function CloudTripBar({
  configured,
  shareCode,
  syncStatus,
  error,
  themeMode,
  onCreateSharedTrip,
  onJoinTrip,
  onCopyShareLink,
  onStopSharing,
}: CloudTripBarProps) {
  const t = tokens(themeMode);
  const [joinOpen, setJoinOpen] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const ok = await onCopyShareLink();
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleJoin = async () => {
    const ok = await onJoinTrip(joinCode);
    if (ok) {
      setJoinOpen(false);
      setJoinCode("");
    }
  };

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          px: 2,
          py: 1,
          borderRadius: "12px",
          boxShadow: t.cardShadow,
        }}
      >
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
              Cloud sync
            </Typography>
            {!configured ? (
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Add Supabase keys to <code>.env</code> — see README
              </Typography>
            ) : shareCode ? (
              <>
                <Chip
                  size="small"
                  label={`Code: ${shareCode}`}
                  variant="outlined"
                />
                <Chip
                  size="small"
                  icon={
                    syncStatus === "saved" ? (
                      <CloudDoneIcon />
                    ) : (
                      <CloudSyncIcon />
                    )
                  }
                  label={statusLabel[syncStatus]}
                  color={statusColor[syncStatus]}
                  variant={syncStatus === "local" ? "outlined" : "filled"}
                />
              </>
            ) : (
              <Chip size="small" label={statusLabel[syncStatus]} variant="outlined" />
            )}
          </Stack>

          {configured && (
            <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
              {shareCode ? (
                <>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<LinkIcon />}
                    onClick={handleCopy}
                  >
                    {copied ? "Link copied" : "Copy link"}
                  </Button>
                  <Button size="small" variant="outlined" onClick={onStopSharing}>
                    Stop syncing
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => void onCreateSharedTrip()}
                  >
                    Share trip
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<LoginIcon />}
                    onClick={() => setJoinOpen(true)}
                  >
                    Join trip
                  </Button>
                </>
              )}
            </Stack>
          )}
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mt: 1, py: 0 }}>
            {error}
          </Alert>
        )}
      </Paper>

      <Dialog open={joinOpen} onClose={() => setJoinOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Join a shared trip</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 0.5 }}>
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
              Paste the share code from a link, or open a URL with{" "}
              <code>?trip=CODE</code> directly.
            </Typography>
            <TextField
              autoFocus
              fullWidth
              label="Share code"
              placeholder="e.g. A1B2C3D4"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => {
                if (e.key === "Enter") void handleJoin();
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setJoinOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => void handleJoin()}>
            Join
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
