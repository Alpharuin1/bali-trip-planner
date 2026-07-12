import { Box, Stack, TextField } from "@mui/material";
import type { FileAttachment, ThemeMode } from "../types";
import { tokens } from "../theme";
import { ActivityLinkControl } from "./ActivityLinkControl";
import { AttachmentControl } from "./AttachmentControl";

interface FieldLinkFieldsProps {
  mode: ThemeMode;
  name: string;
  namePlaceholder: string;
  link: string;
  attachment?: FileAttachment;
  onNameChange: (name: string) => void;
  onLinkChange: (link: string) => void;
  onAttachmentChange?: (attachment: FileAttachment | undefined) => void;
}

export function FieldLinkFields({
  mode,
  name,
  namePlaceholder,
  link,
  attachment,
  onNameChange,
  onLinkChange,
  onAttachmentChange,
}: FieldLinkFieldsProps) {
  return (
    <Stack spacing={0.75} sx={{ width: "100%" }}>
      <TextField
        size="small"
        fullWidth
        placeholder={namePlaceholder}
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
        sx={{
          "& .MuiOutlinedInput-root": {
            bgcolor: "background.paper",
            borderRadius: "6px",
          },
          "& .MuiOutlinedInput-input": {
            overflow: "hidden",
            textOverflow: "ellipsis",
          },
        }}
      />
      <ActivityLinkControl url={link} mode={mode} onChange={onLinkChange} />
      {onAttachmentChange ? (
        <AttachmentControl
          attachment={attachment}
          mode={mode}
          buttonLabel="Attach Booking"
          onChange={onAttachmentChange}
        />
      ) : null}
    </Stack>
  );
}

interface FieldLinkCardProps extends FieldLinkFieldsProps {}

export function FieldLinkCard(props: FieldLinkCardProps) {
  const t = tokens(props.mode);

  return (
    <Box
      sx={{
        p: 1,
        bgcolor: t.innerSurface,
        border: `1px solid ${t.innerBorder}`,
        borderRadius: "8px",
        width: "100%",
      }}
    >
      <FieldLinkFields {...props} />
    </Box>
  );
}
