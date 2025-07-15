"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { SidebarItem } from "./sidebar-item";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface NavItem {
  title: string;
  href: string;
  icon?: string;
  disabled?: boolean;
  external?: boolean;
  badge?: string | number;
  items?: NavItem[];
}

interface SidebarNavProps {
  items: NavItem[];
  className?: string;
}

export function SidebarNav({ items, className }: SidebarNavProps) {
  const pathname = usePathname();


  // Handle locale in pathname
  const normalizedPathname = pathname.replace(/^\/[a-z]{2}\//, '/');

  // Safety check
  if (!items || !Array.isArray(items)) {
    console.error("SidebarNav: items is not an array or is undefined", items);
    return (
      <div className="p-4 text-red-500">
        Error: Navigation items not loaded properly
      </div>
    );
  }

  return (
    <ScrollArea className={cn("flex-1", className)}>
      <nav className="flex flex-col gap-1 p-2">
        {items.length === 0 ? (
          <div className="p-4 text-gray-500">No navigation items</div>
        ) : (
          items.map((item, index) => (
            <SidebarItem
              key={index}
              item={item}
              isActive={normalizedPathname === item.href || pathname.endsWith(item.href)}
            />
          ))
        )}
      </nav>
    </ScrollArea>
  );
}