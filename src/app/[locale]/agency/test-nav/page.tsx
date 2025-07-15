"use client";

import { agencyNavItems } from '@/config/navigation/agency-nav';

export default function TestNavPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Agency Navigation Items Test</h1>
      <pre className="bg-gray-100 p-4 rounded overflow-auto">
        {JSON.stringify(agencyNavItems, null, 2)}
      </pre>
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Items List:</h2>
        <ul className="space-y-2">
          {agencyNavItems.map((item, index) => (
            <li key={index} className="border p-2 rounded">
              <div className="font-medium">{item.title}</div>
              <div className="text-sm text-gray-600">href: {item.href}</div>
              <div className="text-sm text-gray-600">icon: {item.icon}</div>
              {item.items && (
                <div className="ml-4 mt-2">
                  <div className="text-sm font-medium">Children:</div>
                  <ul className="space-y-1">
                    {item.items.map((child, childIndex) => (
                      <li key={childIndex} className="text-sm">
                        {child.title} - {child.href}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}