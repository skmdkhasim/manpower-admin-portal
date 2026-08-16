import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { Invoice, Paginated, SubscriptionPlan } from "@/lib/types";

export function useSubscriptionPlans() {
  return useQuery({
    queryKey: ["subscription-plans"],
    queryFn: () => api.get<SubscriptionPlan[]>("/subscription-plans"),
  });
}

export function useInvoices(params: { page?: number; pageSize?: number; tenantId?: string }) {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.pageSize) query.set("pageSize", String(params.pageSize));
  if (params.tenantId) query.set("tenantId", params.tenantId);

  return useQuery({
    queryKey: ["invoices", params],
    queryFn: () => api.get<Paginated<Invoice>>(`/invoices?${query.toString()}`),
  });
}

export function useMarkInvoicePaid() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch<Invoice>(`/invoices/${id}/mark-paid`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
    },
  });
}
