import { EditTenantClient } from "./edit-tenant-client";

export default async function EditTenantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EditTenantClient tenantId={id} />;
}
