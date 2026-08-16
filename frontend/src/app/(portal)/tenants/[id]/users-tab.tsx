"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input, Label, FieldError, Select } from "@/components/ui/input";
import { StatusPill } from "@/components/ui/status-pill";
import { Table, Thead, Tbody, Tr, Th, Td, EmptyState } from "@/components/ui/table";
import { useCreateTenantUser, useTenantUsers } from "@/hooks/use-tenants";
import { TENANT_USER_STATUS } from "@/lib/status-config";
import { ApiError } from "@/lib/api-client";

const ROLES = ["OWNER", "ADMIN", "HR_MANAGER", "RECRUITER", "VIEWER"] as const;

const schema = z.object({
  fullName: z.string().min(2, "Name is required"),
  email: z.string().email("Enter a valid email address"),
  role: z.enum(ROLES),
});
type FormValues = z.infer<typeof schema>;

export function UsersTab({ tenantId }: { tenantId: string }) {
  const [open, setOpen] = useState(false);
  const { data: users, isLoading } = useTenantUsers(tenantId);
  const createUser = useCreateTenantUser(tenantId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { role: "VIEWER" } });

  const onSubmit = async (values: FormValues) => {
    try {
      await createUser.mutateAsync(values);
      toast.success("Invite sent.");
      reset();
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't invite this user.");
    }
  };

  return (
    <Card>
      <div className="flex items-center justify-between border-b border-mist-200 px-5 py-4">
        <p className="font-display text-base font-semibold text-graphite-900">Tenant users</p>
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> Invite user
        </Button>
      </div>

      {users?.length ? (
        <Table>
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>Role</Th>
              <Th>Branch</Th>
              <Th>Status</Th>
            </Tr>
          </Thead>
          <Tbody>
            {users.map((user) => {
              const statusInfo = TENANT_USER_STATUS[user.status];
              return (
                <Tr key={user.id}>
                  <Td className="font-medium text-graphite-900">{user.fullName}</Td>
                  <Td className="text-graphite-600">{user.email}</Td>
                  <Td className="text-graphite-600">{user.role.replace("_", " ")}</Td>
                  <Td className="text-graphite-600">{user.branch?.name || "—"}</Td>
                  <Td>
                    <StatusPill label={statusInfo.label} tone={statusInfo.tone} />
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      ) : (
        !isLoading && (
          <EmptyState title="No users yet" description="Invite the tenant's first admin user." />
        )
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Invite tenant user">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <Label htmlFor="user-name">Full name</Label>
            <Input id="user-name" placeholder="Jane Doe" {...register("fullName")} />
            <FieldError>{errors.fullName?.message}</FieldError>
          </div>
          <div>
            <Label htmlFor="user-email">Email</Label>
            <Input id="user-email" type="email" placeholder="jane@acme.example" {...register("email")} />
            <FieldError>{errors.email?.message}</FieldError>
          </div>
          <div>
            <Label htmlFor="user-role">Role</Label>
            <Select id="user-role" {...register("role")}>
              {ROLES.map((role) => (
                <option key={role} value={role}>
                  {role.replace("_", " ")}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Sending…" : "Send invite"}
            </Button>
          </div>
        </form>
      </Modal>
    </Card>
  );
}
