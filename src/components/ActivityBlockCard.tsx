import type { ActivityBlock, ThemeMode } from "../types";
import type { DragHandleProps } from "./SortableItem";
import { BlockCardShell } from "./BlockCardShell";
import { FieldLinkFields } from "./FieldLinkCard";

interface ActivityBlockCardProps {
  block: ActivityBlock;
  mode: ThemeMode;
  onChange: (next: ActivityBlock) => void;
  onDelete: () => void;
  dragHandle?: DragHandleProps;
}

export function ActivityBlockCard({
  block,
  mode,
  onChange,
  onDelete,
  dragHandle,
}: ActivityBlockCardProps) {
  const link = block.activities[0]?.text ?? "";

  const setLink = (url: string) => {
    onChange({
      ...block,
      activities: url.trim() ? [{ text: url }] : [],
    });
  };

  return (
    <BlockCardShell mode={mode} dragHandle={dragHandle} onDelete={onDelete}>
      <FieldLinkFields
        mode={mode}
        name={block.name}
        namePlaceholder="Activity name"
        link={link}
        onNameChange={(name) => onChange({ ...block, name })}
        onLinkChange={setLink}
      />
    </BlockCardShell>
  );
}
