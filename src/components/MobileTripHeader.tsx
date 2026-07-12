import { useMemo, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  ButtonGroup,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  FormControl,
  ListSubheader,
  Menu,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import GroupsIcon from "@mui/icons-material/Groups";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import { SQUAD_VIEW_ID, type PersonalProfile, type Plan, type ThemeMode } from "../types";
import { addDays, fmtDate, fmtDay, parseISO } from "../utils/date";
import { formatDayRouteLabel } from "../utils/plan";
import type { TripSnapshot } from "../services/tripCloud";
import {
  buildOfflineBundle,
  countEmbeddedPdfs,
  downloadOfflineBundle,
  parseOfflineBundleFile,
} from "../utils/tripExport";
import { tokens } from "../theme";

const MOBILE_HEADER_CONTROL_HEIGHT = 40;
const MOBILE_HEADER_RADIUS = "8px";

interface MobileTripHeaderProps {
  plan: Plan;
  dayIndex: number;
  activeViewId: string;
  profiles: Record<string, PersonalProfile>;
  themeMode: ThemeMode;
  snapshot: TripSnapshot;
  onActiveViewChange: (viewId: string) => void;
  onImportSnapshot: (snapshot: TripSnapshot) => void;
}

export function MobileTripHeader({
  plan,
  dayIndex,
  activeViewId,
  profiles,
  themeMode,
  snapshot,
  onActiveViewChange,
  onImportSnapshot,
}: MobileTripHeaderProps) {
  const t = tokens(themeMode);
  const importRef = useRef<HTMLInputElement>(null);
  const [downloadMenuAnchor, setDownloadMenuAnchor] = useState<HTMLElement | null>(null);
  const [message, setMessage] = useState<{ kind: "success" | "error"; text: string } | null>(
    null
  );
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingMeta, setPendingMeta] = useState<{ pdfCount: number; exportedAt: string } | null>(
    null
  );

  const profileList = useMemo(
    () =>
      Object.values(profiles).sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
      ),
    [profiles]
  );

  const viewLabel =
    activeViewId === SQUAD_VIEW_ID
      ? "Squad"
      : (profiles[activeViewId]?.name ?? "Profile");

  const squadDay = plan.days[dayIndex];
  const routeLabel = squadDay
    ? formatDayRouteLabel(squadDay.place, squadDay.endPlace)
    : null;
  const currentDate = addDays(parseISO(plan.startDate), dayIndex);
  const isSquadView = activeViewId === SQUAD_VIEW_ID;
  const dayOverline = isSquadView
    ? `Day ${dayIndex + 1} – ${fmtDate(currentDate)}`
    : `${fmtDate(currentDate)}, ${fmtDay(currentDate)}`;

  const handleDownload = () => {
    try {
      downloadOfflineBundle(buildOfflineBundle(snapshot));
      const pdfCount = countEmbeddedPdfs(snapshot);
      setMessage({
        kind: "success",
        text:
          pdfCount > 0
            ? `Downloaded backup with ${pdfCount} booking PDF${pdfCount === 1 ? "" : "s"}.`
            : "Downloaded offline backup.",
      });
    } catch (err: unknown) {
      setMessage({
        kind: "error",
        text: err instanceof Error ? err.message : "Could not download backup.",
      });
    }
  };

  const handleFilePick = async (file: File | null) => {
    if (!file) return;
    try {
      const bundle = await parseOfflineBundleFile(file);
      setPendingFile(file);
      setPendingMeta({
        pdfCount: countEmbeddedPdfs(bundle.snapshot),
        exportedAt: bundle.exportedAt
          ? new Date(bundle.exportedAt).toLocaleString()
          : "unknown date",
      });
      setConfirmOpen(true);
    } catch (err: unknown) {
      setMessage({
        kind: "error",
        text: err instanceof Error ? err.message : "Could not read backup.",
      });
    } finally {
      if (importRef.current) importRef.current.value = "";
    }
  };

  const confirmImport = () => {
    if (!pendingFile) return;
    void (async () => {
      try {
        const bundle = await parseOfflineBundleFile(pendingFile);
        onImportSnapshot(bundle.snapshot);
        const pdfCount = countEmbeddedPdfs(bundle.snapshot);
        setMessage({
          kind: "success",
          text:
            pdfCount > 0
              ? `Loaded backup with ${pdfCount} booking PDF${pdfCount === 1 ? "" : "s"}.`
              : "Loaded offline backup.",
        });
      } catch (err: unknown) {
        setMessage({
          kind: "error",
          text: err instanceof Error ? err.message : "Could not load backup.",
        });
      } finally {
        setConfirmOpen(false);
        setPendingFile(null);
        setPendingMeta(null);
      }
    })();
  };

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          flexShrink: 0,
          px: 1.5,
          py: 1.25,
          borderRadius: 0,
          borderBottom: `1px solid ${t.innerBorder}`,
          boxShadow: "none",
          bgcolor: "background.paper",
          pt: "calc(12px + env(safe-area-inset-top))",
        }}
      >
        <Stack spacing={0}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", width: "100%" }}>
            <FormControl size="small" sx={{ flex: 1, minWidth: 0 }}>
              <Select
                value={
                  activeViewId === SQUAD_VIEW_ID || profiles[activeViewId]
                    ? activeViewId
                    : SQUAD_VIEW_ID
                }
                onChange={(e) => onActiveViewChange(e.target.value)}
                displayEmpty
                fullWidth
                inputProps={{ "aria-label": "Select profile" }}
                renderValue={() => viewLabel}
                sx={{
                  bgcolor: t.surface,
                  height: MOBILE_HEADER_CONTROL_HEIGHT,
                  borderRadius: MOBILE_HEADER_RADIUS,
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: t.innerBorder,
                    borderRadius: MOBILE_HEADER_RADIUS,
                  },
                  "& .MuiSelect-select": {
                    py: 0,
                    px: 1.25,
                    height: MOBILE_HEADER_CONTROL_HEIGHT,
                    boxSizing: "border-box",
                    display: "flex",
                    alignItems: "center",
                  },
                }}
              >
                <MenuItem value={SQUAD_VIEW_ID}>
                  <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
                    <GroupsIcon sx={{ fontSize: 16, opacity: 0.7 }} />
                    <span>Squad</span>
                  </Stack>
                </MenuItem>
                {profileList.length > 0 && <Divider sx={{ my: 0.5 }} />}
                {profileList.length > 0 && (
                  <ListSubheader sx={{ lineHeight: 2, fontSize: 11 }}>
                    Personal plans
                  </ListSubheader>
                )}
                {profileList.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
                      {p.hasPasscode ? (
                        <LockOutlinedIcon sx={{ fontSize: 14, opacity: 0.65 }} />
                      ) : null}
                      <span>{p.name}</span>
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <ButtonGroup
                fullWidth
                variant="outlined"
                size="small"
                sx={{
                  height: MOBILE_HEADER_CONTROL_HEIGHT,
                  boxShadow: "none",
                  "& .MuiButtonGroup-grouped": {
                    minHeight: MOBILE_HEADER_CONTROL_HEIGHT,
                    borderColor: t.innerBorder,
                    textTransform: "none",
                  },
                  "& .MuiButtonGroup-grouped:first-of-type": {
                    borderRadius: `${MOBILE_HEADER_RADIUS} 0 0 ${MOBILE_HEADER_RADIUS}`,
                    flex: 1,
                    minWidth: 0,
                    px: 1,
                  },
                  "& .MuiButtonGroup-grouped:last-of-type": {
                    borderRadius: `0 ${MOBILE_HEADER_RADIUS} ${MOBILE_HEADER_RADIUS} 0`,
                    flex: "0 0 36px",
                    minWidth: 36,
                    px: 0,
                  },
                }}
              >
                <Button onClick={handleDownload}>Download</Button>
                <Button
                  aria-label="Download options"
                  aria-haspopup="menu"
                  onClick={(e) => setDownloadMenuAnchor(e.currentTarget)}
                >
                  <ArrowDropDownIcon sx={{ fontSize: 20 }} />
                </Button>
              </ButtonGroup>
            </Box>
          </Stack>

          <Box sx={{ py: 1.5, width: "100%" }}>
            <Divider sx={{ borderColor: t.innerBorder }} />
          </Box>

          <Box sx={{ minWidth: 0, pb: 0.25 }}>
            <Typography
              sx={{ fontSize: 13, color: "text.secondary", fontWeight: 600, lineHeight: 1.35 }}
            >
              {dayOverline}
            </Typography>
            {routeLabel ? (
              <Typography
                sx={{
                  fontSize: 18,
                  fontWeight: 700,
                  mt: 0.375,
                  lineHeight: 1.3,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {routeLabel}
              </Typography>
            ) : null}
          </Box>

          {message ? (
            <Alert
              severity={message.kind}
              onClose={() => setMessage(null)}
              sx={{ py: 0, "& .MuiAlert-message": { fontSize: 12 } }}
            >
              {message.text}
            </Alert>
          ) : null}
        </Stack>
      </Paper>

      <Menu
        anchorEl={downloadMenuAnchor}
        open={Boolean(downloadMenuAnchor)}
        onClose={() => setDownloadMenuAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem
          onClick={() => {
            setDownloadMenuAnchor(null);
            importRef.current?.click();
          }}
        >
          <FileUploadOutlinedIcon sx={{ fontSize: 18, mr: 1, opacity: 0.75 }} />
          Load backup
        </MenuItem>
      </Menu>

      <input
        ref={importRef}
        type="file"
        hidden
        accept=".json,.btp.json,application/json"
        onChange={(e) => void handleFilePick(e.target.files?.[0] ?? null)}
      />

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Load offline backup?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This replaces your current trip on this device with the backup
            {pendingMeta?.exportedAt ? ` from ${pendingMeta.exportedAt}` : ""}.
            {pendingMeta && pendingMeta.pdfCount > 0
              ? ` It includes ${pendingMeta.pdfCount} booking PDF${pendingMeta.pdfCount === 1 ? "" : "s"}.`
              : ""}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={confirmImport}>
            Load backup
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
