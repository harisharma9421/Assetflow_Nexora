"use client";

import React from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={id}
            className="text-sm font-medium text-[hsl(var(--color-foreground))]"
          >
            {label}
            {props.required && (
              <span className="ml-1 text-[hsl(var(--color-destructive))]">*</span>
            )}
          </label>
        )}
        <input
          id={id}
          ref={ref}
          className={cn(
            "h-10 w-full rounded-md border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error
              ? "border-destructive focus:ring-destructive"
              : "border-border hover:border-primary/50",
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-xs text-[hsl(var(--color-destructive))]">{error}</p>
        )}
        {hint && !error && (
          <p className="text-xs text-[hsl(var(--color-muted-foreground))]">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

// ─── Password Input ────────────────────────────────────────────────────────────

export type PasswordInputProps = Omit<InputProps, "type">;

export const PasswordInput = React.forwardRef<
  HTMLInputElement,
  PasswordInputProps
>(({ className, ...props }, ref) => {
  const [show, setShow] = React.useState(false);

  return (
    <div className="flex flex-col gap-1.5">
      {props.label && (
        <label
          htmlFor={props.id}
          className="text-sm font-medium text-[hsl(var(--color-foreground))]"
        >
          {props.label}
          {props.required && (
            <span className="ml-1 text-[hsl(var(--color-destructive))]">*</span>
          )}
        </label>
      )}
      <div className="relative">
        <input
          ref={ref}
          id={props.id}
          type={show ? "text" : "password"}
          className={cn(
            "h-10 w-full rounded-md border bg-card px-3 py-2 pr-10 text-sm text-foreground placeholder:text-muted-foreground transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
            "disabled:cursor-not-allowed disabled:opacity-50",
            props.error
              ? "border-destructive focus:ring-destructive"
              : "border-border hover:border-primary/50",
            className
          )}
          disabled={props.disabled}
          placeholder={props.placeholder}
          name={props.name}
          autoComplete={props.autoComplete}
          {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShow((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--color-muted-foreground))] hover:text-[hsl(var(--color-foreground))] transition-colors"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {props.error && (
        <p className="text-xs text-[hsl(var(--color-destructive))]">{props.error}</p>
      )}
      {props.hint && !props.error && (
        <p className="text-xs text-[hsl(var(--color-muted-foreground))]">{props.hint}</p>
      )}
    </div>
  );
});

PasswordInput.displayName = "PasswordInput";

export { Input };
export default Input;
