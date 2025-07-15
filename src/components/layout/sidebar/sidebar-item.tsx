"use client";

import React, { useState } from "react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { useSidebar } from "./sidebar-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ChevronDown } from "lucide-react";
import { getIcon } from "@/lib/icon-mapping";
import type { NavItem } from "./sidebar-nav";

interface SidebarItemProps {
  item: NavItem;
  isActive?: boolean;
  depth?: number;
}

export function SidebarItem({ item, isActive, depth = 0 }: SidebarItemProps) {
  const { isCollapsed } = useSidebar();
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = item.items && item.items.length > 0;
  const Icon = getIcon(item.icon);


  // Safety check
  if (!item || !item.title || !item.href) {
    console.error("SidebarItem: Invalid item structure", item);
    return null;
  }

  const content = (
    <>
      {Icon && (
        <Icon
          className={cn(
            "h-4 w-4 shrink-0",
            isCollapsed && depth === 0 && "h-5 w-5"
          )}
        />
      )}
      {!isCollapsed && (
        <>
          <span className="flex-1 truncate">{item.title}</span>
          {item.badge && (
            <Badge variant="secondary" className="ml-auto">
              {item.badge}
            </Badge>
          )}
          {hasChildren && (
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform",
                isExpanded && "-rotate-180"
              )}
            />
          )}
        </>
      )}
    </>
  );

  const itemClasses = cn(
    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
    "hover:bg-accent hover:text-accent-foreground",
    isActive && "bg-accent text-accent-foreground font-medium",
    item.disabled && "opacity-50 cursor-not-allowed",
    depth > 0 && "ml-6",
    isCollapsed && depth === 0 && "justify-center"
  );

  if (hasChildren && !isCollapsed) {
    return (
      <div>
        <Button
          variant="ghost"
          className={cn(itemClasses, "w-full justify-start")}
          onClick={() => setIsExpanded(!isExpanded)}
          disabled={item.disabled}
        >
          {content}
        </Button>
        {isExpanded && (
          <div className="mt-1">
            {item.items!.map((child, index) => (
              <SidebarItem
                key={index}
                item={child}
                isActive={isActive}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  const linkContent = (
    <Link
      href={item.href}
      className={itemClasses}
      target={item.external ? "_blank" : undefined}
      rel={item.external ? "noopener noreferrer" : undefined}
    >
      {content}
    </Link>
  );

  if (isCollapsed && depth === 0) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
          <TooltipContent side="right" className="flex items-center gap-2">
            {item.title}
            {item.badge && <Badge variant="secondary">{item.badge}</Badge>}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return linkContent;
}