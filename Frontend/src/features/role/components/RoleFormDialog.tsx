import {
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEditDialogInitialFocus } from "@/hooks/useEditDialogInitialFocus";
import { cn, getErrorMessage, getFieldError } from "@/lib/utils";
import type { PermissionInfo, Role } from "@/types/roleType";

type FormMode = "create" | "edit";

export interface RoleFormValues {
  name: string;
  description: string;
  permissionIds: string[];
}

interface RoleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: FormMode;
  value?: Role | null;
  permissionOptions: PermissionInfo[];
  isPermissionsLoading: boolean;
  permissionError?: string | null;
  onRetryPermissions?: () => void;
  isRoleLoading?: boolean;
  roleLoadError?: string | null;
  onRetryRole?: () => void;
  isPending: boolean;
  error?: unknown;
  onSubmit: (values: RoleFormValues) => Promise<void>;
}

interface RoleFormDialogBodyProps extends RoleFormDialogProps {}

interface PermissionModuleGroup {
  module: string;
  permissions: PermissionInfo[];
  visiblePermissions: PermissionInfo[];
  selectedCount: number;
  visibleSelectedCount: number;
}

interface PermissionModuleCardProps {
  group: PermissionModuleGroup;
  isDisabled: boolean;
  hasSearchFilter: boolean;
  selectedPermissionIds: Set<string>;
  onTogglePermission: (permissionId: string, checked: boolean) => void;
  onSelectAll: (permissions: PermissionInfo[]) => void;
  onClear: (permissions: PermissionInfo[]) => void;
}

interface InlineStateCardProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  tone?: "default" | "error";
}

const normalizeText = (value?: string | null) => value?.trim().toLowerCase() ?? "";

const buildPermissionIdsKey = (permissions?: PermissionInfo[]) =>
  (permissions ?? [])
    .map((permission) => permission.id)
    .sort((left, right) => left.localeCompare(right))
    .join("|");

const PermissionModuleCard = ({
  group,
  isDisabled,
  hasSearchFilter,
  selectedPermissionIds,
  onTogglePermission,
  onSelectAll,
  onClear,
}: PermissionModuleCardProps) => {
  const moduleActionLabel = hasSearchFilter ? "Select shown" : "Select all";

  return (
    <Card className="rounded-2xl border border-border/70 bg-background/70 shadow-none">
      <CardHeader className="gap-3 border-b border-border/60 pb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-base">{group.module}</CardTitle>
              <Badge
                variant={group.selectedCount ? "secondary" : "outline"}
                className="rounded-full normal-case"
              >
                {group.selectedCount}/{group.permissions.length} selected
              </Badge>
            </div>
            <CardDescription>
              {group.visiblePermissions.length} permission
              {group.visiblePermissions.length === 1 ? "" : "s"} shown in this module.
            </CardDescription>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onSelectAll(group.visiblePermissions)}
              disabled={isDisabled || !group.visiblePermissions.length}
            >
              {moduleActionLabel}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onClear(group.visiblePermissions)}
              disabled={isDisabled || !group.visibleSelectedCount}
            >
              Clear
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pt-5">
        {group.visiblePermissions.map((permission) => {
          const isSelected = selectedPermissionIds.has(permission.id);

          return (
            <label
              key={permission.id}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 transition-colors",
                isSelected
                  ? "border-primary/40 bg-primary/5"
                  : "border-border/70 bg-background/70 hover:border-primary/25 hover:bg-accent/30",
                isDisabled && "cursor-not-allowed opacity-60",
              )}
            >
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 shrink-0 accent-primary"
                checked={isSelected}
                disabled={isDisabled}
                onChange={(event) => onTogglePermission(permission.id, event.target.checked)}
              />

              <div className="min-w-0 space-y-1">
                <p className="text-sm font-medium text-foreground">{permission.name}</p>
                {permission.description ? (
                  <p className="text-sm text-muted-foreground">{permission.description}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No additional description provided.
                  </p>
                )}
              </div>
            </label>
          );
        })}
      </CardContent>
    </Card>
  );
};

const InlineStateCard = ({
  message,
  actionLabel,
  onAction,
  tone = "default",
}: InlineStateCardProps) => {
  const isError = tone === "error";

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-2xl border px-4 py-4 text-sm sm:flex-row sm:items-center sm:justify-between",
        isError
          ? "border-destructive/30 bg-destructive/5 text-destructive"
          : "border-border/70 bg-muted/30 text-muted-foreground",
      )}
    >
      <span>{message}</span>
      {actionLabel && onAction ? (
        <Button
          type="button"
          variant={isError ? "outline" : "ghost"}
          size="sm"
          onClick={onAction}
          className={cn(isError && "border-destructive/30 text-destructive hover:bg-destructive/10")}
        >
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
};

const RoleFormDialogBody = ({
  open,
  onOpenChange,
  mode,
  value,
  permissionOptions,
  isPermissionsLoading,
  permissionError,
  onRetryPermissions,
  isRoleLoading = false,
  roleLoadError,
  onRetryRole,
  isPending,
  error,
  onSubmit,
}: RoleFormDialogBodyProps) => {
  const [name, setName] = useState(value?.name ?? "");
  const [description, setDescription] = useState(value?.description ?? "");
  const [permissionIds, setPermissionIds] = useState<string[]>(
    value?.permissions.map((permission) => permission.id) ?? [],
  );
  const [permissionSearch, setPermissionSearch] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const isCreateMode = mode === "create";
  const permissionIdsKey = useMemo(() => buildPermissionIdsKey(value?.permissions), [value?.permissions]);
  const deferredPermissionSearch = useDeferredValue(permissionSearch);
  const normalizedPermissionSearch = normalizeText(deferredPermissionSearch);
  const selectedPermissionIds = useMemo(() => new Set(permissionIds), [permissionIds]);

  useEffect(() => {
    if (!open) {
      return;
    }

    setName(value?.name ?? "");
    setDescription(value?.description ?? "");
    setPermissionIds(value?.permissions.map((permission) => permission.id) ?? []);
    setPermissionSearch("");
    setNameError(null);
  }, [open, permissionIdsKey, value?.description, value?.id, value?.name]);

  const permissionGroups = useMemo<PermissionModuleGroup[]>(() => {
    const groupedPermissions = new Map<string, PermissionInfo[]>();

    for (const permission of permissionOptions) {
      const moduleName = permission.module.trim() || "General";
      const currentGroup = groupedPermissions.get(moduleName) ?? [];
      currentGroup.push(permission);
      groupedPermissions.set(moduleName, currentGroup);
    }

    return Array.from(groupedPermissions.entries())
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([module, permissions]) => {
        const sortedPermissions = [...permissions].sort((left, right) =>
          left.name.localeCompare(right.name),
        );

        const visiblePermissions = normalizedPermissionSearch
          ? sortedPermissions.filter((permission) =>
              `${module} ${permission.name} ${permission.description ?? ""}`
                .toLowerCase()
                .includes(normalizedPermissionSearch),
            )
          : sortedPermissions;

        const selectedCount = sortedPermissions.reduce(
          (count, permission) => count + (selectedPermissionIds.has(permission.id) ? 1 : 0),
          0,
        );
        const visibleSelectedCount = visiblePermissions.reduce(
          (count, permission) => count + (selectedPermissionIds.has(permission.id) ? 1 : 0),
          0,
        );

        return {
          module,
          permissions: sortedPermissions,
          visiblePermissions,
          selectedCount,
          visibleSelectedCount,
        };
      })
      .filter((group) => group.visiblePermissions.length > 0);
  }, [normalizedPermissionSearch, permissionOptions, selectedPermissionIds]);

  const serverNameError = getFieldError(error, "name");
  const resolvedNameError = nameError ?? serverNameError;

  const serverGeneralError = useMemo(() => {
    if (!error || serverNameError) {
      return null;
    }

    return getErrorMessage(error);
  }, [error, serverNameError]);

  const isFormLocked = isPending || (!isCreateMode && isRoleLoading);
  const isSubmitDisabled = isPending || (!isCreateMode && (isRoleLoading || Boolean(roleLoadError)));
  const arePermissionActionsDisabled = isFormLocked || Boolean(roleLoadError);
  const hasSearchFilter = normalizedPermissionSearch.length > 0;

  const { onOpenAutoFocus } = useEditDialogInitialFocus({
    open,
    enabled: mode === "edit",
    inputRef: nameInputRef,
    value: name,
  });

  const handleCancel = () => {
    onOpenChange(false);
  };

  const updatePermissionIds = (updater: (current: Set<string>) => void) => {
    setPermissionIds((current) => {
      const next = new Set(current);
      updater(next);
      return Array.from(next);
    });
  };

  const handleTogglePermission = (permissionId: string, checked: boolean) => {
    updatePermissionIds((current) => {
      if (checked) {
        current.add(permissionId);
        return;
      }

      current.delete(permissionId);
    });
  };

  const handleSelectPermissionBatch = (permissions: PermissionInfo[]) => {
    updatePermissionIds((current) => {
      for (const permission of permissions) {
        current.add(permission.id);
      }
    });
  };

  const handleClearPermissionBatch = (permissions: PermissionInfo[]) => {
    updatePermissionIds((current) => {
      for (const permission of permissions) {
        current.delete(permission.id);
      }
    });
  };

  const handleClearAllPermissions = () => {
    setPermissionIds([]);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = name.trim();
    const trimmedDescription = description.trim();

    if (!trimmedName) {
      setNameError("Role name is required.");
      return;
    }

    setNameError(null);
    await onSubmit({
      name: trimmedName,
      description: trimmedDescription,
      permissionIds: Array.from(new Set(permissionIds)),
    });
  };

  const title = isCreateMode ? "Create role" : "Update role";
  const submitLabel = isCreateMode ? "Create" : "Update";

  return (
    <DialogContent
      className="max-w-5xl gap-0 overflow-hidden p-0"
      onOpenAutoFocus={onOpenAutoFocus}
    >
      <div className="flex max-h-[90vh] flex-col">
        <DialogHeader className="border-b border-border/60 px-6 py-5">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 lg:overflow-hidden">
            <div className="grid gap-6 lg:h-full lg:min-h-0 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
              <div className="lg:sticky lg:top-0 lg:self-start">
                <Card className="rounded-3xl border border-border/60 shadow-sm shadow-black/5">

                <CardContent className="space-y-4 mt-2">
                  {roleLoadError ? (
                    <InlineStateCard
                      tone="error"
                      message={roleLoadError}
                      actionLabel="Retry"
                      onAction={onRetryRole}
                    />
                  ) : null}

                  {!isCreateMode && isRoleLoading ? (
                    <InlineStateCard message="Loading current role configuration..." />
                  ) : null}

                  <div className="space-y-2">
                    <Label htmlFor="role-name">Name</Label>
                    <Input
                      ref={nameInputRef}
                      id="role-name"
                      placeholder="Enter role name"
                      value={name}
                      onChange={(event) => {
                        setName(event.target.value);
                        if (nameError) {
                          setNameError(null);
                        }
                      }}
                      error={resolvedNameError}
                      disabled={isFormLocked}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role-description">Description</Label>
                    <Input
                      id="role-description"
                      placeholder="Enter description"
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                      disabled={isFormLocked}
                    />
                  </div>

                  <div className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-3">
                    <p className="mt-2 text-sm text-muted-foreground">
                      Roles can be saved without permissions, but assigned permissions define what
                      users can access.
                    </p>
                  </div>

                  {serverGeneralError ? (
                    <p className="text-sm text-destructive">{serverGeneralError}</p>
                  ) : null}
                </CardContent>
                </Card>
              </div>

              <div className="lg:min-h-0">
                <Card className="rounded-3xl border border-border/60 shadow-sm shadow-black/5 lg:flex lg:h-full lg:min-h-0 lg:flex-col lg:overflow-hidden">
                <CardHeader className="gap-3 border-b border-border/60 lg:shrink-0">
                  <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                    <div className="space-y-2">
                      <CardTitle className="text-lg">Permission setup</CardTitle>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" className="rounded-full normal-case">
                        {permissionIds.length} selected
                      </Badge>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Input
                      id="role-permission-search"
                      placeholder="Search modules, permission names, or descriptions"
                      value={permissionSearch}
                      onChange={(event) => setPermissionSearch(event.target.value)}
                      disabled={isPermissionsLoading && !permissionOptions.length}
                      className="flex-1"
                    />

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleClearAllPermissions}
                      disabled={arePermissionActionsDisabled || !permissionIds.length}
                    >
                      Clear all
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 pt-5 lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
                  {permissionError ? (
                    <InlineStateCard
                      tone="error"
                      message={permissionError}
                      actionLabel="Retry"
                      onAction={onRetryPermissions}
                    />
                  ) : null}

                  {isPermissionsLoading && !permissionOptions.length ? (
                    <InlineStateCard message="Loading available permissions..." />
                  ) : null}

                  {!permissionError && !isPermissionsLoading && !permissionOptions.length ? (
                    <InlineStateCard message="No active permissions are available right now." />
                  ) : null}

                  {!permissionError &&
                  !isPermissionsLoading &&
                  permissionOptions.length > 0 &&
                  !permissionGroups.length ? (
                    <InlineStateCard message="No permissions match the current search." />
                  ) : null}

                  {!permissionError &&
                  permissionOptions.length > 0 &&
                  permissionGroups.length > 0 ? (
                    <div className="space-y-4">
                      {permissionGroups.map((group) => (
                        <PermissionModuleCard
                          key={group.module}
                          group={group}
                          isDisabled={arePermissionActionsDisabled}
                          hasSearchFilter={hasSearchFilter}
                          selectedPermissionIds={selectedPermissionIds}
                          onTogglePermission={handleTogglePermission}
                          onSelectAll={handleSelectPermissionBatch}
                          onClear={handleClearPermissionBatch}
                        />
                      ))}
                    </div>
                  ) : null}
                </CardContent>
                </Card>
              </div>
            </div>
          </div>

          <DialogFooter className="border-t border-border/60 px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isPending} disabled={isSubmitDisabled}>
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </div>
    </DialogContent>
  );
};

export const RoleFormDialog = ({
  open,
  onOpenChange,
  mode,
  value,
  permissionOptions,
  isPermissionsLoading,
  permissionError,
  onRetryPermissions,
  isRoleLoading,
  roleLoadError,
  onRetryRole,
  isPending,
  error,
  onSubmit,
}: RoleFormDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open ? (
        <RoleFormDialogBody
          open={open}
          onOpenChange={onOpenChange}
          mode={mode}
          value={value}
          permissionOptions={permissionOptions}
          isPermissionsLoading={isPermissionsLoading}
          permissionError={permissionError}
          onRetryPermissions={onRetryPermissions}
          isRoleLoading={isRoleLoading}
          roleLoadError={roleLoadError}
          onRetryRole={onRetryRole}
          isPending={isPending}
          error={error}
          onSubmit={onSubmit}
        />
      ) : null}
    </Dialog>
  );
};
