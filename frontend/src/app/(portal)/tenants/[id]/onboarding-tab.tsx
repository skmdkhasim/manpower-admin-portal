import { Check } from "lucide-react";
import { toast } from "sonner";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ONBOARDING_STEPS } from "@/lib/status-config";
import { useUpdateOnboardingStep } from "@/hooks/use-tenants";
import { ApiError } from "@/lib/api-client";
import { cn } from "@/lib/cn";
import type { Tenant } from "@/lib/types";

export function OnboardingTab({ tenant }: { tenant: Tenant }) {
  const updateStep = useUpdateOnboardingStep(tenant.id);
  const currentIndex = ONBOARDING_STEPS.findIndex((s) => s.key === tenant.onboardingStep);

  const advance = async (stepKey: string) => {
    try {
      await updateStep.mutateAsync(stepKey);
      toast.success("Onboarding step updated.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't update the step.");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Onboarding checklist</CardTitle>
      </CardHeader>
      <CardBody>
        <ol className="space-y-0">
          {ONBOARDING_STEPS.map((step, index) => {
            const done = index < currentIndex || tenant.onboardingStep === "COMPLETE";
            const isCurrent = step.key === tenant.onboardingStep;
            const isLast = index === ONBOARDING_STEPS.length - 1;

            return (
              <li key={step.key} className="relative flex gap-4 pb-8 last:pb-0">
                {!isLast && (
                  <span
                    className={cn(
                      "absolute left-[15px] top-8 h-full w-px",
                      done ? "bg-emerald-500" : "bg-mist-200",
                    )}
                  />
                )}
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold",
                    done && "border-emerald-500 bg-emerald-500 text-white",
                    isCurrent && !done && "border-amber-500 bg-amber-100 text-amber-600",
                    !done && !isCurrent && "border-mist-200 bg-white text-graphite-400",
                  )}
                >
                  {done ? <Check className="h-4 w-4" /> : index + 1}
                </span>
                <div className="flex flex-1 items-center justify-between pt-1">
                  <div>
                    <p
                      className={cn(
                        "text-sm font-medium",
                        done || isCurrent ? "text-graphite-900" : "text-graphite-400",
                      )}
                    >
                      {step.label}
                    </p>
                    {isCurrent && <p className="text-xs text-graphite-600">Current step</p>}
                  </div>
                  {isCurrent && step.key !== "COMPLETE" && (
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={updateStep.isPending}
                      onClick={() => advance(ONBOARDING_STEPS[index + 1].key)}
                    >
                      Mark complete →
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </CardBody>
    </Card>
  );
}
