export type TenantStatus = "ONBOARDING" | "ACTIVE" | "SUSPENDED" | "CHURNED";
export type TenantOnboardingStep =
  | "COMPANY_DETAILS"
  | "BRANCH_SETUP"
  | "ADMIN_USER"
  | "PLAN_SELECTION"
  | "COMPLETE";
export type TenantUserRole = "OWNER" | "ADMIN" | "HR_MANAGER" | "RECRUITER" | "VIEWER";
export type TenantUserStatus = "INVITED" | "ACTIVE" | "SUSPENDED";
export type BillingCycle = "MONTHLY" | "YEARLY";
export type SubscriptionStatus = "TRIALING" | "ACTIVE" | "PAST_DUE" | "CANCELLED" | "EXPIRED";
export type PlanChangeAction =
  | "TRIAL_START"
  | "NEW_SUBSCRIPTION"
  | "UPGRADE"
  | "DOWNGRADE"
  | "RENEWAL"
  | "CANCELLATION";
export type InvoiceStatus = "DRAFT" | "PENDING" | "PAID" | "OVERDUE" | "FAILED" | "REFUNDED";

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
  permissions: string[];
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  industry?: string | null;
  contactName?: string | null;
  contactEmail: string;
  contactPhone?: string | null;
  country?: string | null;
  logoUrl?: string | null;
  status: TenantStatus;
  onboardingStep: TenantOnboardingStep;
  notes?: string | null;
  /** Client companies this tenant (a staffing agency) currently supplies workers to. */
  clientCompanyCount?: number | null;
  createdAt: string;
  updatedAt: string;
  branches?: TenantBranch[];
  users?: TenantUser[];
  subscriptions?: TenantSubscription[];
}

export interface TenantBranch {
  id: string;
  tenantId: string;
  name: string;
  isHeadOffice: boolean;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postalCode?: string | null;
  phone?: string | null;
  isActive: boolean;
}

export interface TenantUser {
  id: string;
  tenantId: string;
  branchId?: string | null;
  branch?: TenantBranch | null;
  fullName: string;
  email: string;
  phone?: string | null;
  role: TenantUserRole;
  status: TenantUserStatus;
  invitedAt?: string | null;
  lastLoginAt?: string | null;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  code: string;
  price: string;
  currency: string;
  billingCycle: BillingCycle;
  maxUsers: number;
  maxBranches: number;
  features: string[];
  isActive: boolean;
}

export interface TenantSubscription {
  id: string;
  tenantId: string;
  planId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  trialEndsAt?: string | null;
  startDate: string;
  endDate?: string | null;
  autoRenew: boolean;
  cancelledAt?: string | null;
}

export interface TenantPlanHistory {
  id: string;
  tenantId: string;
  fromPlan?: SubscriptionPlan | null;
  toPlan: SubscriptionPlan;
  action: PlanChangeAction;
  effectiveDate: string;
  note?: string | null;
  changedById?: string | null;
}

export interface Invoice {
  id: string;
  tenantId: string;
  tenant?: Tenant;
  subscriptionId?: string | null;
  invoiceNumber: string;
  amount: string;
  currency: string;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  paidAt?: string | null;
  pdfUrl?: string | null;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface DashboardSummary {
  totalTenants: number;
  activeTenants: number;
  onboardingTenants: number;
  suspendedTenants: number;
  activeSubscriptions: number;
  overdueInvoices: number;
  mrr: number;
  recentTenants: Tenant[];
}
