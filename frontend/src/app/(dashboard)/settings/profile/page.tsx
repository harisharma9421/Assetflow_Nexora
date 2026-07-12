"use client";

import { Mail, ShieldCheck, User } from "lucide-react";
import { StatCard } from "@/components/shared";
import { useAuth } from "@/hooks/useAuth";
import { USER_ROLE_LABELS } from "@/lib/constants";

export default function ProfilePage() {
  const { user, currentRole } = useAuth();

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
          Account Profile
        </span>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground">
          {user?.fullName || "Active User"}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Review your signed-in identity, role, department ownership, and account status.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <StatCard
          title="Email"
          value={user?.email || "Not available"}
          description="Used for authentication"
          icon={<Mail className="h-5 w-5" />}
        />
        <StatCard
          title="Role"
          value={currentRole ? USER_ROLE_LABELS[currentRole] : "Employee"}
          description="Controls dashboard and route access"
          icon={<ShieldCheck className="h-5 w-5" />}
        />
        <StatCard
          title="Status"
          value={user?.status || "Active"}
          description="Account availability"
          icon={<User className="h-5 w-5" />}
        />
      </section>
    </div>
  );
}
