import {
  Box,
  Stack,
  InputBase,
  Button,
  TextField,
  Tooltip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import type { ClothingBlock, ClothingItem, ThemeMode } from "../types";
import { tokens } from "../theme";
import { blankClothingItem } from "../utils/personalPlan";
import { typingFieldKeyDownProps } from "../utils/keyboard";
import type { DragHandleProps } from "./SortableItem";
import { BlockCardShell } from "./BlockCardShell";

interface ClothingBlockCardProps {
  block: ClothingBlock;
  mode: ThemeMode;
  onChange: (next: ClothingBlock) => void;
  onDelete?: () => void;
  canDelete: boolean;
  dragHandle?: DragHandleProps;
}

export function ClothingBlockCard({
  block,
  mode,
  onChange,
  onDelete,
  canDelete,
  dragHandle,
}: ClothingBlockCardProps) {
  const t = tokens(mode);
  const rInner = "6px";

  const updateItem = (i: number, patch: Partial<ClothingItem>) => {
    const next = [...block.items];
    next[i] = { ...next[i], ...patch };
    onChange({ ...block, items: next });
  };

  const addItem = () =>
    onChange({ ...block, items: [...block.items, blankClothingItem()] });

  const removeItem = (i: number) => {
    if (block.items.length === 1) {
      updateItem(i, { text: "" });
      return;
    }
    onChange({ ...block, items: block.items.filter((_, idx) => idx !== i) });
  };

  return (
    <BlockCardShell
      mode={mode}
      dragHandle={dragHandle}
      onDelete={onDelete}
      canDelete={canDelete}
      deleteTooltip={
        canDelete ? "Remove block" : "At least one block is required"
      }
    >
      <Box sx={{ mb: 0.75 }}>
        <Tooltip title="Click to rename">
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.375,
              maxWidth: "100%",
              borderRadius: 1,
              px: 0.25,
              mx: -0.25,
              "&:hover .block-name-edit-hint": { opacity: 1 },
            }}
          >
            <InputBase
              value={block.name}
              onChange={(e) => onChange({ ...block, name: e.target.value })}
              {...typingFieldKeyDownProps}
              sx={{
                fontSize: 12,
                fontWeight: 600,
                width: `${Math.max(block.name.length, 6)}ch`,
                maxWidth: "100%",
                "& input": { p: 0, cursor: "text", fontSize: { xs: 16, sm: 12 } },
              }}
            />
            <EditIcon
              className="block-name-edit-hint"
              sx={{
                fontSize: 13,
                color: "text.secondary",
                opacity: 0,
                flexShrink: 0,
                pointerEvents: "none",
                transition: "opacity 0.15s ease",
              }}
            />
          </Box>
        </Tooltip>
      </Box>

      <Stack spacing={0.5}>
        {block.items.map((item, i) => (
          <TextField
            key={i}
            size="small"
            placeholder="Clothing item"
            value={item.text}
            onChange={(e) => updateItem(i, { text: e.target.value })}
            {...typingFieldKeyDownProps}
            onBlur={(e) => {
              if (!e.target.value && block.items.length > 1) removeItem(i);
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                bgcolor: "background.paper",
                borderRadius: rInner,
              },
              "& .MuiOutlinedInput-input": {
                fontSize: { xs: 16, sm: "inherit" },
              },
            }}
          />
        ))}
        <Button
          onClick={addItem}
          fullWidth
          sx={{
            mt: 0.25,
            bgcolor: "background.paper",
            color: "text.secondary",
            fontSize: 12,
            borderRadius: rInner,
            border: `1px solid ${t.innerBorder}`,
            "&:hover": { bgcolor: t.surface },
          }}
        >
          + Add item
        </Button>
      </Stack>
    </BlockCardShell>
  );
}
