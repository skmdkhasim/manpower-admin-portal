"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, FieldError, Textarea } from "@/components/ui/input";
import { useTenant, useUpdateTenant } from "@/hooks/use-tenants";
import { ApiError } from "@/lib/api-client";

const schema = z.object({
  name: z.string().min(2, "Company name is required"),
  contactName: z.string().optional(),
  contactEmail: z.string().email("Enter a valid email address"),
  contactPhone: z.string().optional(),
  industry: z.string().optional(),
  country: z.string().optional(),
  notes: z.string().optional(),
  clientCompanyCount: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export function EditTenantClient({ tenantId }: { tenantId: string }) {
  const router = useRouter();
  const { data: tenant, isLoading } = useTenant(tenantId);
  const updateTenant = useUpdateTenant(tenantId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (!tenant) return;
    reset({
      name: tenant.name,
      contactName: tenant.contactName ?? "",
      contactEmail: tenant.contactEmail,
      contactPhone: tenant.contactPhone ?? "",
      industry: tenant.industry ?? "",
      country: tenant.country ?? "",
      notes: tenant.notes ?? "",
      clientCompanyCount:
        tenant.clientCompanyCount !== null && tenant.clientCompanyCount !== undefined
          ? String(tenant.clientCompanyCount)
          : "",
    });
  }, [tenant, reset]);

  const onSubmit = async (values: FormValues) => {
    try {
      await updateTenant.mutateAsync({
        ...values,
        clientCompanyCount: values.clientCompanyCount ? Number(values.clientCompanyCount) : undefined,
      });
      toast.success("Tenant updated.");
      router.push(`/tenants/${tenantId}`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't update the tenant.");
    }
  };

  if (isLoading || !tenant) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-ink-800 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title={`Edit ${tenant.name}`} description="Update this tenant's company details." />

      <Card>
        <CardBody>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <div>
              <Label htmlFor="name">Company name</Label>
              <Input id="name" {...register("name")} />
              <FieldError>{errors.name?.message}</FieldError>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="industry">Industry</Label>
                <Input id="industry" {...register("industry")} />
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <Input id="country" {...register("country")} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contactName">Primary contact name</Label>
                <Input id="contactName" {...register("contactName")} />
              </div>
              <div>
                <Label htmlFor="contactPhone">Contact phone</Label>
                <Input id="contactPhone" {...register("contactPhone")} />
              </div>
            </div>

            <div>
              <Label htmlFor="contactEmail">Contact email</Label>
              <Input id="contactEmail" type="email" {...register("contactEmail")} />
              <FieldError>{errors.contactEmail?.message}</FieldError>
            </div>

            <div>
              <Label htmlFor="clientCompanyCount">Client companies</Label>
              <Input id="clientCompanyCount" type="number" min={0} {...register("clientCompanyCount")} />
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" rows={3} {...register("notes")} />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving…" : "Save changes"}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
