export interface NavItem {
  label: string;
  href: string;
  permission?: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", permission: "dashboard.read" },
  { label: "Tenants", href: "/tenants", permission: "tenants.read" },
  { label: "Billing", href: "/billing", permission: "billing.read" },
  { label: "Settings", href: "/settings", permission: "admins.read" },
];
