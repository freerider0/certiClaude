export interface NavItem {
  title: string;
  href: string;
  icon?: string;
  disabled?: boolean;
  external?: boolean;
  badge?: string | number;
  items?: NavItem[];
}

export const adminNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: "LayoutDashboard",
  },
  {
    title: "Agencies",
    href: "/admin/agencies",
    icon: "Building2",
  },
  {
    title: "Properties",
    href: "/admin/properties",
    icon: "Home",
  },
  {
    title: "Orders",
    href: "/admin/orders",
    icon: "ShoppingCart",
  },
  {
    title: "Analytics",
    href: "/admin/analytics",
    icon: "BarChart3",
  },
  {
    title: "Financial",
    href: "/admin/financial",
    icon: "DollarSign",
    items: [
      {
        title: "Transactions",
        href: "/admin/financial/transactions",
      },
      {
        title: "Payouts",
        href: "/admin/financial/payouts",
      },
      {
        title: "Revenue",
        href: "/admin/financial/revenue",
      },
    ],
  },
  {
    title: "Services",
    href: "/admin/services",
    icon: "Package",
  },
  {
    title: "Providers",
    href: "/admin/providers",
    icon: "UserCheck",
  },
  {
    title: "Developer",
    href: "/admin/developer",
    icon: "Code",
    items: [
      {
        title: "API Keys",
        href: "/admin/developer/api-keys",
      },
      {
        title: "Webhooks",
        href: "/admin/developer/webhooks",
      },
      {
        title: "Logs",
        href: "/admin/developer/logs",
      },
    ],
  },
  {
    title: "System",
    href: "/admin/system",
    icon: "Shield",
    items: [
      {
        title: "Users",
        href: "/admin/system/users",
      },
      {
        title: "Roles",
        href: "/admin/system/roles",
      },
      {
        title: "Security",
        href: "/admin/system/security",
      },
      {
        title: "Settings",
        href: "/admin/system/settings",
      },
    ],
  },
];