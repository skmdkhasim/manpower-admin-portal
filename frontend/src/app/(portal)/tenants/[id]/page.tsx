import { TenantDetailClient } from "./tenant-detail-client";

export default async function TenantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TenantDetailClient tenantId={id} />;
}
