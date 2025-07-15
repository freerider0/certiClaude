"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface NavItem {
  title: string;
  href: string;
  icon?: string;
  disabled?: boolean;
  external?: boolean;
  badge?: string | number;
  items?: NavItem[];
}

interface SidebarNavDebugProps {
  items: NavItem[];
  className?: string;
}

export function SidebarNavDebug({ items, className }: SidebarNavDebugProps) {
  console.log("SidebarNavDebug - items:", items);

  if (!items || !Array.isArray(items)) {
    return <div className="text-red-500">No items or invalid items</div>;
  }

  return (
    <div className={cn("p-4", className)}>
      <h3 className="font-bold mb-2">Debug Sidebar Items ({items.length} total):</h3>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className="border p-2 rounded">
            <div className="font-medium">{index + 1}. {item.title}</div>
            <div className="text-sm text-gray-600">href: {item.href}</div>
            <div className="text-sm text-gray-600">icon: {item.icon || "none"}</div>
            {item.items && item.items.length > 0 && (
              <div className="ml-4 mt-1">
                <div className="text-sm">Has {item.items.length} children</div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}