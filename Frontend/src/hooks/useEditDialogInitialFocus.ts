import { useCallback, useEffect, type ComponentPropsWithoutRef, type RefObject } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";

type DialogOpenAutoFocusHandler = NonNullable<
  ComponentPropsWithoutRef<typeof DialogPrimitive.Content>["onOpenAutoFocus"]
>;

interface UseEditDialogInitialFocusParams {
  open: boolean;
  enabled: boolean;
  inputRef: RefObject<HTMLInputElement | null>;
  value: string;
}

export const useEditDialogInitialFocus = ({
  open,
  enabled,
  inputRef,
  value,
}: UseEditDialogInitialFocusParams) => {
  const onOpenAutoFocus = useCallback<DialogOpenAutoFocusHandler>(
    (event) => {
      if (enabled) {
        event.preventDefault();
      }
    },
    [enabled],
  );

  useEffect(() => {
    if (!open || !enabled) {
      return;
    }

    const frameId = requestAnimationFrame(() => {
      const input = inputRef.current;
      if (!input || input.disabled) {
        return;
      }

      input.focus({ preventScroll: true });
      input.setSelectionRange(value.length, value.length);
    });

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [enabled, inputRef, open, value]);

  return { onOpenAutoFocus };
};
