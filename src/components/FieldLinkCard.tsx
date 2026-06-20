import { Box, Stack, TextField } from "@mui/material";
import type { ThemeMode } from "../types";
import { tokens } from "../theme";
import { ActivityLinkControl } from "./ActivityLinkControl";

interface FieldLinkFieldsProps {
  mode: ThemeMode;
  name: string;
  namePlaceholder: string;
  link: string;
  onNameChange: (name: string) => void;
  onLinkChange: (link: string) => void;
}

export function FieldLinkFields({
  mode,
  name,
  namePlaceholder,
  link,
  onNameChange,
  onLinkChange,
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
        }}
      />
      <ActivityLinkControl url={link} mode={mode} onChange={onLinkChange} />
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
