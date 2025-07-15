export interface NavItem {
  title: string;
  href: string;
  icon?: string;
  disabled?: boolean;
  external?: boolean;
  badge?: string | number;
  items?: NavItem[];
}

export const agencyNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/agency/dashboard",
    icon: "LayoutDashboard",
  },
  {
    title: "Properties",
    href: "/agency/properties",
    icon: "Home",
    badge: "12",
  },
  {
    title: "Orders",
    href: "/agency/orders",
    icon: "ShoppingCart",
    badge: "3",
  },
  {
    title: "Customers",
    href: "/agency/customers",
    icon: "Users",
  },
  {
    title: "Earnings",
    href: "/agency/earnings",
    icon: "DollarSign",
    items: [
      {
        title: "Overview",
        href: "/agency/earnings/overview",
      },
      {
        title: "Transactions",
        href: "/agency/earnings/transactions",
      },
      {
        title: "Payouts",
        href: "/agency/earnings/payouts",
      },
    ],
  },
  {
    title: "Reports",
    href: "/agency/reports",
    icon: "FileText",
    items: [
      {
        title: "Sales Report",
        href: "/agency/reports/sales",
      },
      {
        title: "Property Report",
        href: "/agency/reports/properties",
      },
      {
        title: "Customer Report",
        href: "/agency/reports/customers",
      },
    ],
  },
  {
    title: "Pricing",
    href: "/agency/pricing",
    icon: "CreditCard",
  },
  {
    title: "Settings",
    href: "/agency/settings",
    icon: "Settings",
    items: [
      {
        title: "Profile",
        href: "/agency/settings/profile",
      },
      {
        title: "Agency Details",
        href: "/agency/settings/agency",
      },
      {
        title: "Notifications",
        href: "/agency/settings/notifications",
      },
      {
        title: "Integrations",
        href: "/agency/settings/integrations",
      },
    ],
  },
];