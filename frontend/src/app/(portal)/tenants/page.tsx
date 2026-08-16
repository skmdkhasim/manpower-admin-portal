"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, Thead, Tbody, Tr, Th, Td, EmptyState } from "@/components/ui/table";
import { StatusPill } from "@/components/ui/status-pill";
import { useTenants } from "@/hooks/use-tenants";
import { TENANT_STATUS } from "@/lib/status-config";
import { initials } from "@/lib/format";
import type { TenantStatus } from "@/lib/types";

const STATUS_FILTERS: { value: TenantStatus | ""; label: string }[] = [
  { value: "", label: "All statuses" },
  { value: "ONBOARDING", label: "Onboarding" },
  { value: "ACTIVE", label: "Active" },
  { value: "SUSPENDED", label: "Suspended" },
  { value: "CHURNED", label: "Churned" },
];

export default function TenantsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<TenantStatus | "">("");
  const [page, setPage] = useState(1);
  const { data, isLoading } = useTenants({ page, pageSize: 20, search, status: status || undefined });

  return (
    <div>
      <PageHeader
        eyebrow="SUPER ADMIN CONSOLE"
        title="Tenants"
        actions={
          <Link
            href="/tenants/new"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-[9px] bg-blue-500 px-4 text-sm font-medium text-white shadow-[0_8px_20px_-8px_rgba(47,111,237,0.6)] transition-colors hover:bg-blue-600 focus-visible:outline-2 focus-visible:outline-blue-500"
          >
            <Plus className="h-4 w-4" />
            New tenant
          </Link>
        }
      />

      <div className="mb-4 flex items-center gap-3">
        <div className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-graphite-400" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search tenants by name or subdomain"
            className="h-10 w-full rounded-[9px] border border-mist-200 bg-white pl-9 pr-3 text-sm placeholder:text-graphite-400 focus:border-blue-500 focus:outline-none focus-visible:outline-2 focus-visible:outline-blue-500"
          />
        </div>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as TenantStatus | "");
            setPage(1);
          }}
          className="h-10 rounded-[9px] border border-mist-200 bg-white px-3 text-sm text-graphite-700 focus:border-blue-500 focus:outline-none focus-visible:outline-2 focus-visible:outline-blue-500"
        >
          {STATUS_FILTERS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      <Card>
        {data?.items.length ? (
          <>
            <Table>
              <Thead>
                <Tr>
                  <Th>Tenant</Th>
                  <Th>Subdomain</Th>
                  <Th>Plan</Th>
                  <Th>Status</Th>
                  <Th>Branches</Th>
                  <Th>Users</Th>
                  <Th />
                </Tr>
              </Thead>
              <Tbody>
                {data.items.map((tenant) => {
                  const statusInfo = TENANT_STATUS[tenant.status];
                  const activeSub = tenant.subscriptions?.find(
                    (s) => s.status === "ACTIVE" || s.status === "TRIALING",
                  );
                  return (
                    <Tr key={tenant.id}>
                      <Td>
                        <Link href={`/tenants/${tenant.id}`} className="flex items-center gap-3">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500 text-xs font-semibold text-white">
                            {initials(tenant.name)}
                          </span>
                          <span className="font-medium text-graphite-900 hover:text-blue-500 hover:underline">
                            {tenant.name}
                          </span>
                        </Link>
                      </Td>
                      <Td className="font-mono text-xs text-graphite-600">
                        {tenant.slug}.manpowererp.com
                      </Td>
                      <Td className="text-graphite-600">{activeSub?.plan.name ?? "—"}</Td>
                      <Td>
                        <StatusPill label={statusInfo.label} tone={statusInfo.tone} />
                      </Td>
                      <Td className="text-graphite-600">{tenant.branches?.length ?? 0}</Td>
                      <Td className="text-graphite-600">{tenant.users?.length ?? 0}</Td>
                      <Td>
                        <Link
                          href={`/tenants/${tenant.id}`}
                          className="text-sm font-medium text-blue-500 hover:underline"
                        >
                          Manage →
                        </Link>
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>

            <div className="flex items-center justify-between border-t border-mist-200 px-5 py-3 text-sm text-graphite-600">
              <span>
                Page {data.page} of {data.totalPages} &middot; {data.total} tenants
              </span>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page >= data.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        ) : (
          !isLoading && (
            <EmptyState
              title={search || status ? "No tenants match your filters" : "No tenants yet"}
              description={
                search || status
                  ? "Try a different name, subdomain, or status."
                  : "Add your first client company to get started."
              }
              action={
                !search && !status && (
                  <Link href="/tenants/new">
                    <Button size="sm">Add tenant</Button>
                  </Link>
                )
              }
            />
          )
        )}
      </Card>
    </div>
  );
}
