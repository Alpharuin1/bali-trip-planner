import { useRef, useState } from "react";
import {
  Paper,
  Stack,
  Typography,
  FormControl,
  Select,
  MenuItem,
  TextField,
  IconButton,
  Tooltip,
  Box,
  ToggleButtonGroup,
  ToggleButton,
  Menu,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditNoteIcon from "@mui/icons-material/EditNote";
import ViewAgendaIcon from "@mui/icons-material/ViewAgenda";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import { parseISO } from "../utils/date";
import type { ThemeMode, ViewMode } from "../types";
import { stopTypingKeyPropagation } from "../utils/keyboard";
import { tokens } from "../theme";
import { colorForTemplate } from "../utils/palette";

interface TopBarProps {
  country: string;
  startDate: string;
  endDate: string;
  templates: string[];
  activeTemplate: string;
  mode: ViewMode;
  themeMode: ThemeMode;
  totalAccommodation: number;
  peopleCount: number;
  onStartDateChange: (v: string) => void;
  onEndDateChange: (v: string) => void;
  onActiveTemplateChange: (v: string) => void;
  onAddTemplate: () => void;
  onDuplicateTemplate: () => void;
  onRenameTemplate: (next: string) => void;
  onDeleteTemplate: () => void;
  onModeChange: (m: ViewMode) => void;
  onThemeModeChange: (m: ThemeMode) => void;
  onExport: () => void;
  onImport: (file: File) => void;
}

export function TopBar({
  country,
  startDate,
  endDate,
  templates,
  activeTemplate,
  mode,
  themeMode,
  totalAccommodation,
  peopleCount,
  onStartDateChange,
  onEndDateChange,
  onActiveTemplateChange,
  onAddTemplate,
  onDuplicateTemplate,
  onRenameTemplate,
  onDeleteTemplate,
  onModeChange,
  onThemeModeChange,
  onExport,
  onImport,
}: TopBarProps) {
  const t = tokens(themeMode);
  const safePeople = Math.max(1, Math.floor(peopleCount || 1));
  const perPerson = totalAccommodation / safePeople;
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameVal, setRenameVal] = useState(activeTemplate);

  const closeMenu = () => setMenuAnchor(null);
  const openRename = () => {
    setRenameVal(activeTemplate);
    setRenameOpen(true);
    closeMenu();
  };
  const submitRename = () => {
    const v = renameVal.trim();
    if (v && v !== activeTemplate && !templates.includes(v)) {
      onRenameTemplate(v);
    }
    setRenameOpen(false);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) onImport(f);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <Paper
      elevation={0}
      sx={{
        px: 2.5,
        py: 1.5,
        borderRadius: "16px",
        boxShadow: t.cardShadow,
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 3,
      }}
    >
      {/* Country */}
      <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
        <Typography sx={{ fontSize: 13, fontWeight: 600, color: "text.secondary" }}>
          Country Selector:
        </Typography>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <Select value={country} disabled>
            <MenuItem value="Bali">Bali</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {/* Date range — applies to the active template */}
      <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
        <Typography sx={{ fontSize: 13, fontWeight: 600, color: "text.secondary" }}>
          Date Range Selector:
        </Typography>
        <TextField
          size="small"
          type="date"
          value={startDate}
          onChange={(e) => {
            const v = e.target.value;
            onStartDateChange(v);
            if (parseISO(v) > parseISO(endDate)) onEndDateChange(v);
          }}
          onKeyDown={stopTypingKeyPropagation}
          sx={{ width: 150 }}
        />
        <Typography sx={{ color: "text.secondary" }}>—</Typography>
        <TextField
          size="small"
          type="date"
          value={endDate}
          onChange={(e) => {
            const v = e.target.value;
            if (parseISO(v) < parseISO(startDate)) return;
            onEndDateChange(v);
          }}
          onKeyDown={stopTypingKeyPropagation}
          sx={{ width: 150 }}
        />
      </Stack>

      {/* Right cluster: template menu + add + mode toggle + theme + IO */}
      <Stack
        direction="row"
        spacing={1.25}
        sx={{ ml: "auto", alignItems: "center" }}
      >
        <Typography sx={{ fontSize: 13, fontWeight: 600, color: "text.secondary" }}>
          Trip Template:
        </Typography>
        <FormControl size="small" sx={{ minWidth: 130 }}>
          <Select
            value={activeTemplate}
            onChange={(e) => onActiveTemplateChange(e.target.value)}
            renderValue={(name) => (
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    bgcolor: colorForTemplate(name as string, templates),
                  }}
                />
                <span>{name as string}</span>
              </Stack>
            )}
          >
            {templates.map((tpl) => (
              <MenuItem key={tpl} value={tpl}>
                <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      bgcolor: colorForTemplate(tpl, templates),
                    }}
                  />
                  <span>{tpl}</span>
                </Stack>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Typography
          sx={{
            fontSize: 12,
            fontWeight: 700,
            color: "text.primary",
            px: 1,
            py: 0.5,
            borderRadius: 2,
            bgcolor: t.surface,
            whiteSpace: "nowrap",
          }}
        >
          Accom: ₹{Math.round(totalAccommodation).toLocaleString()} · ₹
          {Math.round(perPerson).toLocaleString()}/pp ({safePeople})
        </Typography>

        <Tooltip title="Add a new template">
          <IconButton
            onClick={onAddTemplate}
            sx={{
              bgcolor: "primary.main",
              color: "#fff",
              width: 32,
              height: 32,
              borderRadius: 2,
              "&:hover": { bgcolor: "primary.dark" },
            }}
          >
            <AddIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Template options">
          <IconButton
            onClick={(e) => setMenuAnchor(e.currentTarget)}
            size="small"
            sx={{ width: 32, height: 32 }}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={closeMenu}
        >
          <MenuItem onClick={openRename}>
            <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Rename "{activeTemplate}"</ListItemText>
          </MenuItem>
          <MenuItem
            onClick={() => {
              onDuplicateTemplate();
              closeMenu();
            }}
          >
            <ListItemIcon><ContentCopyIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Duplicate</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem
            disabled={templates.length <= 1}
            onClick={() => {
              onDeleteTemplate();
              closeMenu();
            }}
            sx={{ color: "error.main" }}
          >
            <ListItemIcon>
              <DeleteOutlineIcon fontSize="small" sx={{ color: "error.main" }} />
            </ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </MenuItem>
        </Menu>

        <ToggleButtonGroup
          value={mode}
          exclusive
          size="small"
          onChange={(_, v: ViewMode | null) => v && onModeChange(v)}
          sx={{
            ml: 1,
            "& .MuiToggleButton-root": {
              textTransform: "none",
              fontSize: 12,
              px: 1.25,
              py: 0.5,
              borderColor: t.innerBorder,
              color: "text.secondary",
              "&.Mui-selected": {
                bgcolor: "primary.main",
                color: "#fff",
                "&:hover": { bgcolor: "primary.dark" },
              },
            },
          }}
        >
          <ToggleButton value="plan">
            <EditNoteIcon sx={{ fontSize: 16, mr: 0.5 }} />
            Plan
          </ToggleButton>
          <ToggleButton value="compare">
            <ViewAgendaIcon sx={{ fontSize: 16, mr: 0.5 }} />
            Compare
          </ToggleButton>
        </ToggleButtonGroup>

        <Tooltip title={themeMode === "light" ? "Switch to dark mode" : "Switch to light mode"}>
          <IconButton
            size="small"
            onClick={() =>
              onThemeModeChange(themeMode === "light" ? "dark" : "light")
            }
            sx={{ width: 32, height: 32 }}
          >
            {themeMode === "light" ? (
              <DarkModeIcon fontSize="small" />
            ) : (
              <LightModeIcon fontSize="small" />
            )}
          </IconButton>
        </Tooltip>

        <Tooltip title="Export current template as JSON">
          <IconButton size="small" onClick={onExport} sx={{ width: 32, height: 32 }}>
            <FileDownloadIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Import template from JSON">
          <IconButton
            size="small"
            onClick={() => fileRef.current?.click()}
            sx={{ width: 32, height: 32 }}
          >
            <FileUploadIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={handleFile}
        />
      </Stack>

      {/* Rename dialog */}
      <Dialog open={renameOpen} onClose={() => setRenameOpen(false)}>
        <DialogTitle>Rename template</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            size="small"
            value={renameVal}
            onChange={(e) => setRenameVal(e.target.value)}
            onKeyDown={(e) => {
              stopTypingKeyPropagation(e);
              if (e.key === "Enter") submitRename();
            }}
            sx={{ mt: 1, minWidth: 300 }}
          />
          {templates.includes(renameVal.trim()) &&
            renameVal.trim() !== activeTemplate && (
              <Typography
                variant="body2"
                sx={{ mt: 1, color: "error.main", fontSize: 12 }}
              >
                A template with that name already exists.
              </Typography>
            )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRenameOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={submitRename}>
            Rename
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
