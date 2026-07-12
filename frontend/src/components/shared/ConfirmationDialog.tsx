"use client";

import React from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-dialog";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ConfirmationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  isDestructive?: boolean;
  isLoading?: boolean;
}

export function ConfirmationDialog({
  isOpen,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  isDestructive = false,
  isLoading = false,
}: ConfirmationDialogProps) {
  const [loading, setLoading] = React.useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const showLoading = isLoading || loading;

  return (
    <AlertDialogPrimitive.Root open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogPrimitive.Portal>
        {/* Backdrop overlay */}
        <AlertDialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-all duration-150 animate-in fade-in" />
        
        {/* Content container */}
        <AlertDialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-6 border border-[hsl(var(--color-border))] bg-white p-6 shadow-lg duration-200 animate-in fade-in slide-in-from-top rounded-[hsl(var(--radius))] dark:bg-slate-900 focus:outline-none">
          <div className="flex gap-4">
            {/* Warning icon container for destructive actions */}
            {isDestructive && (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-[hsl(var(--color-destructive))] dark:bg-red-950/20">
                <AlertTriangle className="h-5 w-5" />
              </div>
            )}
            <div className="flex flex-col gap-1.5">
              <AlertDialogPrimitive.Title className="text-lg font-semibold text-[hsl(var(--color-foreground))]">
                {title}
              </AlertDialogPrimitive.Title>
              <AlertDialogPrimitive.Description className="text-sm text-[hsl(var(--color-muted-foreground))]">
                {description}
              </AlertDialogPrimitive.Description>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
            <AlertDialogPrimitive.Close asChild>
              <Button
                variant="outline"
                disabled={showLoading}
                className="w-full sm:w-auto"
              >
                {cancelLabel}
              </Button>
            </AlertDialogPrimitive.Close>
            <Button
              variant={isDestructive ? "destructive" : "primary"}
              onClick={handleConfirm}
              isLoading={showLoading}
              className="w-full sm:w-auto"
            >
              {confirmLabel}
            </Button>
          </div>

          {/* Close icon button */}
          <AlertDialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4 text-slate-400" />
            <span className="sr-only">Close</span>
          </AlertDialogPrimitive.Close>
        </AlertDialogPrimitive.Content>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  );
}

export default ConfirmationDialog;
