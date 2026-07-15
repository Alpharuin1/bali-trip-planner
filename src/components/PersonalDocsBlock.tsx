import { Paper, Box, Typography, Stack, Button } from "@mui/material";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import type { DocBlock, ThemeMode } from "../types";
import { PERSONAL_DAY_CARD_WIDTH } from "../layout";
import { tokens } from "../theme";
import { blankDocBlock } from "../utils/personalPlan";
import { blockListScrollBleedSx } from "./BlockCardShell";
import { DocBlockCard } from "./DocBlockCard";
import { FieldLabel } from "./FieldLabel";

interface PersonalDocsBlockProps {
  docBlocks: DocBlock[];
  mode: ThemeMode;
  selected?: boolean;
  onFocus?: () => void;
  onChange: (blocks: DocBlock[]) => void;
  cardRadius?: string | number;
  /** Full-width card for mobile layout. */
  fill?: boolean;
}

export function PersonalDocsBlock({
  docBlocks,
  mode,
  selected = false,
  onFocus,
  onChange,
  cardRadius = "12px",
  fill = false,
}: PersonalDocsBlockProps) {
  const t = tokens(mode);

  const updateBlock = (id: string, next: DocBlock) =>
    onChange(docBlocks.map((b) => (b.id === id ? next : b)));

  const removeBlock = (id: string) => onChange(docBlocks.filter((b) => b.id !== id));

  const addBlock = () =>
    onChange([...docBlocks, blankDocBlock(docBlocks.length + 1)]);

  return (
    <Paper
      elevation={0}
      onClick={fill ? undefined : onFocus}
      tabIndex={fill ? undefined : onFocus ? 0 : undefined}
      sx={{
        width: fill ? "100%" : PERSONAL_DAY_CARD_WIDTH,
        flexShrink: fill ? 1 : 0,
        height: fill ? "auto" : "100%",
        p: 2,
        bgcolor: "background.paper",
        borderRadius: cardRadius,
        boxShadow: "none",
        border: selected ? "2px solid" : `1px solid ${t.dayCardBorder}`,
        borderColor: selected ? "primary.main" : undefined,
        display: "flex",
        flexDirection: "column",
        gap: 0,
        minHeight: 0,
        overflow: fill ? "visible" : "hidden",
        outline: "none",
        cursor: fill ? undefined : onFocus ? "pointer" : undefined,
      }}
    >
      <Stack
        direction="row"
        spacing={0.75}
        sx={{ alignItems: "center", pb: 1.25, flexShrink: 0 }}
      >
        <DescriptionOutlinedIcon sx={{ fontSize: 18, color: "text.secondary" }} />
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            sx={{ fontSize: 11, color: "text.secondary", fontWeight: 600, lineHeight: 1.35 }}
          >
            Profile documents
          </Typography>
          <Typography sx={{ fontSize: 14, fontWeight: 700, mt: 0.25, lineHeight: 1.35 }}>
            Docs
          </Typography>
        </Box>
      </Stack>

      <Box
        sx={{
          ...(fill ? {} : { flex: 1, minHeight: 0 }),
          overflowY: fill ? "visible" : "auto",
          overflowX: "hidden",
          ...blockListScrollBleedSx,
        }}
      >
        <FieldLabel sx={{ mb: 0.75 }}>Document blocks</FieldLabel>
        {docBlocks.length === 0 ? (
          <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 1 }}>
            Add labeled blocks for passports, insurance, tickets, and other trip files.
          </Typography>
        ) : (
          <Stack spacing={1}>
            {docBlocks.map((block) => (
              <DocBlockCard
                key={block.id}
                block={block}
                mode={mode}
                showDeleteAlways
                onChange={(next) => updateBlock(block.id, next)}
                onDelete={() => removeBlock(block.id)}
              />
            ))}
          </Stack>
        )}

        <Button
          variant="text"
          size="small"
          onClick={addBlock}
          sx={{
            alignSelf: "flex-start",
            mt: 1.25,
            px: 0.5,
            minWidth: 0,
            fontSize: 13,
            textTransform: "none",
          }}
        >
          + Add doc block
        </Button>
      </Box>
    </Paper>
  );
}
