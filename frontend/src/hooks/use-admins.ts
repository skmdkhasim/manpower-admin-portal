import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export interface SuperAdminRole {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
}

export interface SuperAdmin {
  id: string;
  fullName: string;
  email: string;
  role: SuperAdminRole;
  isActive: boolean;
  lastLoginAt?: string | null;
  createdAt: string;
}

export function useSuperAdmins() {
  return useQuery({
    queryKey: ["super-admins"],
    queryFn: () => api.get<SuperAdmin[]>("/super-admins"),
  });
}
