'use client';

import { useAuthGuard } from '@/hooks/use-auth-guard';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface AuthPageGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
  skipRedirect?: boolean; // New prop to skip redirect logic
}

export function AuthPageGuard({ children, redirectTo, skipRedirect = false }: AuthPageGuardProps) {
  const { isLoading } = useAuthGuard({ 
    redirectTo,
    requireAuth: false,
    checkProfile: true,
    skipRedirect // Pass through to hook
  });

  if (isLoading && !skipRedirect) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm text-muted-foreground">
              Checking authentication...
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
}