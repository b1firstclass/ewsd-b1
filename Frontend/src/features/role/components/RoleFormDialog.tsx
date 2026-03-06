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
import type { Role } from "@/types/roleType";

type FormMode = "create" | "edit";
type RoleFormValues = { name: string; description: string; };

interface RoleFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mode: FormMode;
    value?: Role | null;
    isPending: boolean;
    error?: unknown;
    onSubmit: (values: RoleFormValues) => Promise<void>;
}

export const RoleFormDialog = ({
    open,
    onOpenChange,
    mode,
    value,
    isPending,
    error,
    onSubmit,
}: RoleFormDialogProps) => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [nameError, setNameError] = useState<string | null>(null);

    // Sync initial values when the dialog opens or target record changes.
    useEffect(() => {
        if (!open) {
            return;
        }

        setName(value?.name ?? "");
        setDescription(value?.description ?? "");
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
            setNameError("Role name is required.");
            return;
        }

        setNameError(null);
        await onSubmit({
            name: trimmedName,
            description
        });
    };

    const isCreateMode = mode === "create";
    const title = isCreateMode ? "Create role" : "Update role";
    // const description = isCreateMode
    //     ? "Add a new faculty record to your organization."
    //     : "Update faculty details and status.";
    const submitLabel = isCreateMode ? "Create" : "Update";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    {/* <DialogDescription>{description}</DialogDescription> */}
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="role-name">Name</Label>
                        <Input
                            id="role-name"
                            placeholder="Enter role name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            error={resolvedNameError}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="role-description">Description</Label>
                        <Input
                            id="role-description"
                            placeholder="Enter description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    {serverGeneralError ? (
                        <p className="text-sm text-destructive">{serverGeneralError}</p>
                    ) : null}

                    <DialogFooter>
                        <Button
                            type="button"
                            variant={"outline"}
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
