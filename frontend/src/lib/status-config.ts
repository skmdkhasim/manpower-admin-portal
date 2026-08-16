/**
 * Single source of truth for the "ledger rail" status language used across
 * the portal: a colored left-border rail on rows/cards, paired with a dot +
 * label pill. The color always means the same thing everywhere it appears
 * (tenant lifecycle, subscriptions, invoices) so the eye can scan a page of
 * mixed record types and read status at a glance.
 */
export type RailTone = "amber" | "emerald" | "coral" | "graphite" | "ink";

export const TONE_CLASSES: Record<
  RailTone,
  { dot: string; text: string; bg: string; rail: string }
> = {
  amber: { dot: "bg-amber-500", text: "text-amber-600", bg: "bg-amber-100", rail: "border-amber-500" },
  emerald: {
    dot: "bg-emerald-500",
    text: "text-emerald-600",
    bg: "bg-emerald-100",
    rail: "border-emerald-500",
  },
  coral: { dot: "bg-coral-500", text: "text-coral-500", bg: "bg-coral-100", rail: "border-coral-500" },
  graphite: {
    dot: "bg-graphite-400",
    text: "text-graphite-600",
    bg: "bg-mist-100",
    rail: "border-graphite-400",
  },
  ink: { dot: "bg-ink-800", text: "text-ink-800", bg: "bg-mist-100", rail: "border-ink-800" },
};

export const TENANT_STATUS: Record<string, { label: string; tone: RailTone }> = {
  ONBOARDING: { label: "Onboarding", tone: "amber" },
  ACTIVE: { label: "Active", tone: "emerald" },
  SUSPENDED: { label: "Suspended", tone: "coral" },
  CHURNED: { label: "Churned", tone: "graphite" },
};

export const SUBSCRIPTION_STATUS: Record<string, { label: string; tone: RailTone }> = {
  TRIALING: { label: "Trialing", tone: "amber" },
  ACTIVE: { label: "Active", tone: "emerald" },
  PAST_DUE: { label: "Past due", tone: "coral" },
  CANCELLED: { label: "Cancelled", tone: "graphite" },
  EXPIRED: { label: "Expired", tone: "graphite" },
};

export const INVOICE_STATUS: Record<string, { label: string; tone: RailTone }> = {
  DRAFT: { label: "Draft", tone: "graphite" },
  PENDING: { label: "Pending", tone: "amber" },
  PAID: { label: "Paid", tone: "emerald" },
  OVERDUE: { label: "Overdue", tone: "coral" },
  FAILED: { label: "Failed", tone: "coral" },
  REFUNDED: { label: "Refunded", tone: "graphite" },
};

export const TENANT_USER_STATUS: Record<string, { label: string; tone: RailTone }> = {
  INVITED: { label: "Invited", tone: "amber" },
  ACTIVE: { label: "Active", tone: "emerald" },
  SUSPENDED: { label: "Suspended", tone: "coral" },
};

export const ONBOARDING_STEPS: { key: string; label: string }[] = [
  { key: "COMPANY_DETAILS", label: "Company details" },
  { key: "BRANCH_SETUP", label: "Branch setup" },
  { key: "ADMIN_USER", label: "Admin user" },
  { key: "PLAN_SELECTION", label: "Plan selection" },
  { key: "COMPLETE", label: "Complete" },
];
