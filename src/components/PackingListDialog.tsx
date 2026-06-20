import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import type { PackingListDocument } from "../utils/packingList";
import {
  essentialItemKey,
  loadPackingChecks,
  packingItemKey,
  savePackingChecks,
} from "../utils/packingList";
import { exportPackingListPdf } from "../utils/packingListPdf";
import type { ThemeMode } from "../types";
import { tokens } from "../theme";

interface PackingListDialogProps {
  open: boolean;
  profileId: string;
  document: PackingListDocument | null;
  themeMode: ThemeMode;
  onClose: () => void;
}

function ChecklistItem({
  label,
  checked,
  onToggle,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <FormControlLabel
      sx={{ m: 0, alignItems: "flex-start", gap: 0.5 }}
      control={
        <Checkbox
          size="small"
          checked={checked}
          onChange={onToggle}
          sx={{ pt: 0.125 }}
        />
      }
      label={
        <Typography
          sx={{
            fontSize: 13,
            lineHeight: 1.45,
            color: checked ? "text.secondary" : "text.primary",
            textDecoration: checked ? "line-through" : "none",
          }}
        >
          {label}
        </Typography>
      }
    />
  );
}

function BlockGroup({
  title,
  blocks,
  t,
  isChecked,
  onToggleItem,
}: {
  title: string;
  blocks: PackingListDocument["days"][0]["outfits"];
  t: ReturnType<typeof tokens>;
  isChecked: (key: string) => boolean;
  onToggleItem: (key: string) => void;
}) {
  if (blocks.length === 0) return null;
  return (
    <Box sx={{ mb: 1.5 }}>
      <Typography
        variant="caption"
        sx={{ fontWeight: 700, color: "text.secondary", display: "block", mb: 0.75 }}
      >
        {title}
      </Typography>
      <Stack spacing={1}>
        {blocks.map((block, blockIdx) => (
          <Box
            key={`${title}-${block.name}-${blockIdx}`}
            sx={{
              p: 1,
              borderRadius: "8px",
              bgcolor: t.innerSurface,
              border: `1px solid ${t.innerBorder}`,
            }}
          >
            <Typography sx={{ fontSize: 12, fontWeight: 600, mb: 0.5 }}>{block.name}</Typography>
            <Stack spacing={0.25}>
              {block.items.map((item) => {
                const key = packingItemKey(item);
                return (
                  <ChecklistItem
                    key={key}
                    label={item}
                    checked={isChecked(key)}
                    onToggle={() => onToggleItem(key)}
                  />
                );
              })}
            </Stack>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}

function collectAllKeys(doc: PackingListDocument): string[] {
  const keys = new Set<string>();
  for (const day of doc.days) {
    for (const block of [...day.outfits, ...day.activities]) {
      for (const item of block.items) keys.add(packingItemKey(item));
    }
  }
  for (const item of doc.combinedItems) keys.add(packingItemKey(item));
  doc.essentials.forEach((_, i) => keys.add(essentialItemKey(i)));
  return [...keys];
}

export function PackingListDialog({
  open,
  profileId,
  document: packingDoc,
  themeMode,
  onClose,
}: PackingListDialogProps) {
  const t = tokens(themeMode);
  const [checks, setChecks] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (open && profileId) setChecks(loadPackingChecks(profileId));
  }, [open, profileId]);

  const persistChecks = useCallback(
    (next: Record<string, boolean>) => {
      setChecks(next);
      savePackingChecks(profileId, next);
    },
    [profileId]
  );

  const toggle = useCallback(
    (key: string) => {
      persistChecks({ ...checks, [key]: !checks[key] });
    },
    [checks, persistChecks]
  );

  const isChecked = useCallback((key: string) => !!checks[key], [checks]);

  const progress = useMemo(() => {
    if (!packingDoc) return { packed: 0, total: 0, pct: 0 };
    const keys = collectAllKeys(packingDoc);
    const packed = keys.filter((k) => checks[k]).length;
    return {
      packed,
      total: keys.length,
      pct: keys.length ? Math.round((packed / keys.length) * 100) : 0,
    };
  }, [packingDoc, checks]);

  const hasContent =
    packingDoc &&
    (packingDoc.combinedItems.length > 0 ||
      packingDoc.days.some((d) => d.outfits.length > 0 || d.activities.length > 0));

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth scroll="paper">
      <DialogTitle>Packing checklist</DialogTitle>
      <DialogContent dividers sx={{ px: 2.5, py: 2 }}>
        {!packingDoc ? null : (
          <Stack spacing={2}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {packingDoc.profileName}&apos;s packing list
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                {packingDoc.tripRange}
              </Typography>
              {progress.total > 0 && (
                <Box sx={{ mt: 1.5 }}>
                  <Stack direction="row" sx={{ justifyContent: "space-between", mb: 0.5 }}>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                      {progress.packed} of {progress.total} packed
                    </Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                      {progress.pct}%
                    </Typography>
                  </Stack>
                  <LinearProgress variant="determinate" value={progress.pct} sx={{ borderRadius: 1 }} />
                </Box>
              )}
            </Box>

            {!hasContent && (
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Add items to your outfit and activity blocks first — they&apos;ll show up here
                automatically.
              </Typography>
            )}

            {packingDoc.days.map((day) => {
              if (day.outfits.length === 0 && day.activities.length === 0) return null;
              return (
                <Box key={day.dayNumber}>
                  <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 1 }}>
                    Day {day.dayNumber} · {day.dateLabel}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary", display: "block", mb: 1 }}
                  >
                    {day.placeLabel}
                  </Typography>
                  <BlockGroup
                    title="Outfits"
                    blocks={day.outfits}
                    t={t}
                    isChecked={isChecked}
                    onToggleItem={toggle}
                  />
                  <BlockGroup
                    title="Activities"
                    blocks={day.activities}
                    t={t}
                    isChecked={isChecked}
                    onToggleItem={toggle}
                  />
                </Box>
              );
            })}

            {packingDoc.combinedItems.length > 0 && (
              <>
                <Divider />
                <Box>
                  <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 0.5 }}>
                    Combined checklist
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary", display: "block", mb: 1 }}
                  >
                    Duplicates across days merged — checking an item here checks it everywhere.
                  </Typography>
                  <Stack spacing={0.25}>
                    {packingDoc.combinedItems.map((item) => {
                      const key = packingItemKey(item);
                      return (
                        <ChecklistItem
                          key={key}
                          label={item}
                          checked={isChecked(key)}
                          onToggle={() => toggle(key)}
                        />
                      );
                    })}
                  </Stack>
                </Box>
              </>
            )}

            <Divider />

            <Box>
              <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 0.5 }}>
                General essentials
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: "text.secondary", display: "block", mb: 1 }}
              >
                Useful extras for Bali — tick off as you pack.
              </Typography>
              <Stack spacing={0.25}>
                {packingDoc.essentials.map((item, i) => {
                  const key = essentialItemKey(i);
                  return (
                    <ChecklistItem
                      key={key}
                      label={item}
                      checked={isChecked(key)}
                      onToggle={() => toggle(key)}
                    />
                  );
                })}
              </Stack>
            </Box>
          </Stack>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Close</Button>
        <Button
          variant="contained"
          startIcon={<PictureAsPdfOutlinedIcon />}
          disabled={!packingDoc}
          onClick={() => {
            if (packingDoc) exportPackingListPdf(packingDoc, checks);
          }}
        >
          Export PDF
        </Button>
      </DialogActions>
    </Dialog>
  );
}
