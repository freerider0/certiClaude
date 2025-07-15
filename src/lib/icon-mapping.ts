import {
  LayoutDashboard,
  CreditCard,
  Settings,
  User,
  HelpCircle,
  Building2,
  Home,
  ShoppingCart,
  UserCheck,
  Package,
  DollarSign,
  Code,
  BarChart3,
  Shield,
  Users,
  FileText,
  TrendingUp,
  ClipboardList,
  type LucideIcon,
} from "lucide-react";

export const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  CreditCard,
  Settings,
  User,
  HelpCircle,
  Building2,
  Home,
  ShoppingCart,
  UserCheck,
  Package,
  DollarSign,
  Code,
  BarChart3,
  Shield,
  Users,
  FileText,
  TrendingUp,
  ClipboardList,
};

export function getIcon(iconName?: string): LucideIcon | undefined {
  if (!iconName) return undefined;
  return iconMap[iconName];
}