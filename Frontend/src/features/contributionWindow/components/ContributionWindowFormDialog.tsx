import { useMemo, useRef, useState, type FormEvent } from "react";

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
import { useEditDialogInitialFocus } from "@/hooks/useEditDialogInitialFocus";
import { getErrorMessage, getFieldError } from "@/lib/utils";
import type { ContributionWindowInfo } from "@/types/contributionWindowType";

type ContributionWindowFormMode = "create" | "edit";

export interface ContributionWindowFormValues {
  submissionOpenDate: string;
  submissionEndDate: string;
  closureDate: string;
  academicYearStart: number;
  academicYearEnd: number;
}

interface ContributionWindowFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: ContributionWindowFormMode;
  value?: ContributionWindowInfo | null;
  isPending: boolean;
  error?: unknown;
  onSubmit: (values: ContributionWindowFormValues) => Promise<void>;
}

interface LocalFieldErrors {
  submissionOpenDate?: string;
  submissionEndDate?: string;
  closureDate?: string;
  academicYearStart?: string;
  academicYearEnd?: string;
}

const normalizeDateInputValue = (value?: string) => value?.slice(0, 10) ?? "";

const ContributionWindowFormDialogBody = ({
  open,
  onOpenChange,
  mode,
  value,
  isPending,
  error,
  onSubmit,
}: ContributionWindowFormDialogProps) => {
  const [submissionOpenDate, setSubmissionOpenDate] = useState(normalizeDateInputValue(value?.submissionOpenDate));
  const [submissionEndDate, setSubmissionEndDate] = useState(normalizeDateInputValue(value?.submissionEndDate));
  const [closureDate, setClosureDate] = useState(normalizeDateInputValue(value?.closureDate));
  const [academicYearStart, setAcademicYearStart] = useState(value?.academicYearStart?.toString() ?? "");
  const [academicYearEnd, setAcademicYearEnd] = useState(value?.academicYearEnd?.toString() ?? "");
  const [fieldErrors, setFieldErrors] = useState<LocalFieldErrors>({});
  const academicYearStartInputRef = useRef<HTMLInputElement>(null);

  const isCreateMode = mode === "create";

  const serverSubmissionOpenDateError = getFieldError(error, "submissionOpenDate");
  const serverSubmissionEndDateError = getFieldError(error, "submissionEndDate");
  const serverClosureDateError = getFieldError(error, "closureDate");
  const serverAcademicYearStartError = getFieldError(error, "academicYearStart");
  const serverAcademicYearEndError = getFieldError(error, "academicYearEnd");

  const resolvedSubmissionOpenDateError = fieldErrors.submissionOpenDate ?? serverSubmissionOpenDateError;
  const resolvedSubmissionEndDateError = fieldErrors.submissionEndDate ?? serverSubmissionEndDateError;
  const resolvedClosureDateError = fieldErrors.closureDate ?? serverClosureDateError;
  const resolvedAcademicYearStartError = fieldErrors.academicYearStart ?? serverAcademicYearStartError;
  const resolvedAcademicYearEndError = fieldErrors.academicYearEnd ?? serverAcademicYearEndError;

  const serverGeneralError = useMemo(() => {
    if (!error) {
      return null;
    }

    const hasMappedFieldError =
      serverSubmissionOpenDateError ||
      serverSubmissionEndDateError ||
      serverClosureDateError ||
      serverAcademicYearStartError ||
      serverAcademicYearEndError;

    if (hasMappedFieldError) {
      return null;
    }

    return getErrorMessage(error);
  }, [
    error,
    serverAcademicYearEndError,
    serverAcademicYearStartError,
    serverClosureDateError,
    serverSubmissionEndDateError,
    serverSubmissionOpenDateError,
  ]);

  const handleCancel = () => {
    onOpenChange(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedSubmissionOpenDate = submissionOpenDate.trim();
    const trimmedSubmissionEndDate = submissionEndDate.trim();
    const trimmedClosureDate = closureDate.trim();
    const trimmedAcademicYearStart = academicYearStart.trim();
    const trimmedAcademicYearEnd = academicYearEnd.trim();

    const nextErrors: LocalFieldErrors = {};

    if (!trimmedSubmissionOpenDate) {
      nextErrors.submissionOpenDate = "Submission open date is required.";
    }

    if (!trimmedSubmissionEndDate) {
      nextErrors.submissionEndDate = "Submission end date is required.";
    }

    if (!trimmedClosureDate) {
      nextErrors.closureDate = "Closure date is required.";
    }

    const parsedAcademicYearStart = Number.parseInt(trimmedAcademicYearStart, 10);
    if (!trimmedAcademicYearStart) {
      nextErrors.academicYearStart = "Academic year start is required.";
    } else if (!Number.isInteger(parsedAcademicYearStart)) {
      nextErrors.academicYearStart = "Academic year start must be a valid year.";
    }

    const parsedAcademicYearEnd = Number.parseInt(trimmedAcademicYearEnd, 10);
    if (!trimmedAcademicYearEnd) {
      nextErrors.academicYearEnd = "Academic year end is required.";
    } else if (!Number.isInteger(parsedAcademicYearEnd)) {
      nextErrors.academicYearEnd = "Academic year end must be a valid year.";
    }

    if (
      Number.isInteger(parsedAcademicYearStart) &&
      Number.isInteger(parsedAcademicYearEnd) &&
      parsedAcademicYearEnd < parsedAcademicYearStart
    ) {
      nextErrors.academicYearEnd = "Academic year end must be greater than or equal to the start year.";
    }

    if (
      trimmedSubmissionOpenDate &&
      trimmedSubmissionEndDate &&
      trimmedSubmissionEndDate < trimmedSubmissionOpenDate
    ) {
      nextErrors.submissionEndDate = "Submission end date must be on or after the open date.";
    }

    if (
      trimmedSubmissionEndDate &&
      trimmedClosureDate &&
      trimmedClosureDate < trimmedSubmissionEndDate
    ) {
      nextErrors.closureDate = "Closure date must be on or after the submission end date.";
    }

    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    await onSubmit({
      submissionOpenDate: trimmedSubmissionOpenDate,
      submissionEndDate: trimmedSubmissionEndDate,
      closureDate: trimmedClosureDate,
      academicYearStart: parsedAcademicYearStart,
      academicYearEnd: parsedAcademicYearEnd,
    });
  };

  const title = isCreateMode ? "Create contribution window" : "Update contribution window";
  const submitLabel = isCreateMode ? "Create" : "Update";
  const { onOpenAutoFocus } = useEditDialogInitialFocus({
    open,
    enabled: mode === "edit",
    inputRef: academicYearStartInputRef,
    value: academicYearStart,
  });

  return (
    <DialogContent
      className="max-h-[85vh] overflow-y-auto sm:max-w-2xl"
      onOpenAutoFocus={onOpenAutoFocus}
    >
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="contribution-window-academic-year-start">Academic Year Start</Label>
            <Input
              ref={academicYearStartInputRef}
              id="contribution-window-academic-year-start"
              type="number"
              inputMode="numeric"
              placeholder="Enter start year"
              value={academicYearStart}
              onChange={(event) => {
                setAcademicYearStart(event.target.value);
                if (fieldErrors.academicYearStart) {
                  setFieldErrors((current) => ({ ...current, academicYearStart: undefined }));
                }
              }}
              error={resolvedAcademicYearStartError}
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contribution-window-academic-year-end">Academic Year End</Label>
            <Input
              id="contribution-window-academic-year-end"
              type="number"
              inputMode="numeric"
              min={academicYearStart || undefined}
              placeholder="Enter end year"
              value={academicYearEnd}
              onChange={(event) => {
                setAcademicYearEnd(event.target.value);
                if (fieldErrors.academicYearEnd) {
                  setFieldErrors((current) => ({ ...current, academicYearEnd: undefined }));
                }
              }}
              error={resolvedAcademicYearEndError}
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contribution-window-submission-open-date">Submission Open Date</Label>
            <Input
              id="contribution-window-submission-open-date"
              type="date"
              value={submissionOpenDate}
              onChange={(event) => {
                setSubmissionOpenDate(event.target.value);
                if (fieldErrors.submissionOpenDate) {
                  setFieldErrors((current) => ({ ...current, submissionOpenDate: undefined }));
                }
              }}
              error={resolvedSubmissionOpenDateError}
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contribution-window-submission-end-date">Submission End Date</Label>
            <Input
              id="contribution-window-submission-end-date"
              type="date"
              min={submissionOpenDate || undefined}
              value={submissionEndDate}
              onChange={(event) => {
                setSubmissionEndDate(event.target.value);
                if (fieldErrors.submissionEndDate) {
                  setFieldErrors((current) => ({ ...current, submissionEndDate: undefined }));
                }
              }}
              error={resolvedSubmissionEndDateError}
              disabled={isPending}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="contribution-window-closure-date">Closure Date</Label>
          <Input
            id="contribution-window-closure-date"
            type="date"
            min={submissionEndDate || undefined}
            value={closureDate}
            onChange={(event) => {
              setClosureDate(event.target.value);
              if (fieldErrors.closureDate) {
                setFieldErrors((current) => ({ ...current, closureDate: undefined }));
              }
            }}
            error={resolvedClosureDateError}
            disabled={isPending}
          />
        </div>

        {serverGeneralError ? (
          <p className="text-sm text-destructive">{serverGeneralError}</p>
        ) : null}

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

export const ContributionWindowFormDialog = ({
  open,
  onOpenChange,
  mode,
  value,
  isPending,
  error,
  onSubmit,
}: ContributionWindowFormDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open ? (
        <ContributionWindowFormDialogBody
          key={`${mode}-${value?.id ?? "create"}`}
          open={open}
          onOpenChange={onOpenChange}
          mode={mode}
          value={value}
          isPending={isPending}
          error={error}
          onSubmit={onSubmit}
        />
      ) : null}
    </Dialog>
  );
};
