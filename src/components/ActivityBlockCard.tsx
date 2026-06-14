import {
  Box,
  Stack,
  InputBase,
  IconButton,
  Button,
  TextField,
  Tooltip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import type { ActivityBlock, Activity, ThemeMode } from "../types";
import { tokens } from "../theme";
import { blankActivity } from "../utils/plan";
import type { DragHandleProps } from "./SortableItem";

interface ActivityBlockCardProps {
  block: ActivityBlock;
  mode: ThemeMode;
  onChange: (next: ActivityBlock) => void;
  onDelete?: () => void;
  canDelete: boolean;
  /**
   * Optional drag handle from a SortableItem render-prop. When provided,
   * a small grip icon is shown that triggers the drag.
   */
  dragHandle?: DragHandleProps;
}

export function ActivityBlockCard({
  block,
  mode,
  onChange,
  onDelete,
  canDelete,
  dragHandle,
}: ActivityBlockCardProps) {
  const t = tokens(mode);

  const updateActivity = (i: number, patch: Partial<Activity>) => {
    const next = [...block.activities];
    next[i] = { ...next[i], ...patch };
    onChange({ ...block, activities: next });
  };
  const addActivity = () =>
    onChange({ ...block, activities: [...block.activities, blankActivity()] });
  const removeActivity = (i: number) => {
    if (block.activities.length === 1) {
      updateActivity(i, { text: "" });
      return;
    }
    onChange({
      ...block,
      activities: block.activities.filter((_, idx) => idx !== i),
    });
  };

  // Explicit small radii — numeric `borderRadius: n` in sx multiplies
  // `theme.shape.borderRadius` (14px), so `2` was 28px and looked pill-like.
  const rBlock = "8px";
  const rInner = "6px";

  return (
    <Box
      sx={{
        p: 1,
        bgcolor: t.innerSurface,
        border: `1px solid ${t.innerBorder}`,
        borderRadius: rBlock,
      }}
    >
      {/* Block header — drag handle, inline-renameable name, optional delete */}
      <Stack
        direction="row"
        spacing={0.5}
        sx={{ alignItems: "center", mb: 0.75 }}
      >
        {dragHandle && (
          <Box
            {...dragHandle.attributes}
            {...dragHandle.listeners}
            sx={{
              cursor: "grab",
              display: "flex",
              color: "text.secondary",
              opacity: 0.55,
              "&:active": { cursor: "grabbing" },
              "&:hover": { opacity: 1 },
            }}
          >
            <DragIndicatorIcon sx={{ fontSize: 16 }} />
          </Box>
        )}
        <InputBase
          value={block.name}
          onChange={(e) => onChange({ ...block, name: e.target.value })}
          sx={{
            fontSize: 12,
            fontWeight: 600,
            color: "text.primary",
            flex: 1,
            "& input": { p: 0 },
          }}
        />
        <Tooltip title="Rename block">
          <EditIcon sx={{ fontSize: 13, color: "text.secondary", opacity: 0.6 }} />
        </Tooltip>
        {canDelete && (
          <Tooltip title="Remove block">
            <IconButton
              size="small"
              onClick={onDelete}
              sx={{ p: 0.25, ml: 0.25 }}
            >
              <CloseIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Tooltip>
        )}
      </Stack>

      {/* Activity rows */}
      <Stack spacing={0.5}>
        {block.activities.map((act, i) => (
          <TextField
            key={i}
            size="small"
            placeholder="Activity name"
            value={act.text}
            onChange={(e) => updateActivity(i, { text: e.target.value })}
            onBlur={(e) => {
              if (!e.target.value && block.activities.length > 1) {
                removeActivity(i);
              }
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                bgcolor: "background.paper",
                borderRadius: rInner,
              },
            }}
          />
        ))}
        <Button
          onClick={addActivity}
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
          + Add Activity
        </Button>
      </Stack>
    </Box>
  );
}
