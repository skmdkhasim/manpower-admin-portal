"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, FieldError, Textarea } from "@/components/ui/input";
import { useCreateTenant } from "@/hooks/use-tenants";
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

export default function NewTenantPage() {
  const router = useRouter();
  const createTenant = useCreateTenant();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    try {
      const tenant = await createTenant.mutateAsync({
        ...values,
        clientCompanyCount: values.clientCompanyCount ? Number(values.clientCompanyCount) : undefined,
      });
      toast.success(`${tenant.name} was added — continue with onboarding.`);
      router.push(`/tenants/${tenant.id}`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't create the tenant.");
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="New tenant"
        description="Start onboarding a new client company. You'll add branches, staff, and a plan next."
      />

      <Card>
        <CardBody>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <div>
              <Label htmlFor="name">Company name</Label>
              <Input id="name" placeholder="Acme Staffing Co" {...register("name")} />
              <FieldError>{errors.name?.message}</FieldError>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="industry">Industry</Label>
                <Input id="industry" placeholder="Manpower supply" {...register("industry")} />
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <Input id="country" placeholder="India" {...register("country")} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contactName">Primary contact name</Label>
                <Input id="contactName" placeholder="Jane Doe" {...register("contactName")} />
              </div>
              <div>
                <Label htmlFor="contactPhone">Contact phone</Label>
                <Input id="contactPhone" placeholder="+91 98765 43210" {...register("contactPhone")} />
              </div>
            </div>

            <div>
              <Label htmlFor="clientCompanyCount">Client companies</Label>
              <Input
                id="clientCompanyCount"
                type="number"
                min={0}
                placeholder="How many businesses do they currently supply workers to?"
                {...register("clientCompanyCount")}
              />
            </div>

            <div>
              <Label htmlFor="contactEmail">Contact email</Label>
              <Input
                id="contactEmail"
                type="email"
                placeholder="ops@acme.example"
                {...register("contactEmail")}
              />
              <FieldError>{errors.contactEmail?.message}</FieldError>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" rows={3} placeholder="Anything worth flagging for support…" {...register("notes")} />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating…" : "Create tenant"}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
