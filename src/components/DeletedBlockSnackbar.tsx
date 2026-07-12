import {
  IconButton,
  Paper,
  Snackbar,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import UndoIcon from "@mui/icons-material/Undo";

const AUTO_HIDE_MS = 5000;

interface DeletedBlockSnackbarProps {
  open: boolean;
  isMobile: boolean;
  onUndo: () => void;
  onClose: () => void;
}

export function DeletedBlockSnackbar({
  open,
  isMobile,
  onUndo,
  onClose,
}: DeletedBlockSnackbarProps) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={AUTO_HIDE_MS}
      onClose={(_, reason) => {
        if (reason === "clickaway") return;
        onClose();
      }}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: isMobile ? "center" : "right",
      }}
      sx={{
        ...(isMobile
          ? {
              left: 16,
              right: 16,
              bottom: "calc(72px + env(safe-area-inset-bottom)) !important",
            }
          : {
              bottom: 24,
              right: 24,
            }),
      }}
    >
      <Paper
        elevation={8}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 2,
          py: 1.25,
          borderRadius: 2,
          width: isMobile ? "100%" : "auto",
          maxWidth: isMobile ? "100%" : 360,
        }}
      >
        <Typography variant="body2" sx={{ flex: 1, minWidth: 0 }}>
          Block has been deleted
        </Typography>
        <IconButton
          size="small"
          aria-label="Undo delete"
          onClick={onUndo}
          sx={{ color: "primary.main" }}
        >
          <UndoIcon sx={{ fontSize: 20 }} />
        </IconButton>
        <IconButton size="small" aria-label="Dismiss" onClick={onClose}>
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Paper>
    </Snackbar>
  );
}
