"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/status-pill";
import { useChangePlan, useTenantSubscription } from "@/hooks/use-tenants";
import { useSubscriptionPlans } from "@/hooks/use-billing";
import { SUBSCRIPTION_STATUS } from "@/lib/status-config";
import { formatCurrency, formatDate } from "@/lib/format";
import { cn } from "@/lib/cn";
import { ApiError } from "@/lib/api-client";

export function SubscriptionTab({ tenantId }: { tenantId: string }) {
  const { data: subscription, isLoading } = useTenantSubscription(tenantId);
  const { data: plans } = useSubscriptionPlans();
  const changePlan = useChangePlan(tenantId);
  const [pendingPlanId, setPendingPlanId] = useState<string | null>(null);

  const handleSelectPlan = async (planId: string) => {
    setPendingPlanId(planId);
    try {
      await changePlan.mutateAsync({ planId });
      toast.success("Subscription updated.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't change the plan.");
    } finally {
      setPendingPlanId(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Current subscription</CardTitle>
        </CardHeader>
        <CardBody>
          {isLoading ? (
            <p className="text-sm text-graphite-600">Loading…</p>
          ) : subscription ? (
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-graphite-400">Plan</p>
                <p className="mt-1 font-display text-lg font-semibold text-graphite-900">
                  {subscription.plan.name}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-graphite-400">Status</p>
                <div className="mt-1">
                  <StatusPill
                    label={SUBSCRIPTION_STATUS[subscription.status].label}
                    tone={SUBSCRIPTION_STATUS[subscription.status].tone}
                  />
                </div>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-graphite-400">Price</p>
                <p className="mt-1 font-mono text-sm text-graphite-900">
                  {formatCurrency(subscription.plan.price, subscription.plan.currency)} /{" "}
                  {subscription.plan.billingCycle.toLowerCase()}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-graphite-400">Started</p>
                <p className="mt-1 text-sm text-graphite-900">{formatDate(subscription.startDate)}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-graphite-600">No subscription yet — choose a plan below.</p>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Available plans</CardTitle>
        </CardHeader>
        <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {plans?.map((plan) => {
            const isCurrent = subscription?.planId === plan.id && subscription.status === "ACTIVE";
            return (
              <div
                key={plan.id}
                className={cn(
                  "flex flex-col rounded-lg border p-4",
                  isCurrent ? "border-ink-800 bg-mist-50" : "border-mist-200",
                )}
              >
                <p className="font-display text-base font-semibold text-graphite-900">{plan.name}</p>
                <p className="mt-1 font-mono text-xl font-semibold text-graphite-900">
                  {formatCurrency(plan.price, plan.currency)}
                  <span className="text-xs font-normal text-graphite-400">
                    /{plan.billingCycle.toLowerCase()}
                  </span>
                </p>
                <ul className="mt-3 flex-1 space-y-1 text-xs text-graphite-600">
                  {plan.features.map((f) => (
                    <li key={f}>&bull; {f}</li>
                  ))}
                </ul>
                <Button
                  size="sm"
                  variant={isCurrent ? "secondary" : "primary"}
                  className="mt-4"
                  disabled={isCurrent || pendingPlanId === plan.id}
                  onClick={() => handleSelectPlan(plan.id)}
                >
                  {isCurrent ? "Current plan" : pendingPlanId === plan.id ? "Applying…" : "Switch to this plan"}
                </Button>
              </div>
            );
          })}
        </CardBody>
      </Card>
    </div>
  );
}
