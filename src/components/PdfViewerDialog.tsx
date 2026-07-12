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
import { downloadAttachment } from "../utils/attachments";

interface PdfViewerDialogProps {
  attachment: FileAttachment | null;
  open: boolean;
  onClose: () => void;
}

export function PdfViewerDialog({ attachment, open, onClose }: PdfViewerDialogProps) {
  if (!attachment) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ pr: 1, py: 1.25 }}>
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
          <Tooltip title="Download PDF">
            <IconButton size="small" onClick={() => downloadAttachment(attachment)}>
              <FileDownloadOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <IconButton size="small" onClick={onClose} aria-label="Close">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ p: 0, height: { xs: "70vh", md: "80vh" } }}>
        <Box
          component="iframe"
          src={attachment.dataUrl}
          title={attachment.name}
          sx={{
            display: "block",
            width: "100%",
            height: "100%",
            border: 0,
            bgcolor: "background.default",
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
