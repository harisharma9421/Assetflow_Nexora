"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, AlertCircle, ArrowRight, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

import {
  resetPasswordSchema,
  type ResetPasswordSchema,
} from "@/features/auth/auth.schemas";
import { authApi } from "@/features/auth/auth.api";
import { PasswordInput } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";
import type { AxiosError } from "axios";

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [done, setDone] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  // No token = invalid link
  if (!token) {
    return (
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(var(--color-destructive)/0.1)]">
          <AlertCircle className="h-7 w-7 text-[hsl(var(--color-destructive))]" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-[hsl(var(--color-foreground))]">
            Invalid reset link
          </h3>
          <p className="mt-1 text-sm text-[hsl(var(--color-muted-foreground))]">
            This password reset link is invalid or has expired.
          </p>
        </div>
        <Link
          href={ROUTES.FORGOT_PASSWORD}
          className="text-sm font-medium text-[hsl(var(--color-primary))] hover:underline"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-5 py-4 text-center"
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
          <CheckCircle2 className="h-7 w-7 text-green-500" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-[hsl(var(--color-foreground))]">
            Password updated
          </h3>
          <p className="mt-1 text-sm text-[hsl(var(--color-muted-foreground))]">
            Your password has been successfully reset. You can now sign in with
            your new password.
          </p>
        </div>
        <Button
          onClick={() => router.push(ROUTES.LOGIN)}
          rightIcon={<ArrowRight className="h-4 w-4" />}
          className="w-full"
        >
          Go to Sign In
        </Button>
      </motion.div>
    );
  }

  const onSubmit = async (values: ResetPasswordSchema) => {
    try {
      await authApi.resetPassword({ token, newPassword: values.newPassword });
      setDone(true);
      toast.success("Password reset successfully!");
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      const message =
        error.response?.data?.message ??
        (error.response?.status === 400
          ? "This reset link has expired. Please request a new one."
          : "Could not reset password. Please try again.");
      setError("root", { message });
    }
  };

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
        {errors.root && (
          <div className="flex items-start gap-2.5 rounded-md border border-[hsl(var(--color-destructive)/0.3)] bg-[hsl(var(--color-destructive)/0.05)] px-3 py-2.5">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--color-destructive))]" />
            <p className="text-sm text-[hsl(var(--color-destructive))]">
              {errors.root.message}
            </p>
          </div>
        )}

        <PasswordInput
          id="reset-new-password"
          label="New password"
          required
          autoComplete="new-password"
          placeholder="Enter a strong password"
          error={errors.newPassword?.message}
          {...register("newPassword")}
        />

        <PasswordInput
          id="reset-confirm-password"
          label="Confirm new password"
          required
          autoComplete="new-password"
          placeholder="Re-enter your new password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <Button
          type="submit"
          size="lg"
          isLoading={isSubmitting}
          leftIcon={!isSubmitting ? <ShieldCheck className="h-4 w-4" /> : undefined}
          className="w-full"
        >
          Reset password
        </Button>
      </form>
    </motion.div>
  );
}
