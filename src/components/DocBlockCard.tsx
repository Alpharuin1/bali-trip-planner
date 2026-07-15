import { Box, Stack, TextField } from "@mui/material";
import type { DocBlock, ThemeMode } from "../types";
import { tokens } from "../theme";
import { typingFieldKeyDownProps } from "../utils/keyboard";
import { BlockCardShell } from "./BlockCardShell";
import { MultiAttachmentControl } from "./MultiAttachmentControl";

interface DocBlockCardProps {
  block: DocBlock;
  mode: ThemeMode;
  onChange: (next: DocBlock) => void;
  onDelete?: () => void;
  showDeleteAlways?: boolean;
}

export function DocBlockCard({
  block,
  mode,
  onChange,
  onDelete,
  showDeleteAlways = false,
}: DocBlockCardProps) {
  const t = tokens(mode);

  return (
    <BlockCardShell
      mode={mode}
      onDelete={onDelete}
      borderless
      showDeleteAlways={showDeleteAlways}
      deleteTooltip="Remove doc block"
    >
      <Box
        sx={{
          p: 1,
          bgcolor: t.innerSurface,
          borderRadius: "8px",
          width: "100%",
        }}
      >
        <Stack spacing={0.75}>
          <TextField
            size="small"
            fullWidth
            placeholder="Label (e.g. Passport, Travel insurance)"
            value={block.label}
            onChange={(e) => onChange({ ...block, label: e.target.value })}
            {...typingFieldKeyDownProps}
            sx={{
              "& .MuiOutlinedInput-root": {
                bgcolor: "background.paper",
                borderRadius: "6px",
              },
              "& .MuiOutlinedInput-input": {
                fontSize: { xs: 16, sm: "inherit" },
              },
            }}
          />
          <MultiAttachmentControl
            attachments={block.attachments}
            mode={mode}
            onChange={(attachments) => onChange({ ...block, attachments })}
          />
        </Stack>
      </Box>
    </BlockCardShell>
  );
}
