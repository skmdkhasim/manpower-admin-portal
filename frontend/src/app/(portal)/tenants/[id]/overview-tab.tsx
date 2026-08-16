import { Card } from "@/components/ui/card";
import type { Tenant } from "@/lib/types";

function MetricCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Card className="px-5 py-4">
      <p className="text-xs font-medium uppercase tracking-wide text-graphite-400">{label}</p>
      <div className="mt-2">{children}</div>
    </Card>
  );
}

export function OverviewTab({ tenant }: { tenant: Tenant }) {
  const activeSub = tenant.subscriptions?.find(
    (s) => s.status === "ACTIVE" || s.status === "TRIALING",
  );
  const branchCount = tenant.branches?.length ?? 0;
  const userCount = tenant.users?.length ?? 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <MetricCard label="Admin contact">
        <p className="font-display text-lg text-ink-950">
          {tenant.contactName ? `${tenant.contactName} – ` : ""}
          {tenant.contactEmail}
        </p>
      </MetricCard>

      <MetricCard label="Plan">
        <p className="font-display text-lg text-ink-950">{activeSub?.plan.name ?? "No plan yet"}</p>
      </MetricCard>

      <MetricCard label="Client companies">
        <p className="font-display text-lg text-ink-950">
          {tenant.clientCompanyCount ?? "—"}
        </p>
      </MetricCard>

      <MetricCard label="Branches / employees">
        <p className="font-display text-lg text-ink-950">
          {branchCount} / {userCount}
        </p>
      </MetricCard>

      {(tenant.industry || tenant.country || tenant.notes) && (
        <Card className="col-span-full px-5 py-4">
          <p className="text-xs font-medium uppercase tracking-wide text-graphite-400">
            Additional details
          </p>
          <dl className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {tenant.industry && (
              <div>
                <dt className="text-xs text-graphite-400">Industry</dt>
                <dd className="text-sm text-graphite-900">{tenant.industry}</dd>
              </div>
            )}
            {tenant.country && (
              <div>
                <dt className="text-xs text-graphite-400">Country</dt>
                <dd className="text-sm text-graphite-900">{tenant.country}</dd>
              </div>
            )}
            {tenant.notes && (
              <div className="sm:col-span-3">
                <dt className="text-xs text-graphite-400">Notes</dt>
                <dd className="text-sm text-graphite-900">{tenant.notes}</dd>
              </div>
            )}
          </dl>
        </Card>
      )}
    </div>
  );
}
