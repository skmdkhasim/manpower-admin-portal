import { Card } from "@/components/ui/card";
import { Table, Thead, Tbody, Tr, Th, Td, EmptyState } from "@/components/ui/table";
import { useTenantPlanHistory } from "@/hooks/use-tenants";
import { formatDateTime } from "@/lib/format";

const ACTION_LABELS: Record<string, string> = {
  TRIAL_START: "Trial started",
  NEW_SUBSCRIPTION: "New subscription",
  UPGRADE: "Upgraded",
  DOWNGRADE: "Downgraded",
  RENEWAL: "Renewed",
  CANCELLATION: "Cancelled",
};

export function PlanHistoryTab({ tenantId }: { tenantId: string }) {
  const { data: history, isLoading } = useTenantPlanHistory(tenantId);

  return (
    <Card>
      <div className="border-b border-mist-200 px-5 py-4">
        <p className="font-display text-base font-semibold text-graphite-900">Plan change history</p>
      </div>

      {history?.length ? (
        <Table>
          <Thead>
            <Tr>
              <Th>Date</Th>
              <Th>Action</Th>
              <Th>From</Th>
              <Th>To</Th>
              <Th>Note</Th>
            </Tr>
          </Thead>
          <Tbody>
            {history.map((entry) => (
              <Tr key={entry.id}>
                <Td className="whitespace-nowrap font-mono text-xs text-graphite-600">
                  {formatDateTime(entry.effectiveDate)}
                </Td>
                <Td className="font-medium text-graphite-900">
                  {ACTION_LABELS[entry.action] || entry.action}
                </Td>
                <Td className="text-graphite-600">{entry.fromPlan?.name || "—"}</Td>
                <Td className="text-graphite-600">{entry.toPlan.name}</Td>
                <Td className="text-graphite-600">{entry.note || "—"}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      ) : (
        !isLoading && (
          <EmptyState title="No plan changes yet" description="Subscription changes will show up here." />
        )
      )}
    </Card>
  );
}
