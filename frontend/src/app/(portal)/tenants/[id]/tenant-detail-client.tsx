"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/status-pill";
import { initials } from "@/lib/format";
import { cn } from "@/lib/cn";
import { TENANT_STATUS } from "@/lib/status-config";
import { useTenant, useTenantLifecycle } from "@/hooks/use-tenants";
import { ApiError } from "@/lib/api-client";
import { OverviewTab } from "./overview-tab";
import { OnboardingTab } from "./onboarding-tab";
import { BranchesTab } from "./branches-tab";
import { UsersTab } from "./users-tab";
import { SubscriptionTab } from "./subscription-tab";
import { PlanHistoryTab } from "./plan-history-tab";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "onboarding", label: "Onboarding" },
  { key: "branches", label: "Branches" },
  { key: "users", label: "Users" },
  { key: "subscription", label: "Subscription" },
  { key: "plan-history", label: "Plan History" },
] as const;
type TabKey = (typeof TABS)[number]["key"];

export function TenantDetailClient({ tenantId }: { tenantId: string }) {
  const [tab, setTab] = useState<TabKey>("overview");
  const { data: tenant, isLoading } = useTenant(tenantId);
  const { suspend, reactivate } = useTenantLifecycle(tenantId);

  if (isLoading || !tenant) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-ink-800 border-t-transparent" />
      </div>
    );
  }

  const statusInfo = TENANT_STATUS[tenant.status];

  const handleLifecycleAction = async () => {
    try {
      if (tenant.status === "SUSPENDED") {
        await reactivate.mutateAsync();
        toast.success(`${tenant.name} reactivated.`);
      } else {
        await suspend.mutateAsync();
        toast.success(`${tenant.name} suspended.`);
      }
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "That didn't work.");
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/tenants"
            aria-label="Back to all tenants"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[9px] border border-mist-200 text-graphite-600 transition-colors hover:border-graphite-400 hover:text-graphite-900"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[9px] bg-blue-500 text-sm font-semibold text-white">
            {initials(tenant.name)}
          </span>
          <div>
            <h1 className="font-display text-[26px] font-medium text-ink-950">{tenant.name}</h1>
            <div className="mt-1 flex items-center gap-2">
              <StatusPill label={statusInfo.label} tone={statusInfo.tone} />
              <span className="font-mono text-xs text-graphite-400">
                {tenant.slug}.manpowererp.com
              </span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Link href={`/tenants/${tenant.id}/edit`}>
            <Button variant="secondary" size="md">
              Edit
            </Button>
          </Link>
          <Button
            variant={tenant.status === "SUSPENDED" ? "primary" : "danger-outline"}
            size="md"
            onClick={handleLifecycleAction}
            disabled={suspend.isPending || reactivate.isPending}
          >
            {tenant.status === "SUSPENDED" ? (
              <>
                <RotateCcw className="h-4 w-4" /> Reactivate
              </>
            ) : (
              "Suspend"
            )}
          </Button>
        </div>
      </div>

      <div className="mb-6 flex gap-1 border-b border-mist-200">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "relative px-4 py-2.5 text-sm font-medium text-graphite-600 transition-colors hover:text-graphite-900",
              tab === t.key && "text-ink-950",
            )}
          >
            {t.label}
            {tab === t.key && (
              <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-blue-500" />
            )}
          </button>
        ))}
      </div>

      {tab === "overview" && <OverviewTab tenant={tenant} />}
      {tab === "onboarding" && <OnboardingTab tenant={tenant} />}
      {tab === "branches" && <BranchesTab tenantId={tenantId} />}
      {tab === "users" && <UsersTab tenantId={tenantId} />}
      {tab === "subscription" && <SubscriptionTab tenantId={tenantId} />}
      {tab === "plan-history" && <PlanHistoryTab tenantId={tenantId} />}
    </div>
  );
}
