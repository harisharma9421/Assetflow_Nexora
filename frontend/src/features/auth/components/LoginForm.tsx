"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, ArrowRight, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

import { loginSchema, type LoginSchema } from "@/features/auth/auth.schemas";
import { authApi } from "@/features/auth/auth.api";
import { useAuthStore } from "@/store/auth.store";
import { PasswordInput } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";
import type { AxiosError } from "axios";

export default function LoginForm() {
  const router = useRouter();
  const setAuthFromResponse = useAuthStore((s) => s.setAuthFromResponse);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: LoginSchema) => {
    try {
      const response = await authApi.login(values);
      setAuthFromResponse(response);
      toast.success(`Welcome back, ${response.user.fullName}!`);
      router.push(ROUTES.DASHBOARD);
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      const message =
        error.response?.data?.message ??
        (error.response?.status === 401
          ? "Invalid email or password. Please try again."
          : "Unable to sign in. Please check your connection.");
      setError("root", { message });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-5"
        noValidate
      >
        {/* Root Error */}
        {errors.root && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="flex items-start gap-2.5 rounded-md border border-[hsl(var(--color-destructive)/0.3)] bg-[hsl(var(--color-destructive)/0.05)] px-3 py-2.5"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--color-destructive))]" />
            <p className="text-sm text-[hsl(var(--color-destructive))]">
              {errors.root.message}
            </p>
          </motion.div>
        )}

        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="login-email"
            className="text-sm font-medium text-[hsl(var(--color-foreground))]"
          >
            Email address <span className="text-[hsl(var(--color-destructive))]">*</span>
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--color-muted-foreground))]" />
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              {...register("email")}
              className={`h-10 w-full rounded-md border bg-white pl-10 pr-3 text-sm text-[hsl(var(--color-foreground))] placeholder:text-[hsl(var(--color-muted-foreground))] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 ${
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

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="login-password"
            className="text-sm font-medium text-[hsl(var(--color-foreground))]"
          >
            Password <span className="text-[hsl(var(--color-destructive))]">*</span>
          </label>
          <PasswordInput
            id="login-password"
            autoComplete="current-password"
            placeholder="Enter your password"
            error={errors.password?.message}
            {...register("password")}
          />
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between mt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              className="h-4.5 w-4.5 rounded-[6px] border-[hsl(var(--color-border))] text-[hsl(var(--color-primary))] focus:ring-[hsl(var(--color-primary))] focus:ring-offset-0 transition-colors"
            />
            <span className="text-xs font-medium text-[hsl(var(--color-muted-foreground))]">
              Remember this device
            </span>
          </label>
          <Link
            href={ROUTES.FORGOT_PASSWORD}
            className="text-xs font-bold text-[hsl(var(--color-primary))] hover:underline"
          >
            Forgot Password?
          </Link>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          size="lg"
          isLoading={isSubmitting}
          rightIcon={!isSubmitting ? <ArrowRight className="h-4 w-4" /> : undefined}
          className="mt-1 w-full"
        >
          Sign in to Nexora
        </Button>

        {/* Sign up link */}
        <p className="text-center text-sm text-[hsl(var(--color-muted-foreground))]">
          Don&apos;t have an account?{" "}
          <Link
            href={ROUTES.REGISTER}
            className="font-medium text-[hsl(var(--color-primary))] hover:underline"
          >
            Create account
          </Link>
        </p>
      </form>
    </motion.div>
  );
}

