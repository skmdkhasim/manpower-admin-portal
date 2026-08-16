"use client";

import Link from "next/link";
import { Building2, DollarSign, AlertCircle, UserCheck } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/status-pill";
import { Table, Thead, Tbody, Tr, Th, Td, EmptyState } from "@/components/ui/table";
import { useDashboardSummary } from "@/hooks/use-dashboard";
import { TENANT_STATUS } from "@/lib/status-config";
import { formatCurrency, formatDate } from "@/lib/format";

function StatTile({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <Card>
      <CardBody className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-graphite-400">{label}</p>
          <p className="mt-1.5 font-mono text-2xl font-semibold tabular-nums text-graphite-900">
            {value}
          </p>
          {hint && <p className="mt-1 text-xs text-graphite-600">{hint}</p>}
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-mist-100 text-ink-800">
          <Icon className="h-4.5 w-4.5" strokeWidth={2} />
        </div>
      </CardBody>
    </Card>
  );
}

export default function DashboardPage() {
  const { data, isLoading } = useDashboardSummary();

  return (
    <div>
      <PageHeader
        eyebrow="SUPER ADMIN CONSOLE"
        title="Dashboard"
        description="A snapshot of every tenant on the platform right now."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          icon={Building2}
          label="Active tenants"
          value={isLoading ? "—" : String(data?.activeTenants ?? 0)}
          hint={`${data?.onboardingTenants ?? 0} onboarding`}
        />
        <StatTile
          icon={DollarSign}
          label="MRR"
          value={isLoading ? "—" : formatCurrency(data?.mrr ?? 0)}
          hint={`${data?.activeSubscriptions ?? 0} active subscriptions`}
        />
        <StatTile
          icon={AlertCircle}
          label="Overdue invoices"
          value={isLoading ? "—" : String(data?.overdueInvoices ?? 0)}
          hint="Needs follow-up"
        />
        <StatTile
          icon={UserCheck}
          label="Suspended tenants"
          value={isLoading ? "—" : String(data?.suspendedTenants ?? 0)}
          hint="Access currently paused"
        />
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recently added tenants</CardTitle>
          <Link href="/tenants" className="text-sm font-medium text-ink-800 hover:underline">
            View all
          </Link>
        </CardHeader>
        {data?.recentTenants?.length ? (
          <Table>
            <Thead>
              <Tr>
                <Th>Tenant</Th>
                <Th>Industry</Th>
                <Th>Status</Th>
                <Th>Added</Th>
              </Tr>
            </Thead>
            <Tbody>
              {data.recentTenants.map((tenant) => {
                const statusInfo = TENANT_STATUS[tenant.status];
                return (
                  <Tr key={tenant.id}>
                    <Td>
                      <Link
                        href={`/tenants/${tenant.id}`}
                        className="font-medium text-graphite-900 hover:text-ink-800 hover:underline"
                      >
                        {tenant.name}
                      </Link>
                    </Td>
                    <Td className="text-graphite-600">{tenant.industry || "—"}</Td>
                    <Td>
                      <StatusPill label={statusInfo.label} tone={statusInfo.tone} />
                    </Td>
                    <Td className="text-graphite-600">{formatDate(tenant.createdAt)}</Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        ) : (
          !isLoading && (
            <EmptyState
              title="No tenants yet"
              description="Add your first client company to get started."
            />
          )
        )}
      </Card>
    </div>
  );
}
