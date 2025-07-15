"use client";

import { SidebarNav } from '@/components/layout/sidebar/sidebar-nav';
import { SidebarNavDebug } from '@/components/layout/sidebar/sidebar-nav-debug';
import { agencyNavItems } from '@/config/navigation/agency-nav';
import { SidebarProvider } from '@/components/layout/sidebar';

export default function DebugSidebarPage() {
  // Create a simple test array
  const testItems = [
    { title: "Test 1", href: "/test1", icon: "Home" },
    { title: "Test 2", href: "/test2", icon: "Settings" },
    { title: "Test 3", href: "/test3", icon: "Users" },
  ];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-4">Debug Sidebar Navigation</h1>
        
        <div className="grid grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Test Items (Debug Component)</h2>
            <div className="border rounded p-4 bg-gray-50">
              <SidebarNavDebug items={testItems} />
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Agency Items (Debug Component)</h2>
            <div className="border rounded p-4 bg-gray-50">
              <SidebarNavDebug items={agencyNavItems} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mt-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Test Items (Original Component)</h2>
            <div className="border rounded p-4 bg-gray-50">
              <SidebarProvider>
                <SidebarNav items={testItems} />
              </SidebarProvider>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Agency Items (Original Component)</h2>
            <div className="border rounded p-4 bg-gray-50">
              <SidebarProvider>
                <SidebarNav items={agencyNavItems} />
              </SidebarProvider>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Raw Agency Items Data</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
          {JSON.stringify(agencyNavItems, null, 2)}
        </pre>
      </div>
    </div>
  );
}