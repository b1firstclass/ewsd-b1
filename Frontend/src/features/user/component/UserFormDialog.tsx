import { useMemo, useRef, useState, type FormEvent } from "react";

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
import { getErrorMessage, getFieldError } from "@/lib/utils";
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
  loadingText: string;
  emptyText: string;
  disabled?: boolean;
  loading?: boolean;
}

interface SingleSelectFieldProps {
  id: string;
  label: string;
  options: MultiSelectOption[];
  selectedValue: string;
  onChange: (value: string) => void;
  placeholder: string;
  loadingText: string;
  emptyText: string;
  disabled?: boolean;
  loading?: boolean;
}

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
  loadingText,
  emptyText,
  disabled = false,
  loading = false,
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
            className="h-11 w-full justify-between rounded-xl font-normal"
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

      <p className="text-xs text-muted-foreground">Choose multiple values from the dropdown.</p>

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
  loadingText,
  emptyText,
  disabled = false,
  loading = false,
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
            className="h-11 w-full justify-between rounded-xl font-normal"
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

      <p className="text-xs text-muted-foreground">Choose one role.</p>

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

const UserFormDialogBody = ({
  open,
  onOpenChange,
  mode,
  value,
  faculityOptions,
  roleOptions,
  isOptionsLoading,
  optionsError,
  isPending,
  error,
  onSubmit,
}: UserFormDialogBodyProps) => {
  const [loginId, setLoginId] = useState(value?.loginId ?? "");
  const [fullName, setFullName] = useState(value?.fullName ?? "");
  const [email, setEmail] = useState(value?.email ?? "");
  const [password, setPassword] = useState("");
  const [facultyIds, setFacultyIds] = useState<string[]>(value?.faculties?.map((item) => item.id) ?? []);
  const [roleId, setRoleId] = useState<string>(value?.role?.id ?? "");
  const [fieldErrors, setFieldErrors] = useState<LocalFieldErrors>({});
  const loginIdInputRef = useRef<HTMLInputElement>(null);

  const isCreateMode = mode === "create";

  const serverLoginIdError = getFieldError(error, "loginId");
  const serverFullNameError = getFieldError(error, "fullName");
  const serverEmailError = getFieldError(error, "email");
  const serverPasswordError = getFieldError(error, "password");

  const resolvedLoginIdError = fieldErrors.loginId ?? serverLoginIdError;
  const resolvedFullNameError = fieldErrors.fullName ?? serverFullNameError;
  const resolvedEmailError = fieldErrors.email ?? serverEmailError;
  const resolvedPasswordError = fieldErrors.password ?? serverPasswordError;

  const serverGeneralError = useMemo(() => {
    if (!error) {
      return null;
    }

    const hasMappedFieldError =
      serverLoginIdError ||
      serverFullNameError ||
      serverEmailError ||
      (isCreateMode && serverPasswordError);

    if (hasMappedFieldError) {
      return null;
    }

    return getErrorMessage(error);
  }, [error, isCreateMode, serverEmailError, serverFullNameError, serverLoginIdError, serverPasswordError]);

  const handleCancel = () => {
    onOpenChange(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedLoginId = loginId.trim();
    const trimmedFullName = fullName.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

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

    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    await onSubmit({
      loginId: trimmedLoginId,
      fullName: trimmedFullName,
      email: trimmedEmail,
      password: isCreateMode ? trimmedPassword : undefined,
      facultyIds,
      roleId,
    });
  };

  const title = isCreateMode ? "Create user" : "Update user";
  const submitLabel = isCreateMode ? "Create" : "Update";
  const isFaculityDisabled = isPending || (isOptionsLoading && !faculityOptions.length);
  const isRoleDisabled = isPending || (isOptionsLoading && !roleOptions.length);
  const { onOpenAutoFocus } = useEditDialogInitialFocus({
    open,
    enabled: mode === "edit",
    inputRef: loginIdInputRef,
    value: loginId,
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
            value={loginId}
            onChange={(event) => {
              setLoginId(event.target.value);
              if (fieldErrors.loginId) {
                setFieldErrors((current) => ({ ...current, loginId: undefined }));
              }
            }}
            error={resolvedLoginIdError}
            disabled={isPending}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="user-full-name">Full Name</Label>
          <Input
            id="user-full-name"
            placeholder="Enter full name"
            value={fullName}
            onChange={(event) => {
              setFullName(event.target.value);
              if (fieldErrors.fullName) {
                setFieldErrors((current) => ({ ...current, fullName: undefined }));
              }
            }}
            error={resolvedFullNameError}
            disabled={isPending}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="user-email">Email</Label>
          <Input
            id="user-email"
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              if (fieldErrors.email) {
                setFieldErrors((current) => ({ ...current, email: undefined }));
              }
            }}
            error={resolvedEmailError}
            disabled={isPending}
          />
        </div>

        {isCreateMode ? (
          <div className="space-y-2">
            <Label htmlFor="user-password">Password</Label>
            <Input
              id="user-password"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                if (fieldErrors.password) {
                  setFieldErrors((current) => ({ ...current, password: undefined }));
                }
              }}
              error={resolvedPasswordError}
              disabled={isPending}
            />
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <MultiSelectField
            id="user-faculties"
            label="Faculties"
            options={faculityOptions.map((item) => ({ value: item.id, label: item.name }))}
            selectedValues={facultyIds}
            onChange={setFacultyIds}
            placeholder="Select faculties"
            loadingText="Loading faculties..."
            emptyText="No faculties available."
            disabled={isFaculityDisabled}
            loading={isOptionsLoading}
          />

          <SingleSelectField
            id="user-roles"
            label="Roles"
            options={roleOptions.map((item) => ({ value: item.id, label: item.name }))}
            selectedValue={roleId}
            onChange={setRoleId}
            placeholder="Select a role"
            loadingText="Loading roles..."
            emptyText="No roles available."
            disabled={isRoleDisabled}
            loading={isOptionsLoading}
          />
        </div>

        {optionsError ? <p className="text-sm text-destructive">{optionsError}</p> : null}
        {serverGeneralError ? <p className="text-sm text-destructive">{serverGeneralError}</p> : null}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleCancel} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isPending}>
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
  isPending,
  error,
  onSubmit,
}: UserFormDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open ? (
        <UserFormDialogBody
          key={`${mode}-${value?.id ?? "create"}`}
          open={open}
          onOpenChange={onOpenChange}
          mode={mode}
          value={value}
          faculityOptions={faculityOptions}
          roleOptions={roleOptions}
          isOptionsLoading={isOptionsLoading}
          optionsError={optionsError}
          isPending={isPending}
          error={error}
          onSubmit={onSubmit}
        />
      ) : null}
    </Dialog>
  );
};
