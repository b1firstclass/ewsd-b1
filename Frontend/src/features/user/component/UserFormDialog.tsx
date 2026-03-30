import { useEffect, useMemo, useReducer, useRef, type FormEvent } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEditDialogInitialFocus } from "@/hooks/useEditDialogInitialFocus";
import { cn, getErrorMessage, getFieldError } from "@/lib/utils";
import type { Faculity } from "@/types/faculityType";
import type { Role } from "@/types/roleType";
import type { User } from "@/types/userType";
import { ChevronDown } from "lucide-react";

type UserFormMode = "create" | "edit";

export interface UserFormValues {
  loginId: string;
  fullName: string;
  email: string;
  password?: string;
  facultyIds: string[];
  roleId: string;
}

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: UserFormMode;
  value?: User | null;
  faculityOptions: Faculity[];
  roleOptions: Role[];
  isOptionsLoading: boolean;
  optionsError?: string | null;
  isUserLoading?: boolean;
  userLoadError?: string | null;
  onRetryUser?: () => void;
  isPending: boolean;
  error?: unknown;
  onSubmit: (values: UserFormValues) => Promise<void>;
}

type UserFormDialogBodyProps = UserFormDialogProps;

interface LocalFieldErrors {
  loginId?: string;
  fullName?: string;
  email?: string;
  password?: string;
  roleId?: string;
  facultyIds?: string;
}

interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectFieldProps {
  id: string;
  label: string;
  options: MultiSelectOption[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder: string;
  helperText: string;
  loadingText: string;
  emptyText: string;
  disabled?: boolean;
  loading?: boolean;
  error?: string;
}

interface SingleSelectFieldProps {
  id: string;
  label: string;
  options: MultiSelectOption[];
  selectedValue: string;
  onChange: (value: string) => void;
  placeholder: string;
  helperText: string;
  loadingText: string;
  emptyText: string;
  disabled?: boolean;
  loading?: boolean;
  error?: string;
}

interface InlineStateCardProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  tone?: "default" | "error";
}

interface UserFormState {
  loginId: string;
  fullName: string;
  email: string;
  password: string;
  facultyIds: string[];
  roleId: string;
  fieldErrors: LocalFieldErrors;
}

type UserFormAction =
  | { type: "hydrate"; value: UserFormState }
  | { type: "set-login-id"; value: string }
  | { type: "set-full-name"; value: string }
  | { type: "set-email"; value: string }
  | { type: "set-password"; value: string }
  | { type: "set-role-id"; value: string; role?: Role }
  | { type: "set-faculty-ids"; value: string[] }
  | { type: "set-field-errors"; value: LocalFieldErrors };

const resolveRoleById = (roleId: string, roleOptions: Role[], fallbackRole?: Role) => {
  if (!roleId) {
    return undefined;
  }

  return roleOptions.find((item) => item.id === roleId) ?? fallbackRole;
};

const normalizeFacultyIdsForRole = (role: Role | undefined, currentFacultyIds: string[]) => {
  if (!role?.isFacultyAssignable) {
    return [];
  }

  if (!role.isMultipleFaculty) {
    return currentFacultyIds.slice(0, 1);
  }

  return currentFacultyIds;
};

const createUserFormState = (
  mode: UserFormMode,
  value?: User | null,
  roleForNormalization?: Role,
): UserFormState => {
  const roleId = mode === "edit" ? value?.role?.id ?? "" : "";
  const rawFacultyIds = (value?.faculties ?? []).map((item) => item.id);

  return {
    loginId: value?.loginId ?? "",
    fullName: value?.fullName ?? "",
    email: value?.email ?? "",
    password: "",
    facultyIds:
      mode === "edit"
        ? roleForNormalization
          ? normalizeFacultyIdsForRole(roleForNormalization, rawFacultyIds)
          : rawFacultyIds
        : [],
    roleId,
    fieldErrors: {},
  };
};

const userFormReducer = (state: UserFormState, action: UserFormAction): UserFormState => {
  switch (action.type) {
    case "hydrate":
      return action.value;
    case "set-login-id":
      return {
        ...state,
        loginId: action.value,
        fieldErrors: { ...state.fieldErrors, loginId: undefined },
      };
    case "set-full-name":
      return {
        ...state,
        fullName: action.value,
        fieldErrors: { ...state.fieldErrors, fullName: undefined },
      };
    case "set-email":
      return {
        ...state,
        email: action.value,
        fieldErrors: { ...state.fieldErrors, email: undefined },
      };
    case "set-password":
      return {
        ...state,
        password: action.value,
        fieldErrors: { ...state.fieldErrors, password: undefined },
      };
    case "set-role-id":
      return {
        ...state,
        roleId: action.value,
        facultyIds: normalizeFacultyIdsForRole(action.role, state.facultyIds),
        fieldErrors: {
          ...state.fieldErrors,
          roleId: undefined,
          facultyIds: undefined,
        },
      };
    case "set-faculty-ids":
      return {
        ...state,
        facultyIds: action.value,
        fieldErrors: { ...state.fieldErrors, facultyIds: undefined },
      };
    case "set-field-errors":
      return {
        ...state,
        fieldErrors: action.value,
      };
    default:
      return state;
  }
};

const toggleSelectedValue = (current: string[], value: string, checked: boolean) => {
  if (checked) {
    return current.includes(value) ? current : [...current, value];
  }

  return current.filter((item) => item !== value);
};

const MultiSelectField = ({
  id,
  label,
  options,
  selectedValues,
  onChange,
  placeholder,
  helperText,
  loadingText,
  emptyText,
  disabled = false,
  loading = false,
  error,
}: MultiSelectFieldProps) => {
  const selectedOptionLabels = options
    .filter((option) => selectedValues.includes(option.value))
    .map((option) => option.label);

  const summaryText = selectedOptionLabels.length
    ? `${selectedOptionLabels.length} selected`
    : placeholder;

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            disabled={disabled}
            className={cn(
              "h-11 w-full justify-between rounded-xl font-normal",
              error && "border-destructive focus-visible:ring-destructive",
            )}
          >
            <span className="truncate text-left">{summaryText}</span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="z-[60] w-[var(--radix-dropdown-menu-trigger-width)] max-h-60 overflow-y-auto"
        >
          {loading && !options.length ? (
            <DropdownMenuItem disabled>{loadingText}</DropdownMenuItem>
          ) : options.length ? (
            options.map((option) => (
              <DropdownMenuCheckboxItem
                key={option.value}
                checked={selectedValues.includes(option.value)}
                onCheckedChange={(checked) =>
                  onChange(toggleSelectedValue(selectedValues, option.value, checked === true))
                }
                onSelect={(event) => event.preventDefault()}
              >
                {option.label}
              </DropdownMenuCheckboxItem>
            ))
          ) : (
            <DropdownMenuItem disabled>{emptyText}</DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <p className={cn("text-xs text-muted-foreground", error && "text-destructive")}>
        {error ?? helperText}
      </p>

      {selectedOptionLabels.length ? (
        <div className="flex flex-wrap gap-1">
          {selectedOptionLabels.slice(0, 3).map((selectedLabel) => (
            <Badge key={selectedLabel} variant="secondary" className="rounded-full normal-case">
              {selectedLabel}
            </Badge>
          ))}
          {selectedOptionLabels.length > 3 ? (
            <Badge variant="outline" className="rounded-full normal-case">
              +{selectedOptionLabels.length - 3} more
            </Badge>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

const SingleSelectField = ({
  id,
  label,
  options,
  selectedValue,
  onChange,
  placeholder,
  helperText,
  loadingText,
  emptyText,
  disabled = false,
  loading = false,
  error,
}: SingleSelectFieldProps) => {
  const selectedOption = options.find((option) => option.value === selectedValue);
  const summaryText = selectedOption?.label ?? placeholder;

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            disabled={disabled}
            className={cn(
              "h-11 w-full justify-between rounded-xl font-normal",
              error && "border-destructive focus-visible:ring-destructive",
            )}
          >
            <span className="truncate text-left">{summaryText}</span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="z-[60] w-[var(--radix-dropdown-menu-trigger-width)] max-h-60 overflow-y-auto"
        >
          {loading && !options.length ? (
            <DropdownMenuItem disabled>{loadingText}</DropdownMenuItem>
          ) : options.length ? (
            options.map((option) => (
              <DropdownMenuCheckboxItem
                key={option.value}
                checked={selectedValue === option.value}
                onCheckedChange={(checked) => {
                  if (checked === true) {
                    onChange(option.value);
                  }
                }}
                onSelect={(event) => event.preventDefault()}
              >
                {option.label}
              </DropdownMenuCheckboxItem>
            ))
          ) : (
            <DropdownMenuItem disabled>{emptyText}</DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <p className={cn("text-xs text-muted-foreground", error && "text-destructive")}>
        {error ?? helperText}
      </p>

      {selectedOption ? (
        <div className="flex flex-wrap gap-1">
          <Badge variant="secondary" className="rounded-full normal-case">
            {selectedOption.label}
          </Badge>
        </div>
      ) : null}
    </div>
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

const UserFormDialogBody = ({
  open,
  onOpenChange,
  mode,
  value,
  faculityOptions,
  roleOptions,
  isOptionsLoading,
  optionsError,
  isUserLoading = false,
  userLoadError,
  onRetryUser,
  isPending,
  error,
  onSubmit,
}: UserFormDialogBodyProps) => {
  const isCreateMode = mode === "create";
  const initialRoleForNormalization = resolveRoleById(value?.role?.id ?? "", roleOptions);
  const [state, dispatch] = useReducer(userFormReducer, undefined, () =>
    createUserFormState(mode, value, initialRoleForNormalization),
  );
  const loginIdInputRef = useRef<HTMLInputElement>(null);
  const valueRoleId = value?.role?.id ?? "";
  const hydratedRawFacultyIds = useMemo(
    () => (value?.faculties ?? []).map((item) => item.id),
    [value?.faculties],
  );
  const hydrationRole = useMemo(
    () => resolveRoleById(valueRoleId, roleOptions),
    [roleOptions, valueRoleId],
  );
  const hydratedState = useMemo(
    () => ({
      loginId: value?.loginId ?? "",
      fullName: value?.fullName ?? "",
      email: value?.email ?? "",
      password: "",
      facultyIds:
        mode === "edit"
          ? hydrationRole
            ? normalizeFacultyIdsForRole(hydrationRole, hydratedRawFacultyIds)
            : hydratedRawFacultyIds
          : [],
      roleId: mode === "edit" ? valueRoleId : "",
      fieldErrors: {},
    }),
    [
      hydratedRawFacultyIds,
      hydrationRole,
      mode,
      value?.email,
      value?.fullName,
      value?.loginId,
      valueRoleId,
    ],
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    dispatch({
      type: "hydrate",
      value: hydratedState,
    });
  }, [hydratedState, open]);

  const serverLoginIdError = getFieldError(error, "loginId");
  const serverFullNameError = getFieldError(error, "fullName");
  const serverEmailError = getFieldError(error, "email");
  const serverPasswordError = getFieldError(error, "password");
  const serverRoleIdError = getFieldError(error, "roleId");
  const serverFacultyIdsError = getFieldError(error, "facultyIds");

  const resolvedLoginIdError = state.fieldErrors.loginId ?? serverLoginIdError;
  const resolvedFullNameError = state.fieldErrors.fullName ?? serverFullNameError;
  const resolvedEmailError = state.fieldErrors.email ?? serverEmailError;
  const resolvedPasswordError = state.fieldErrors.password ?? serverPasswordError;
  const resolvedRoleIdError = state.fieldErrors.roleId ?? serverRoleIdError;
  const resolvedFacultyIdsError = state.fieldErrors.facultyIds ?? serverFacultyIdsError;
  const selectedRole = useMemo(
    () => resolveRoleById(state.roleId, roleOptions, value?.role),
    [roleOptions, state.roleId, value?.role],
  );
  const isFacultyAssignable = selectedRole?.isFacultyAssignable ?? false;
  const isMultipleFaculty = selectedRole?.isMultipleFaculty ?? false;
  const normalizedFacultyIds = useMemo(
    () => normalizeFacultyIdsForRole(selectedRole, state.facultyIds),
    [selectedRole, state.facultyIds],
  );

  const serverGeneralError = useMemo(() => {
    if (!error) {
      return null;
    }

    const hasMappedFieldError =
      serverLoginIdError ||
      serverFullNameError ||
      serverEmailError ||
      (isCreateMode && serverPasswordError) ||
      serverRoleIdError ||
      serverFacultyIdsError;

    if (hasMappedFieldError) {
      return null;
    }

    return getErrorMessage(error);
  }, [
    error,
    isCreateMode,
    serverEmailError,
    serverFacultyIdsError,
    serverFullNameError,
    serverLoginIdError,
    serverPasswordError,
    serverRoleIdError,
  ]);

  const handleCancel = () => {
    onOpenChange(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isCreateMode && (isUserLoading || userLoadError)) {
      return;
    }

    const trimmedLoginId = state.loginId.trim();
    const trimmedFullName = state.fullName.trim();
    const trimmedEmail = state.email.trim();
    const trimmedPassword = state.password.trim();

    const nextErrors: LocalFieldErrors = {};

    if (!trimmedLoginId) {
      nextErrors.loginId = "Login ID is required.";
    }

    if (!trimmedFullName) {
      nextErrors.fullName = "Full name is required.";
    }

    if (!trimmedEmail) {
      nextErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      nextErrors.email = "Please enter a valid email address.";
    }

    if (isCreateMode && !trimmedPassword) {
      nextErrors.password = "Password is required.";
    }

    if (!state.roleId) {
      nextErrors.roleId = "Role is required.";
    }

    if (selectedRole?.isFacultyAssignable) {
      if (normalizedFacultyIds.length === 0) {
        nextErrors.facultyIds = "At least one faculty is required for this role.";
      } else if (!selectedRole.isMultipleFaculty && normalizedFacultyIds.length > 1) {
        nextErrors.facultyIds = "Only one faculty can be selected for this role.";
      }
    }

    dispatch({ type: "set-field-errors", value: nextErrors });
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    await onSubmit({
      loginId: trimmedLoginId,
      fullName: trimmedFullName,
      email: trimmedEmail,
      password: isCreateMode ? trimmedPassword : undefined,
      facultyIds: normalizedFacultyIds,
      roleId: state.roleId,
    });
  };

  const title = isCreateMode ? "Create user" : "Update user";
  const submitLabel = isCreateMode ? "Create" : "Update";
  const isFormLocked = isPending || (!isCreateMode && isUserLoading);
  const isFormDisabled = isFormLocked || Boolean(userLoadError);
  const isSubmitDisabled = isPending || (!isCreateMode && (isUserLoading || Boolean(userLoadError)));
  const isRoleDisabled = isFormDisabled || (isOptionsLoading && !roleOptions.length);
  const isFaculityDisabled = isFormDisabled || (isOptionsLoading && !faculityOptions.length);
  const facultyOptions = faculityOptions.map((item) => ({ value: item.id, label: item.name }));
  const { onOpenAutoFocus } = useEditDialogInitialFocus({
    open,
    enabled: mode === "edit",
    inputRef: loginIdInputRef,
    value: state.loginId,
  });

  return (
    <DialogContent
      className="max-h-[85vh] overflow-y-auto"
      onOpenAutoFocus={onOpenAutoFocus}
    >
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="user-login-id">Login ID</Label>
          <Input
            ref={loginIdInputRef}
            id="user-login-id"
            placeholder="Enter login ID"
            value={state.loginId}
            onChange={(event) => dispatch({ type: "set-login-id", value: event.target.value })}
            error={resolvedLoginIdError}
            disabled={isFormDisabled}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="user-full-name">Full Name</Label>
          <Input
            id="user-full-name"
            placeholder="Enter full name"
            value={state.fullName}
            onChange={(event) => dispatch({ type: "set-full-name", value: event.target.value })}
            error={resolvedFullNameError}
            disabled={isFormDisabled}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="user-email">Email</Label>
          <Input
            id="user-email"
            type="email"
            placeholder="Enter email"
            value={state.email}
            onChange={(event) => dispatch({ type: "set-email", value: event.target.value })}
            error={resolvedEmailError}
            disabled={isFormDisabled}
          />
        </div>

        {isCreateMode ? (
          <div className="space-y-2">
            <Label htmlFor="user-password">Password</Label>
            <Input
              id="user-password"
              type="password"
              placeholder="Enter password"
              value={state.password}
              onChange={(event) => dispatch({ type: "set-password", value: event.target.value })}
              error={resolvedPasswordError}
              disabled={isFormDisabled}
            />
          </div>
        ) : null}

        {!isCreateMode && userLoadError ? (
          <InlineStateCard
            tone="error"
            message={userLoadError}
            actionLabel="Retry"
            onAction={onRetryUser}
          />
        ) : null}

        {!isCreateMode && isUserLoading ? (
          <InlineStateCard message="Loading current user details..." />
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <SingleSelectField
            id="user-roles"
            label="Roles"
            options={roleOptions.map((item) => ({ value: item.id, label: item.name }))}
            selectedValue={state.roleId}
            onChange={(nextRoleId) => {
              const nextRole = resolveRoleById(nextRoleId, roleOptions, value?.role);

              dispatch({ type: "set-role-id", value: nextRoleId, role: nextRole });
            }}
            placeholder="Select a role"
            helperText="Choose one role."
            loadingText="Loading roles..."
            emptyText="No roles available."
            disabled={isRoleDisabled}
            loading={isOptionsLoading}
            error={resolvedRoleIdError}
          />

          {isFacultyAssignable ? (
            isMultipleFaculty ? (
              <MultiSelectField
                id="user-faculties"
                label="Faculties"
                options={facultyOptions}
                selectedValues={normalizedFacultyIds}
                onChange={(nextFacultyIds) => dispatch({ type: "set-faculty-ids", value: nextFacultyIds })}
                placeholder="Select faculties"
                helperText="Choose multiple values from the dropdown."
                loadingText="Loading faculties..."
                emptyText="No faculties available."
                disabled={isFaculityDisabled}
                loading={isOptionsLoading}
                error={resolvedFacultyIdsError}
              />
            ) : (
              <SingleSelectField
                id="user-faculties"
                label="Faculty"
                options={facultyOptions}
                selectedValue={normalizedFacultyIds[0] ?? ""}
                onChange={(nextFacultyId) =>
                  dispatch({ type: "set-faculty-ids", value: nextFacultyId ? [nextFacultyId] : [] })
                }
                placeholder="Select a faculty"
                helperText="Choose one faculty."
                loadingText="Loading faculties..."
                emptyText="No faculties available."
                disabled={isFaculityDisabled}
                loading={isOptionsLoading}
                error={resolvedFacultyIdsError}
              />
            )
          ) : null}
        </div>

        {optionsError ? <p className="text-sm text-destructive">{optionsError}</p> : null}
        {serverGeneralError ? <p className="text-sm text-destructive">{serverGeneralError}</p> : null}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleCancel} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isPending} disabled={isSubmitDisabled}>
            {submitLabel}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};

export const UserFormDialog = ({
  open,
  onOpenChange,
  mode,
  value,
  faculityOptions,
  roleOptions,
  isOptionsLoading,
  optionsError,
  isUserLoading,
  userLoadError,
  onRetryUser,
  isPending,
  error,
  onSubmit,
}: UserFormDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open ? (
        <UserFormDialogBody
          open={open}
          onOpenChange={onOpenChange}
          mode={mode}
          value={value}
          faculityOptions={faculityOptions}
          roleOptions={roleOptions}
          isOptionsLoading={isOptionsLoading}
          optionsError={optionsError}
          isUserLoading={isUserLoading}
          userLoadError={userLoadError}
          onRetryUser={onRetryUser}
          isPending={isPending}
          error={error}
          onSubmit={onSubmit}
        />
      ) : null}
    </Dialog>
  );
};
