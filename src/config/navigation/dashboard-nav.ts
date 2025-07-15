export interface NavItem {
  title: string;
  href: string;
  icon?: string;
  disabled?: boolean;
  external?: boolean;
  badge?: string | number;
  items?: NavItem[];
}

export const dashboardNavItems: NavItem[] = [
  {
    title: "Overview",
    href: "/dashboard",
    icon: "LayoutDashboard",
  },
  {
    title: "Billing",
    href: "/dashboard/billing",
    icon: "CreditCard",
  },
  {
    title: "Account",
    href: "/dashboard/account",
    icon: "User",
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: "Settings",
  },
  {
    title: "Help & Support",
    href: "/dashboard/support",
    icon: "HelpCircle",
  },
];