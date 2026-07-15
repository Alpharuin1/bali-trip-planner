import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  IconButton,
  InputAdornment,
  ListSubheader,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import CloudDoneIcon from "@mui/icons-material/CloudDone";
import CloudSyncIcon from "@mui/icons-material/CloudSync";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import EditIcon from "@mui/icons-material/Edit";
import GroupsIcon from "@mui/icons-material/Groups";
import IosShareIcon from "@mui/icons-material/IosShare";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import type { CloudSyncStatus } from "../hooks/useCloudTrip";
import { shareLinkFor } from "../services/tripCloud";
import { SQUAD_VIEW_ID, type PersonalProfile, type ThemeMode } from "../types";
import { stopTypingKeyPropagation } from "../utils/keyboard";
import { tokens } from "../theme";
import { PinInput } from "./PinInput";
import { isValidProfilePin } from "../utils/profilePasscode";

const DELETE_CONFIRM_WORD = "DELETE";
const TOOLBAR_CONTROL_HEIGHT = 34;

interface CloudTripBarProps {
  configured: boolean;
  shareCode: string | null;
  syncStatus: CloudSyncStatus;
  error: string | null;
  themeMode: ThemeMode;
  activeViewId: string;
  profiles: Record<string, PersonalProfile>;
  totalAccommodation: number;
  peopleCount: number;
  onActiveViewChange: (viewId: string) => void;
  onAddProfile: (
    name: string,
    passcode?: string,
    options?: { shareCode?: string }
  ) => Promise<{ ok: boolean; error?: string }>;
  onRenameProfile: (id: string, name: string) => void;
  onDeleteProfile: (id: string) => void;
  onCreateSharedTrip: () => Promise<string | null>;
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
  activeViewId,
  profiles,
  totalAccommodation,
  peopleCount,
  onActiveViewChange,
  onAddProfile,
  onRenameProfile,
  onDeleteProfile,
  onCreateSharedTrip,
  onStopSharing,
}: CloudTripBarProps) {
  const t = tokens(themeMode);
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareModalLink, setShareModalLink] = useState<string | null>(null);
  const [viewMenuOpen, setViewMenuOpen] = useState(false);

  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [wantPasscode, setWantPasscode] = useState(false);
  const [addPin, setAddPin] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const passcodeEnabled = configured;
  const addPinValid = !wantPasscode || isValidProfilePin(addPin);
  const canSubmitAdd = !!newName.trim() && addPinValid && !adding;

  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<PersonalProfile | null>(null);
  const [editName, setEditName] = useState("");

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PersonalProfile | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  const safePeople = Math.max(1, Math.floor(peopleCount || 1));
  const perPerson = totalAccommodation / safePeople;

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

  const shareLink = useMemo(
    () => (shareCode ? shareLinkFor(shareCode) : null),
    [shareCode]
  );

  const deleteConfirmed = deleteConfirm.trim() === DELETE_CONFIRM_WORD;

  const flashCopied = () => {
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2500);
  };

  const closeShareModal = () => {
    setShareModalOpen(false);
    setShareModalLink(null);
    setCopied(false);
  };

  const handleShareLinkClick = async () => {
    if (!configured) return;

    if (shareLink) {
      setShareModalLink(shareLink);
      setShareModalOpen(true);
      return;
    }

    setSharing(true);
    try {
      const code = await onCreateSharedTrip();
      if (code) {
        setShareModalLink(shareLinkFor(code));
        setShareModalOpen(true);
      }
    } finally {
      setSharing(false);
    }
  };

  const handleCopyLink = async () => {
    const link = shareModalLink ?? shareLink;
    if (!link) return;
    const ok = await copyText(link);
    if (ok) flashCopied();
  };

  const resetAddForm = () => {
    setNewName("");
    setWantPasscode(false);
    setAddPin("");
    setAddError(null);
  };

  const closeAddDialog = () => {
    setAddOpen(false);
    resetAddForm();
  };

  const submitAdd = async () => {
    const name = newName.trim();
    if (!name || !canSubmitAdd) return;

    if (wantPasscode && !isValidProfilePin(addPin)) {
      setAddError("Enter a 4-digit passcode.");
      return;
    }

    setAdding(true);
    setAddError(null);
    try {
      let activeShareCode = shareCode;
      if (wantPasscode && !activeShareCode) {
        activeShareCode = await onCreateSharedTrip();
        if (!activeShareCode) {
          setAddError("Could not share the trip. Try again or share from the top bar first.");
          return;
        }
      }

      const result = await onAddProfile(
        name,
        wantPasscode ? addPin : undefined,
        activeShareCode ? { shareCode: activeShareCode } : undefined
      );
      if (!result.ok) {
        setAddError(result.error ?? "Could not add profile.");
        return;
      }
      closeAddDialog();
    } finally {
      setAdding(false);
    }
  };

  const openEdit = (profile: PersonalProfile) => {
    setViewMenuOpen(false);
    setEditTarget(profile);
    setEditName(profile.name);
    setEditOpen(true);
  };

  const submitEdit = () => {
    if (!editTarget) return;
    const name = editName.trim();
    if (!name) return;
    onRenameProfile(editTarget.id, name);
    setEditOpen(false);
    setEditTarget(null);
    setEditName("");
  };

  const openDelete = (profile: PersonalProfile) => {
    setViewMenuOpen(false);
    setDeleteTarget(profile);
    setDeleteConfirm("");
    setDeleteOpen(true);
  };

  const closeDelete = () => {
    setDeleteOpen(false);
    setDeleteTarget(null);
    setDeleteConfirm("");
  };

  const submitDelete = () => {
    if (!deleteTarget || !deleteConfirmed) return;
    onDeleteProfile(deleteTarget.id);
    closeDelete();
  };

  return (
    <Paper
      elevation={0}
      sx={{
        px: 2,
        py: 1.25,
        borderRadius: "16px",
        boxShadow: t.cardShadow,
      }}
    >
      <Stack spacing={1}>
        <Stack
          direction="row"
          spacing={1.25}
          sx={{ alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}
        >
          <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap" }}>
            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 700,
                px: 1.25,
                py: 0.625,
                borderRadius: 2,
                bgcolor: t.surface,
                whiteSpace: "nowrap",
              }}
            >
              Accom: ₹{Math.round(totalAccommodation).toLocaleString()} · ₹
              {Math.round(perPerson).toLocaleString()}/pp ({safePeople})
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
          </Stack>

          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: "center", flexShrink: 0, ml: { xs: 0, sm: "auto" } }}
          >
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <Select
                displayEmpty
                inputProps={{ "aria-label": "View" }}
                open={viewMenuOpen}
                onOpen={() => setViewMenuOpen(true)}
                onClose={() => setViewMenuOpen(false)}
                value={
                  activeViewId === SQUAD_VIEW_ID || profiles[activeViewId]
                    ? activeViewId
                    : SQUAD_VIEW_ID
                }
                onChange={(e) => {
                  onActiveViewChange(e.target.value);
                  setViewMenuOpen(false);
                }}
                renderValue={() => viewLabel}
                MenuProps={{ slotProps: { paper: { sx: { minWidth: 260 } } } }}
                sx={{
                  height: TOOLBAR_CONTROL_HEIGHT,
                  bgcolor: t.surface,
                  borderRadius: 2,
                  "& .MuiSelect-select": {
                    py: 0,
                    px: 1.25,
                    minHeight: "unset",
                    display: "flex",
                    alignItems: "center",
                    boxSizing: "border-box",
                    height: TOOLBAR_CONTROL_HEIGHT,
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
                  <MenuItem
                    key={p.id}
                    value={p.id}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 1,
                      pr: 0.5,
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        flex: 1,
                        minWidth: 0,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                      }}
                    >
                      {p.hasPasscode && (
                        <LockOutlinedIcon sx={{ fontSize: 14, opacity: 0.65, flexShrink: 0 }} />
                      )}
                      {p.name}
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={0.25}
                      sx={{ flexShrink: 0 }}
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Tooltip title="Rename">
                        <IconButton
                          size="small"
                          aria-label={`Rename ${p.name}`}
                          onClick={() => openEdit(p)}
                        >
                          <EditIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete profile">
                        <IconButton
                          size="small"
                          aria-label={`Delete ${p.name}`}
                          onClick={() => openDelete(p)}
                          sx={{ color: "error.main" }}
                        >
                          <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Tooltip title="Add person">
              <IconButton
                size="small"
                onClick={() => setAddOpen(true)}
                sx={{
                  bgcolor: "primary.main",
                  color: "#fff",
                  width: 34,
                  height: 34,
                  borderRadius: 2,
                  "&:hover": { bgcolor: "primary.dark" },
                }}
              >
                <AddIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Divider
              orientation="vertical"
              flexItem
              sx={{ alignSelf: "stretch", my: 0.75, mx: 0.25 }}
            />

            <Button
              size="small"
              variant="contained"
              startIcon={<IosShareIcon />}
              disabled={!configured || sharing}
              onClick={() => void handleShareLinkClick()}
              sx={{ height: TOOLBAR_CONTROL_HEIGHT, minHeight: TOOLBAR_CONTROL_HEIGHT }}
            >
              {sharing ? "Creating link…" : "Share link"}
            </Button>
          </Stack>
        </Stack>

        {error && (
          <Alert severity="error" sx={{ py: 0 }}>
            {error}
          </Alert>
        )}
      </Stack>

      <Dialog
        open={shareModalOpen && !!shareModalLink}
        onClose={closeShareModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pr: 1,
          }}
        >
          Copy Link
          <IconButton aria-label="Close" onClick={closeShareModal} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 0.5 }}>
          <Stack spacing={1.5}>
            <TextField
              size="small"
              fullWidth
              value={shareModalLink ?? ""}
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
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {copied
                ? "Link copied — send it to your group"
                : "Friends open this link to see the same trip"}
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, justifyContent: "space-between" }}>
          <Button
            size="small"
            variant="text"
            sx={{ fontSize: 12 }}
            onClick={() => {
              onStopSharing();
              closeShareModal();
            }}
          >
            Stop sharing
          </Button>
          <Button variant="contained" startIcon={<ContentCopyIcon />} onClick={() => void handleCopyLink()}>
            Copy link
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={addOpen} onClose={closeAddDialog} maxWidth="xs" fullWidth>
        <DialogTitle>Add person</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={2.5}>
            <TextField
              autoFocus
              fullWidth
              size="small"
              label="Name"
              placeholder="e.g. Sahil"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                stopTypingKeyPropagation(e);
                if (e.key === "Enter" && canSubmitAdd) void submitAdd();
              }}
            />

            {passcodeEnabled && (
              <>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={wantPasscode}
                      onChange={(e) => {
                        setWantPasscode(e.target.checked);
                        if (!e.target.checked) setAddPin("");
                        setAddError(null);
                      }}
                    />
                  }
                  label="Require a passcode to view this plan"
                />

                {wantPasscode && (
                  <Stack spacing={1.5}>
                    {!shareCode && (
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>
                        A share link will be created when you add this person.
                      </Typography>
                    )}
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                      Choose a 4-digit passcode. Anyone opening this profile will need it.
                    </Typography>
                    <PinInput
                      value={addPin}
                      onChange={setAddPin}
                      disabled={adding}
                      autoFocus
                      error={addPin.length > 0 && !isValidProfilePin(addPin)}
                      idPrefix="add-pin"
                    />
                  </Stack>
                )}
              </>
            )}

            {addError && <Alert severity="error">{addError}</Alert>}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeAddDialog} disabled={adding}>
            Cancel
          </Button>
          <Button variant="contained" onClick={() => void submitAdd()} disabled={!canSubmitAdd}>
            {adding ? "Adding…" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Rename profile</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            size="small"
            label="Name"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={(e) => {
              stopTypingKeyPropagation(e);
              if (e.key === "Enter") submitEdit();
            }}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={submitEdit} disabled={!editName.trim()}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteOpen}
        onClose={closeDelete}
        maxWidth="xs"
        fullWidth
        aria-labelledby="delete-profile-title"
      >
        <DialogTitle id="delete-profile-title">Delete profile?</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            This permanently removes{" "}
            <strong>{deleteTarget?.name ?? "this profile"}</strong>&apos;s personal plan
            (outfits, packing notes, and day notes). This cannot be undone.
          </DialogContentText>
          <Typography variant="body2" sx={{ mb: 1.5, color: "text.secondary" }}>
            To confirm deletion, type{" "}
            <Box
              component="span"
              sx={{
                fontFamily: "monospace",
                fontWeight: 700,
                color: "text.primary",
                bgcolor: t.surface,
                px: 0.75,
                py: 0.25,
                borderRadius: 1,
              }}
            >
              {DELETE_CONFIRM_WORD}
            </Box>{" "}
            below.
          </Typography>
          <TextField
            autoFocus
            fullWidth
            size="small"
            placeholder={DELETE_CONFIRM_WORD}
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.value)}
            onKeyDown={stopTypingKeyPropagation}
            error={deleteConfirm.length > 0 && !deleteConfirmed}
            helperText={
              deleteConfirm.length > 0 && !deleteConfirmed
                ? `Type ${DELETE_CONFIRM_WORD} exactly to enable delete`
                : " "
            }
            slotProps={{
              htmlInput: {
                "aria-label": `Type ${DELETE_CONFIRM_WORD} to confirm deletion`,
                autoComplete: "off",
                spellCheck: false,
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeDelete}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            disabled={!deleteConfirmed}
            onClick={submitDelete}
          >
            Delete profile
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
