import type { ActivityBlock, ThemeMode } from "../types";
import type { DragHandleProps } from "./SortableItem";
import { BlockCardShell } from "./BlockCardShell";
import { FieldLinkFields } from "./FieldLinkCard";

interface ActivityBlockCardProps {
  block: ActivityBlock;
  mode: ThemeMode;
  onChange: (next: ActivityBlock) => void;
  onDelete?: () => void;
  dragHandle?: DragHandleProps;
  borderless?: boolean;
}

export function ActivityBlockCard({
  block,
  mode,
  onChange,
  onDelete,
  dragHandle,
  borderless = false,
}: ActivityBlockCardProps) {
  const link = block.activities[0]?.text ?? "";

  const setLink = (url: string) => {
    onChange({
      ...block,
      activities: url.trim() ? [{ text: url }] : [],
    });
  };

  return (
    <BlockCardShell mode={mode} dragHandle={dragHandle} onDelete={onDelete} borderless={borderless}>
      <FieldLinkFields
        mode={mode}
        name={block.name}
        namePlaceholder="Activity name"
        link={link}
        attachment={block.attachment}
        onNameChange={(name) => onChange({ ...block, name })}
        onLinkChange={setLink}
        onAttachmentChange={(attachment) => onChange({ ...block, attachment })}
      />
    </BlockCardShell>
  );
}
