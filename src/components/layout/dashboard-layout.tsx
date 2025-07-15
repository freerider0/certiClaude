"use client";

import React from "react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarNav,
  SidebarToggle,
  useSidebar,
} from "./sidebar";
import type { NavItem } from "./sidebar/sidebar-nav";
import { Separator } from "@/components/ui/separator";
import { User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";

interface DashboardLayoutProps {
  children: React.ReactNode;
  navItems: NavItem[];
  header?: React.ReactNode;
  className?: string;
  user?: {
    name?: string;
    email?: string;
    image?: string;
  };
}

function DashboardContent({
  children,
  navItems,
  header,
  className,
  user,
}: DashboardLayoutProps) {
  const { isCollapsed } = useSidebar();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar>
        <SidebarContent>
          {/* Logo/Brand Section */}
          <div
            className={cn(
              "flex h-14 items-center border-b px-4",
              isCollapsed && "justify-center"
            )}
          >
            {!isCollapsed ? (
              <h2 className="text-lg font-semibold">Dashboard</h2>
            ) : (
              <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                D
              </div>
            )}
          </div>

          {/* Navigation */}
          <SidebarNav items={navItems} className="flex-1" />

          {/* User Section */}
          <div className="mt-auto border-t p-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-2 p-2",
                    isCollapsed && "justify-center"
                  )}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.image} alt={user?.name} />
                    <AvatarFallback>
                      {user?.name?.charAt(0) || <User className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                  {!isCollapsed && (
                    <div className="flex flex-col items-start text-sm">
                      <span className="font-medium">{user?.name || "User"}</span>
                      <span className="text-xs text-muted-foreground">
                        {user?.email || "user@example.com"}
                      </span>
                    </div>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/billing">Billing</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </SidebarContent>
      </Sidebar>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="flex h-14 items-center gap-4 border-b bg-background px-6">
          <SidebarToggle variant="mobile" />
          <SidebarToggle variant="desktop" />
          <Separator orientation="vertical" className="h-6" />
          {header}
        </header>

        {/* Page Content */}
        <main className={cn("flex-1 overflow-y-auto p-6", className)}>
          {children}
        </main>
      </div>
    </div>
  );
}

export function DashboardLayout(props: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <DashboardContent {...props} />
    </SidebarProvider>
  );
}