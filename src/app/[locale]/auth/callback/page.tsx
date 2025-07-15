import { Suspense } from 'react';
import { Metadata } from 'next';
import { OAuthCallback } from '@/components/auth/oauth/oauth-callback';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Authentication - CertiFast',
  description: 'Completing your authentication',
};

function CallbackFallback() {
  return (
    <Card className="w-full max-w-md">
      <CardContent className="flex items-center justify-center p-8">
        <div className="text-center space-y-2">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CallbackPage() {
  return (
    <Suspense fallback={<CallbackFallback />}>
      <OAuthCallback />
    </Suspense>
  );
}