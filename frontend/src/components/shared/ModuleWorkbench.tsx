"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { DataTable, StatCard, StatusBadge } from "@/components/shared";

export interface ModuleRecord {
  id: string | number;
  [key: string]: unknown;
}

export interface ModuleColumn {
  key: string;
  header: string;
  kind?: "text" | "status" | "date" | "boolean";
}

export interface ModuleAction {
  label: string;
  onClick?: () => void;
}

interface ModuleWorkbenchProps {
  title: string;
  description: string;
  endpoint: string;
  columns: ModuleColumn[];
  stats?: Array<{
    title: string;
    value: string | number;
    description?: string;
    icon?: React.ReactNode;
  }>;
  actions?: ModuleAction[];
  emptyTitle?: string;
  emptyDescription?: string;
}

function formatCell(value: unknown, kind: ModuleColumn["kind"]) {
  if (value === null || value === undefined || value === "") return "-";
  if (kind === "boolean") return value ? "Yes" : "No";
  if (kind === "date") {
    const date = new Date(String(value));
    return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString();
  }
  return String(value);
}

function normalizeRecords(payload: unknown): ModuleRecord[] {
  const rows = Array.isArray(payload)
    ? payload
    : Array.isArray((payload as { content?: unknown[] })?.content)
      ? (payload as { content: unknown[] }).content
      : [];

  return rows.map((row, index) => {
    const record = row as Record<string, unknown>;
    return {
      ...record,
      id: (record.id as string | number | undefined) ?? index + 1,
    };
  });
}

export function ModuleWorkbench({
  title,
  description,
  endpoint,
  columns,
  stats = [],
  actions = [],
  emptyTitle = "No records found",
  emptyDescription = "No records are available for this module yet.",
}: ModuleWorkbenchProps) {
  const [records, setRecords] = useState<ModuleRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadRecords() {
      try {
        setIsLoading(true);
        const response = await api.get(endpoint);
        if (!isMounted) return;
        setRecords(normalizeRecords(response.data));
        setError(null);
      } catch {
        if (!isMounted) return;
        setRecords([]);
        setError("Unable to reach the backend API for this module.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadRecords();
    return () => {
      isMounted = false;
    };
  }, [endpoint]);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              {description}
            </p>
            {error && (
              <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-300">
                {error}
              </p>
            )}
          </div>
          {actions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {actions.map((action) => (
                <Button key={action.label} variant="outline" onClick={action.onClick}>
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </section>

      {stats.length > 0 && (
        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <StatCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              description={stat.description}
              icon={stat.icon}
            />
          ))}
        </section>
      )}

      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <DataTable
          columns={columns.map((column) => ({
            key: column.key,
            header: column.header,
            render: (row: ModuleRecord) =>
              column.kind === "status" ? (
                <StatusBadge status={formatCell(row[column.key], column.kind)} />
              ) : (
                <span>{formatCell(row[column.key], column.kind)}</span>
              ),
          }))}
          data={records}
          isLoading={isLoading}
          emptyTitle={emptyTitle}
          emptyDescription={emptyDescription}
        />
      </section>
    </div>
  );
}

export default ModuleWorkbench;
