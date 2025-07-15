"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { useSidebar } from "./sidebar-provider";
import { Sheet, SheetContent } from "@/components/ui/sheet";

interface SidebarProps {
  children: React.ReactNode;
  className?: string;
}

export function Sidebar({ children, className }: SidebarProps) {
  const { isOpen, isCollapsed, setIsOpen } = useSidebar();

  return (
    <>
      {/* Mobile Sidebar (Drawer) */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex h-full flex-col">{children}</div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden md:flex h-full flex-col border-r bg-background transition-all duration-300",
          isCollapsed ? "w-16" : "w-64",
          className
        )}
      >
        {children}
      </aside>
    </>
  );
}