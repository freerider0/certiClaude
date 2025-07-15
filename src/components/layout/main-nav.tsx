'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { LanguageSelector } from './language-selector';
import { useSupabase } from '@/components/providers/supabase-provider';
import { useEffect, useState } from 'react';
import { 
  LayoutDashboard, 
  Home, 
  Package, 
  Users, 
  DollarSign, 
  FileText, 
  BarChart3, 
  Settings,
  Building2,
  ShoppingCart,
  Wallet,
  CreditCard,
  ChartBar,
  Wrench,
  UserCog,
  Shield,
  Code,
  ChevronDown,
  Menu,
  X
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type UserRole = 'customer' | 'agency_owner' | 'agency_staff' | 'platform_admin' | null;

interface NavItem {
  href: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  children?: NavItem[];
}

export function MainNav() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const supabase = useSupabase();
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function getUserRole() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // TODO: Fetch actual user role from database
          // For now, we'll use a placeholder
          setUserRole('agency_owner'); // This should come from user metadata or a profile table
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
      } finally {
        setLoading(false);
      }
    }

    getUserRole();
  }, [supabase]);

  // Agency Portal Navigation
  const agencyNavItems: NavItem[] = [
    { href: '/agency/dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { href: '/agency/properties', label: t('properties'), icon: Home },
    { href: '/agency/customers', label: t('customers'), icon: Users },
    { href: '/agency/orders', label: t('orders'), icon: Package },
    { href: '/agency/earnings', label: t('earnings'), icon: DollarSign },
    { href: '/agency/pricing', label: t('myPricing'), icon: CreditCard },
    { href: '/agency/reports', label: t('reports'), icon: BarChart3 },
    { href: '/agency/settings', label: t('settings'), icon: Settings },
  ];

  // Platform Admin Navigation
  const adminNavItems: NavItem[] = [
    { href: '/admin/dashboard', label: t('masterDashboard'), icon: LayoutDashboard },
    { href: '/admin/agencies', label: t('agencyManagement'), icon: Building2 },
    { href: '/admin/properties', label: t('propertyDatabase'), icon: Home },
    { href: '/admin/orders', label: t('orderControl'), icon: ShoppingCart },
    { 
      href: '/admin/financial', 
      label: t('financialManagement'), 
      icon: Wallet,
      children: [
        { href: '/admin/financial/revenue', label: t('revenueDashboard') },
        { href: '/admin/financial/billing', label: t('billingOperations') },
        { href: '/admin/financial/payouts', label: t('payoutManagement') },
        { href: '/admin/financial/reports', label: t('financialReports') },
      ]
    },
    { href: '/admin/services', label: t('serviceCatalog'), icon: Wrench },
    { href: '/admin/providers', label: t('providerNetwork'), icon: UserCog },
    { href: '/admin/analytics', label: t('businessIntelligence'), icon: ChartBar },
    { 
      href: '/admin/system', 
      label: t('systemAdministration'), 
      icon: Shield,
      children: [
        { href: '/admin/system/settings', label: t('platformSettings') },
        { href: '/admin/system/users', label: t('userManagement') },
        { href: '/admin/system/integrations', label: t('integrations') },
        { href: '/admin/system/security', label: t('security') },
      ]
    },
    { href: '/admin/developer', label: t('developerTools'), icon: Code },
  ];

  // Default navigation for non-logged in users
  const defaultNavItems: NavItem[] = [
    { href: '/features', label: t('features') },
    { href: '/pricing', label: t('pricing') },
    { href: '/about', label: t('about') },
    { href: '/contact', label: t('contact') },
  ];

  // Determine which navigation to show
  let navItems: NavItem[] = defaultNavItems;
  let portalPrefix = '';
  
  if (userRole === 'agency_owner' || userRole === 'agency_staff') {
    navItems = agencyNavItems;
    portalPrefix = 'Agency Portal';
  } else if (userRole === 'platform_admin') {
    navItems = adminNavItems;
    portalPrefix = 'Admin Panel';
  }

  const renderNavItem = (item: NavItem) => {
    const isActive = pathname.startsWith(item.href);
    const Icon = item.icon;

    if (item.children) {
      return (
        <DropdownMenu key={item.href}>
          <DropdownMenuTrigger className={cn(
            'flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary',
            isActive ? 'text-primary' : 'text-muted-foreground'
          )}>
            {Icon && <Icon className="h-4 w-4" />}
            {item.label}
            <ChevronDown className="h-3 w-3" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {item.children.map((child) => (
              <DropdownMenuItem key={child.href} asChild>
                <Link href={child.href} className="w-full">
                  {child.label}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          'flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary',
          isActive ? 'text-primary' : 'text-muted-foreground'
        )}
      >
        {Icon && <Icon className="h-4 w-4" />}
        {item.label}
      </Link>
    );
  };

  if (loading) {
    return (
      <nav className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-6">
          <Link href="/" className="text-xl font-bold">
            CertiFast
          </Link>
        </div>
      </nav>
    );
  }

  return (
    <>
      <nav className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold">CertiFast</span>
            {portalPrefix && (
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                {portalPrefix}
              </span>
            )}
          </Link>
          <div className="hidden md:flex items-center space-x-4">
            {navItems.map(renderNavItem)}
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <LanguageSelector />
          <button
            className="md:hidden p-2 hover:bg-accent rounded-md"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b bg-background">
          <div className="px-4 py-2 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              const Icon = item.icon;

              if (item.children) {
                return (
                  <div key={item.href} className="space-y-1">
                    <div className={cn(
                      'flex items-center gap-2 p-2 text-sm font-medium rounded-md',
                      isActive ? 'bg-accent text-primary' : 'text-muted-foreground'
                    )}>
                      {Icon && <Icon className="h-4 w-4" />}
                      {item.label}
                    </div>
                    <div className="ml-6 space-y-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block p-2 text-sm hover:bg-accent rounded-md"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 p-2 text-sm font-medium rounded-md',
                    isActive ? 'bg-accent text-primary' : 'text-muted-foreground hover:bg-accent'
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}