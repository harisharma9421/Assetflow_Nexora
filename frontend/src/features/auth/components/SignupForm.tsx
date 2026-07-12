"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Mail, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

import { signupSchema, type SignupSchema } from "@/features/auth/auth.schemas";
import { authApi } from "@/features/auth/auth.api";
import { PasswordInput } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";
import type { AxiosError } from "axios";

/**
 * Password strength indicator
 */
function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "8+ characters", pass: password.length >= 8 },
    { label: "Uppercase letter", pass: /[A-Z]/.test(password) },
    { label: "Lowercase letter", pass: /[a-z]/.test(password) },
    { label: "Number", pass: /[0-9]/.test(password) },
    { label: "Special character", pass: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) },
  ];
  const score = checks.filter((c) => c.pass).length;
  const strengthColors = ["bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-blue-400", "bg-green-500"];
  const strengthLabels = ["Very weak", "Weak", "Fair", "Good", "Strong"];

  if (!password) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      className="flex flex-col gap-2 rounded-md border border-[hsl(var(--color-border))] bg-[hsl(var(--color-muted)/0.5)] p-3"
    >
      {/* Strength bar */}
      <div className="flex gap-1">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
              i < score ? strengthColors[score - 1] : "bg-[hsl(var(--color-border))]"
            }`}
          />
        ))}
      </div>
      <p className="text-xs font-medium text-[hsl(var(--color-muted-foreground))]">
        {strengthLabels[Math.max(0, score - 1)]}
      </p>
      <div className="grid grid-cols-2 gap-1">
        {checks.map((check) => (
          <div key={check.label} className="flex items-center gap-1.5">
            <CheckCircle2
              className={`h-3 w-3 shrink-0 transition-colors ${
                check.pass ? "text-green-500" : "text-[hsl(var(--color-border))]"
              }`}
            />
            <span
              className={`text-xs transition-colors ${
                check.pass
                  ? "text-[hsl(var(--color-foreground))]"
                  : "text-[hsl(var(--color-muted-foreground))]"
              }`}
            >
              {check.label}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default function SignupForm() {
  const router = useRouter();
  const [done, setDone] = React.useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<SignupSchema>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const passwordValue = watch("password");

  const onSubmit = async (values: SignupSchema) => {
    try {
      await authApi.signup({
        fullName: values.fullName,
        email: values.email,
        password: values.password,
        departmentId: values.departmentId ? Number(values.departmentId) : null,
      });
      setDone(true);
      toast.success("Account created! Please sign in.");
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      const message =
        error.response?.data?.message ??
        (error.response?.status === 409
          ? "An account with this email already exists."
          : "Could not create account. Please try again.");
      setError("root", { message });
    }
  };

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4 py-6 text-center"
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
          <CheckCircle2 className="h-7 w-7 text-green-500" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-[hsl(var(--color-foreground))]">
            Account created!
          </h2>
          <p className="mt-1 text-sm text-[hsl(var(--color-muted-foreground))]">
            Your employee account has been created. Please sign in.
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        {/* Root error */}
        {errors.root && (
          <div className="flex items-start gap-2.5 rounded-md border border-[hsl(var(--color-destructive)/0.3)] bg-[hsl(var(--color-destructive)/0.05)] px-3 py-2.5">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--color-destructive))]" />
            <p className="text-sm text-[hsl(var(--color-destructive))]">
              {errors.root.message}
            </p>
          </div>
        )}

        {/* Full Name */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="signup-name" className="text-sm font-medium text-[hsl(var(--color-foreground))]">
            Full name <span className="text-[hsl(var(--color-destructive))]">*</span>
          </label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--color-muted-foreground))]" />
            <input
              id="signup-name"
              type="text"
              autoComplete="name"
              placeholder="John Smith"
              {...register("fullName")}
              className={`h-10 w-full rounded-md border bg-white pl-10 pr-3 text-sm placeholder:text-[hsl(var(--color-muted-foreground))] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                errors.fullName
                  ? "border-[hsl(var(--color-destructive))] focus:ring-[hsl(var(--color-destructive))]"
                  : "border-[hsl(var(--color-border))] hover:border-slate-300 focus:ring-[hsl(var(--color-ring))]"
              }`}
            />
          </div>
          {errors.fullName && (
            <p className="text-xs text-[hsl(var(--color-destructive))]">{errors.fullName.message}</p>
          )}
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="signup-email" className="text-sm font-medium text-[hsl(var(--color-foreground))]">
            Work email <span className="text-[hsl(var(--color-destructive))]">*</span>
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--color-muted-foreground))]" />
            <input
              id="signup-email"
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
            <p className="text-xs text-[hsl(var(--color-destructive))]">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <PasswordInput
            id="signup-password"
            label="Password"
            required
            autoComplete="new-password"
            placeholder="Create a strong password"
            error={errors.password?.message}
            {...register("password")}
          />
          <PasswordStrength password={passwordValue ?? ""} />
        </div>

        {/* Confirm Password */}
        <PasswordInput
          id="signup-confirm-password"
          label="Confirm password"
          required
          autoComplete="new-password"
          placeholder="Re-enter your password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        {/* Role notice */}
        <div className="rounded-md bg-[hsl(var(--color-muted)/0.6)] px-3 py-2.5 text-xs text-[hsl(var(--color-muted-foreground))]">
          <span className="font-medium text-[hsl(var(--color-foreground))]">Note:</span>{" "}
          New accounts are created as <span className="font-medium">Employee</span>. Your
          administrator can update your role after you sign in.
        </div>

        {/* Submit */}
        <Button
          type="submit"
          size="lg"
          isLoading={isSubmitting}
          rightIcon={!isSubmitting ? <ArrowRight className="h-4 w-4" /> : undefined}
          className="w-full"
        >
          Create account
        </Button>

        <p className="text-center text-sm text-[hsl(var(--color-muted-foreground))]">
          Already have an account?{" "}
          <Link href={ROUTES.LOGIN} className="font-medium text-[hsl(var(--color-primary))] hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </motion.div>
  );
}
