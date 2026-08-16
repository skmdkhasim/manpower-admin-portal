"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/status-pill";
import { Table, Thead, Tbody, Tr, Th, Td, EmptyState } from "@/components/ui/table";
import { useSuperAdmins } from "@/hooks/use-admins";
import { formatDateTime } from "@/lib/format";

export default function SettingsPage() {
  const { data: admins, isLoading } = useSuperAdmins();

  return (
    <div>
      <PageHeader
        eyebrow="SUPER ADMIN CONSOLE"
        title="Settings"
        description="Everyone with access to this Super Admin Portal and what they can do."
      />

      <Card>
        <div className="border-b border-mist-200 px-5 py-3">
          <h2 className="font-display text-base font-medium text-graphite-900">Admins</h2>
        </div>
        {admins?.length ? (
          <Table>
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th>Email</Th>
                <Th>Role</Th>
                <Th>Status</Th>
                <Th>Last login</Th>
              </Tr>
            </Thead>
            <Tbody>
              {admins.map((admin) => (
                <Tr key={admin.id}>
                  <Td className="font-medium text-graphite-900">{admin.fullName}</Td>
                  <Td className="text-graphite-600">{admin.email}</Td>
                  <Td className="text-graphite-600">{admin.role.name.replace("_", " ")}</Td>
                  <Td>
                    <StatusPill
                      label={admin.isActive ? "Active" : "Disabled"}
                      tone={admin.isActive ? "emerald" : "graphite"}
                    />
                  </Td>
                  <Td className="text-graphite-600">
                    {admin.lastLoginAt ? formatDateTime(admin.lastLoginAt) : "Never"}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        ) : (
          !isLoading && <EmptyState title="No admins found" />
        )}
      </Card>
    </div>
  );
}
