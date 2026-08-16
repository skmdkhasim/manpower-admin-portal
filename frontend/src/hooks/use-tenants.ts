import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type {
  Paginated,
  Tenant,
  TenantBranch,
  TenantUser,
  TenantPlanHistory,
  TenantSubscription,
} from "@/lib/types";

export function useTenants(params: {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
}) {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.pageSize) query.set("pageSize", String(params.pageSize));
  if (params.search) query.set("search", params.search);
  if (params.status) query.set("status", params.status);

  return useQuery({
    queryKey: ["tenants", params],
    queryFn: () => api.get<Paginated<Tenant>>(`/tenants?${query.toString()}`),
  });
}

export function useTenant(id: string) {
  return useQuery({
    queryKey: ["tenant", id],
    queryFn: () => api.get<Tenant>(`/tenants/${id}`),
    enabled: !!id,
  });
}

export function useCreateTenant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      name: string;
      contactEmail: string;
      contactName?: string;
      contactPhone?: string;
      industry?: string;
      country?: string;
      notes?: string;
      clientCompanyCount?: number;
    }) => api.post<Tenant>("/tenants", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
    },
  });
}

export function useUpdateTenant(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<Tenant>) => api.patch<Tenant>(`/tenants/${id}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant", id] });
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
    },
  });
}

export function useUpdateOnboardingStep(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (step: string) =>
      api.patch<Tenant>(`/tenants/${id}/onboarding-step`, { step }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant", id] });
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
    },
  });
}

export function useTenantLifecycle(id: string) {
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["tenant", id] });
    queryClient.invalidateQueries({ queryKey: ["tenants"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
  };
  const suspend = useMutation({
    mutationFn: () => api.post<Tenant>(`/tenants/${id}/suspend`),
    onSuccess: invalidate,
  });
  const reactivate = useMutation({
    mutationFn: () => api.post<Tenant>(`/tenants/${id}/reactivate`),
    onSuccess: invalidate,
  });
  return { suspend, reactivate };
}

export function useTenantBranches(tenantId: string) {
  return useQuery({
    queryKey: ["tenant-branches", tenantId],
    queryFn: () => api.get<TenantBranch[]>(`/tenants/${tenantId}/branches`),
    enabled: !!tenantId,
  });
}

export function useCreateBranch(tenantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<TenantBranch>) =>
      api.post<TenantBranch>(`/tenants/${tenantId}/branches`, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tenant-branches", tenantId] }),
  });
}

export function useTenantUsers(tenantId: string) {
  return useQuery({
    queryKey: ["tenant-users", tenantId],
    queryFn: () => api.get<TenantUser[]>(`/tenants/${tenantId}/users`),
    enabled: !!tenantId,
  });
}

export function useCreateTenantUser(tenantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<TenantUser>) =>
      api.post<TenantUser>(`/tenants/${tenantId}/users`, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tenant-users", tenantId] }),
  });
}

export function useTenantSubscription(tenantId: string) {
  return useQuery({
    queryKey: ["tenant-subscription", tenantId],
    queryFn: () => api.get<TenantSubscription | null>(`/tenants/${tenantId}/subscription`),
    enabled: !!tenantId,
  });
}

export function useTenantPlanHistory(tenantId: string) {
  return useQuery({
    queryKey: ["tenant-plan-history", tenantId],
    queryFn: () => api.get<TenantPlanHistory[]>(`/tenants/${tenantId}/plan-history`),
    enabled: !!tenantId,
  });
}

export function useChangePlan(tenantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { planId: string; note?: string }) =>
      api.post<TenantSubscription>(`/tenants/${tenantId}/subscription/change-plan`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant-subscription", tenantId] });
      queryClient.invalidateQueries({ queryKey: ["tenant-plan-history", tenantId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
    },
  });
}
