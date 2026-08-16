"use client";

import { useState } from "react";
import { Plus, Home } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input, Label, FieldError } from "@/components/ui/input";
import { Table, Thead, Tbody, Tr, Th, Td, EmptyState } from "@/components/ui/table";
import { useCreateBranch, useTenantBranches } from "@/hooks/use-tenants";
import { ApiError } from "@/lib/api-client";

const schema = z.object({
  name: z.string().min(2, "Branch name is required"),
  city: z.string().optional(),
  country: z.string().optional(),
  phone: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export function BranchesTab({ tenantId }: { tenantId: string }) {
  const [open, setOpen] = useState(false);
  const { data: branches, isLoading } = useTenantBranches(tenantId);
  const createBranch = useCreateBranch(tenantId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    try {
      await createBranch.mutateAsync(values);
      toast.success("Branch added.");
      reset();
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't add the branch.");
    }
  };

  return (
    <Card>
      <div className="flex items-center justify-between border-b border-mist-200 px-5 py-4">
        <p className="font-display text-base font-semibold text-graphite-900">Branches</p>
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> Add branch
        </Button>
      </div>

      {branches?.length ? (
        <Table>
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>City</Th>
              <Th>Country</Th>
              <Th>Phone</Th>
            </Tr>
          </Thead>
          <Tbody>
            {branches.map((branch) => (
              <Tr key={branch.id}>
                <Td>
                  <span className="flex items-center gap-2 font-medium text-graphite-900">
                    {branch.isHeadOffice && <Home className="h-3.5 w-3.5 text-blue-500" />}
                    {branch.name}
                  </span>
                </Td>
                <Td className="text-graphite-600">{branch.city || "—"}</Td>
                <Td className="text-graphite-600">{branch.country || "—"}</Td>
                <Td className="text-graphite-600">{branch.phone || "—"}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      ) : (
        !isLoading && (
          <EmptyState
            title="No branches yet"
            description="Add the tenant's head office to get started."
          />
        )
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Add branch">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <Label htmlFor="branch-name">Branch name</Label>
            <Input id="branch-name" placeholder="HQ - Mumbai" {...register("name")} />
            <FieldError>{errors.name?.message}</FieldError>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="branch-city">City</Label>
              <Input id="branch-city" placeholder="Mumbai" {...register("city")} />
            </div>
            <div>
              <Label htmlFor="branch-country">Country</Label>
              <Input id="branch-country" placeholder="India" {...register("country")} />
            </div>
          </div>
          <div>
            <Label htmlFor="branch-phone">Phone</Label>
            <Input id="branch-phone" placeholder="+91 22 1234 5678" {...register("phone")} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding…" : "Add branch"}
            </Button>
          </div>
        </form>
      </Modal>
    </Card>
  );
}
