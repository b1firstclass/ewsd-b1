import { Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

interface RowEditDeleteActionsProps {
  onEdit: () => void;
  onDelete: () => void;
  disabled?: boolean;
  editLabel?: string;
  deleteLabel?: string;
}

export const RowEditDeleteActions = ({
  onEdit,
  onDelete,
  disabled = false,
  editLabel = "Edit",
  deleteLabel = "Delete",
}: RowEditDeleteActionsProps) => {
  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-8 w-8 rounded-full"
        onClick={onEdit}
        disabled={disabled}
        aria-label={editLabel}
        title={editLabel}
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-8 w-8 rounded-full border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
        onClick={onDelete}
        disabled={disabled}
        aria-label={deleteLabel}
        title={deleteLabel}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};
