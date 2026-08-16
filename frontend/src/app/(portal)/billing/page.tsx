"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/status-pill";
import { Table, Thead, Tbody, Tr, Th, Td, EmptyState } from "@/components/ui/table";
import { useInvoices, useMarkInvoicePaid, useSubscriptionPlans } from "@/hooks/use-billing";
import { INVOICE_STATUS } from "@/lib/status-config";
import { formatCurrency, formatDate } from "@/lib/format";
import { ApiError } from "@/lib/api-client";

export default function BillingPage() {
  const [page, setPage] = useState(1);
  const { data: invoices, isLoading } = useInvoices({ page, pageSize: 20 });
  const { data: plans } = useSubscriptionPlans();
  const markPaid = useMarkInvoicePaid();

  const handleMarkPaid = async (id: string) => {
    try {
      await markPaid.mutateAsync(id);
      toast.success("Invoice marked as paid.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't update the invoice.");
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="SUPER ADMIN CONSOLE"
        title="Billing" description="Invoices and subscription plans across every tenant." />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {plans?.map((plan) => (
          <Card key={plan.id}>
            <CardBody>
              <p className="text-xs font-medium uppercase tracking-wide text-graphite-400">{plan.name}</p>
              <p className="mt-1 font-mono text-xl font-semibold text-graphite-900">
                {formatCurrency(plan.price, plan.currency)}
                <span className="text-xs font-normal text-graphite-400">
                  /{plan.billingCycle.toLowerCase()}
                </span>
              </p>
              <p className="mt-1 text-xs text-graphite-600">
                Up to {plan.maxUsers} users &middot; {plan.maxBranches} branches
              </p>
            </CardBody>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
        </CardHeader>

        {invoices?.items.length ? (
          <>
            <Table>
              <Thead>
                <Tr>
                  <Th>Invoice</Th>
                  <Th>Tenant</Th>
                  <Th>Amount</Th>
                  <Th>Status</Th>
                  <Th>Issued</Th>
                  <Th>Due</Th>
                  <Th />
                </Tr>
              </Thead>
              <Tbody>
                {invoices.items.map((invoice) => {
                  const statusInfo = INVOICE_STATUS[invoice.status];
                  return (
                    <Tr key={invoice.id}>
                      <Td className="font-mono text-xs text-graphite-900">{invoice.invoiceNumber}</Td>
                      <Td>
                        {invoice.tenant ? (
                          <Link
                            href={`/tenants/${invoice.tenantId}`}
                            className="font-medium text-graphite-900 hover:text-ink-800 hover:underline"
                          >
                            {invoice.tenant.name}
                          </Link>
                        ) : (
                          "—"
                        )}
                      </Td>
                      <Td className="font-mono text-graphite-900">
                        {formatCurrency(invoice.amount, invoice.currency)}
                      </Td>
                      <Td>
                        <StatusPill label={statusInfo.label} tone={statusInfo.tone} />
                      </Td>
                      <Td className="text-graphite-600">{formatDate(invoice.issueDate)}</Td>
                      <Td className="text-graphite-600">{formatDate(invoice.dueDate)}</Td>
                      <Td>
                        {invoice.status !== "PAID" && (
                          <Button
                            size="sm"
                            variant="secondary"
                            disabled={markPaid.isPending}
                            onClick={() => handleMarkPaid(invoice.id)}
                          >
                            Mark paid
                          </Button>
                        )}
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>

            <div className="flex items-center justify-between border-t border-mist-200 px-5 py-3 text-sm text-graphite-600">
              <span>
                Page {invoices.page} of {invoices.totalPages} &middot; {invoices.total} invoices
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
                  disabled={page >= invoices.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        ) : (
          !isLoading && (
            <EmptyState title="No invoices yet" description="Invoices will appear as tenants are billed." />
          )
        )}
      </Card>
    </div>
  );
}
