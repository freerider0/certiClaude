"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Menu, PanelLeftClose, PanelLeft } from "lucide-react";
import { useSidebar } from "./sidebar-provider";
import { cn } from "@/lib/utils";

interface SidebarToggleProps {
  className?: string;
  variant?: "mobile" | "desktop";
}

export function SidebarToggle({ className, variant = "desktop" }: SidebarToggleProps) {
  const { toggleSidebar, toggleCollapse, isCollapsed } = useSidebar();

  if (variant === "mobile") {
    return (
      <Button
        variant="ghost"
        size="icon"
        className={cn("md:hidden", className)}
        onClick={toggleSidebar}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle sidebar</span>
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("hidden md:flex", className)}
      onClick={toggleCollapse}
    >
      {isCollapsed ? (
        <PanelLeft className="h-5 w-5" />
      ) : (
        <PanelLeftClose className="h-5 w-5" />
      )}
      <span className="sr-only">Toggle sidebar</span>
    </Button>
  );
}