import { useEffect, useMemo, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getErrorMessage, getFieldError } from "@/lib/utils";
import type { Faculity } from "@/types/faculityType";

type FormMode = "create" | "edit";
type FaculityFormValues = { name: string; isActive: boolean };

interface FaculityFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: FormMode;
  value?: Faculity | null;
  isPending: boolean;
  error?: unknown;
  onSubmit: (values: FaculityFormValues) => Promise<void>;
}

export const FaculityFormDialog = ({
  open,
  onOpenChange,
  mode,
  value,
  isPending,
  error,
  onSubmit,
}: FaculityFormDialogProps) => {
  const [name, setName] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [nameError, setNameError] = useState<string | null>(null);

  // Sync initial values when the dialog opens or target record changes.
  useEffect(() => {
    if (!open) {
      return;
    }

    setName(value?.name ?? "");
    setIsActive(value?.isActive ?? true);
    setNameError(null);
  }, [open, value]);

  const serverNameError = getFieldError(error, "name");
  const resolvedNameError = nameError ?? serverNameError;

  const serverGeneralError = useMemo(() => {
    if (!error || serverNameError) {
      return null;
    }

    return getErrorMessage(error);
  }, [error, serverNameError]);

  const handleCancel = () => {
    onOpenChange(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) {
      setNameError("Faculty name is required.");
      return;
    }

    setNameError(null);
    await onSubmit({
      name: trimmedName,
      isActive,
    });
  };

  const isCreateMode = mode === "create";
  const title = isCreateMode ? "Create faculty" : "Update faculty";
  const submitLabel = isCreateMode ? "Create" : "Update";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="faculity-name">Name</Label>
            <Input
              id="faculity-name"
              placeholder="Enter faculty name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={resolvedNameError}
            />
          </div>

          {serverGeneralError ? (
            <p className="text-sm text-destructive">{serverGeneralError}</p>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isPending}>
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
