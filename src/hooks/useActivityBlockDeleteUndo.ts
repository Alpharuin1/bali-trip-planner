import { useCallback, useState } from "react";
import type { ActivityBlock } from "../types";

interface UndoEntry {
  block: ActivityBlock;
  index: number;
}

export function useActivityBlockDeleteUndo(
  blocks: ActivityBlock[],
  setBlocks: (blocks: ActivityBlock[]) => void
) {
  const [undoEntry, setUndoEntry] = useState<UndoEntry | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const removeBlockWithUndo = useCallback(
    (id: string) => {
      const index = blocks.findIndex((b) => b.id === id);
      if (index < 0) return;
      setUndoEntry({ block: blocks[index], index });
      setBlocks(blocks.filter((b) => b.id !== id));
      setSnackbarOpen(true);
    },
    [blocks, setBlocks]
  );

  const undoDelete = useCallback(() => {
    if (!undoEntry) return;
    const next = [...blocks];
    next.splice(undoEntry.index, 0, undoEntry.block);
    setBlocks(next);
    setUndoEntry(null);
    setSnackbarOpen(false);
  }, [blocks, setBlocks, undoEntry]);

  const dismissSnackbar = useCallback(() => {
    setSnackbarOpen(false);
    setUndoEntry(null);
  }, []);

  return {
    snackbarOpen,
    removeBlockWithUndo,
    undoDelete,
    dismissSnackbar,
  };
}
