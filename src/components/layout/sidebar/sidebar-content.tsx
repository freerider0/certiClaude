"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface SidebarContentProps {
  children: React.ReactNode;
  className?: string;
}

export function SidebarContent({ children, className }: SidebarContentProps) {
  return (
    <div className={cn("flex flex-1 flex-col overflow-hidden", className)}>
      {children}
    </div>
  );
}