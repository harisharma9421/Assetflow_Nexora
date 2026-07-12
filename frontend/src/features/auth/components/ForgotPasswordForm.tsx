"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Mail, ArrowLeft, AlertCircle, Send } from "lucide-react";
import { motion } from "framer-motion";

import {
  forgotPasswordSchema,
  type ForgotPasswordSchema,
} from "@/features/auth/auth.schemas";
import { authApi } from "@/features/auth/auth.api";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";
import type { AxiosError } from "axios";

export default function ForgotPasswordForm() {
  const [emailSent, setEmailSent] = React.useState(false);
  const [sentTo, setSentTo] = React.useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    getValues,
  } = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: ForgotPasswordSchema) => {
    try {
      await authApi.forgotPassword(values);
      setSentTo(values.email);
      setEmailSent(true);
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      // Don't reveal if email exists (security best practice)
      // Always show success-like message unless it's a server error
      if (error.response?.status && error.response.status >= 500) {
        setError("root", {
          message: "Service temporarily unavailable. Please try again later.",
        });
      } else {
        // For 404 or other client errors, still show "success" to prevent email enumeration
        setSentTo(getValues("email"));
        setEmailSent(true);
      }
    }
  };

  if (emailSent) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center gap-5 py-4 text-center"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
          <Send className="h-7 w-7 text-blue-500" />
        </div>
        <div className="flex flex-col gap-1.5">
          <h3 className="text-lg font-semibold text-[hsl(var(--color-foreground))]">
            Check your inbox
          </h3>
          <p className="text-sm text-[hsl(var(--color-muted-foreground))]">
            If an account exists for{" "}
            <span className="font-medium text-[hsl(var(--color-foreground))]">
              {sentTo}
            </span>
            , you will receive a password reset link shortly.
          </p>
          <p className="mt-1 text-xs text-[hsl(var(--color-muted-foreground))]">
            The link will expire in 15 minutes. Check your spam folder if you
            don&apos;t see it.
          </p>
        </div>

        <div className="flex w-full flex-col gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setEmailSent(false);
              setSentTo("");
            }}
            className="w-full"
          >
            Try a different email
          </Button>
          <Link
            href={ROUTES.LOGIN}
            className="flex items-center justify-center gap-2 text-sm font-medium text-[hsl(var(--color-primary))] hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to sign in
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-5"
        noValidate
      >
        {/* Root error */}
        {errors.root && (
          <div className="flex items-start gap-2.5 rounded-md border border-[hsl(var(--color-destructive)/0.3)] bg-[hsl(var(--color-destructive)/0.05)] px-3 py-2.5">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--color-destructive))]" />
            <p className="text-sm text-[hsl(var(--color-destructive))]">
              {errors.root.message}
            </p>
          </div>
        )}

        <p className="text-sm text-[hsl(var(--color-muted-foreground))]">
          Enter your work email address and we&apos;ll send you a link to reset your
          password.
        </p>

        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="forgot-email"
            className="text-sm font-medium text-[hsl(var(--color-foreground))]"
          >
            Email address <span className="text-[hsl(var(--color-destructive))]">*</span>
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--color-muted-foreground))]" />
            <input
              id="forgot-email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              {...register("email")}
              className={`h-10 w-full rounded-md border bg-white pl-10 pr-3 text-sm placeholder:text-[hsl(var(--color-muted-foreground))] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                errors.email
                  ? "border-[hsl(var(--color-destructive))] focus:ring-[hsl(var(--color-destructive))]"
                  : "border-[hsl(var(--color-border))] hover:border-slate-300 focus:ring-[hsl(var(--color-ring))]"
              }`}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-[hsl(var(--color-destructive))]">
              {errors.email.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          size="lg"
          isLoading={isSubmitting}
          className="w-full"
        >
          Send reset link
        </Button>

        <Link
          href={ROUTES.LOGIN}
          className="flex items-center justify-center gap-2 text-sm font-medium text-[hsl(var(--color-muted-foreground))] hover:text-[hsl(var(--color-foreground))] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to sign in
        </Link>
      </form>
    </motion.div>
  );
}
