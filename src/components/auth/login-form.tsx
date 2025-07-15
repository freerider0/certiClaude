'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from '@/i18n/navigation';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Link } from '@/i18n/navigation';
import { AlertCircle } from 'lucide-react';
import { useSupabase } from '@/components/providers/supabase-provider';
import { OAuthProviders } from './oauth/oauth-providers';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const t = useTranslations('auth');
  const router = useRouter();
  const supabase = useSupabase();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (authError) {
        throw authError;
      }

      if (!authData.user) {
        throw new Error('Failed to sign in');
      }

      // Check if user has completed their profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('agency_id, full_name')
        .eq('id', authData.user.id)
        .single();

      // Redirect based on profile completion
      if (!profile?.agency_id) {
        router.push('/onboarding');
      } else {
        router.push('/dashboard');
      }

    } catch (error: any) {
      console.error('Login error:', error);
      
      // Handle specific auth errors
      if (error.message === 'Invalid login credentials') {
        setError('Invalid email or password. Please check your credentials and try again.');
      } else if (error.message === 'Email not confirmed') {
        setError('Please check your email and click the confirmation link before signing in.');
      } else {
        setError(error.message || 'An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSuccess = () => {
    // OAuth success is handled by the callback page
    // This is just for consistency with the interface
  };

  const handleOAuthError = (error: string) => {
    setError(error);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{t('welcomeBack')}</CardTitle>
        <CardDescription>
          {t('chooseSignInMethod')}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* OAuth Providers */}
        <OAuthProviders
          mode="login"
          onSuccess={handleOAuthSuccess}
          onError={handleOAuthError}
          showTermsNotice={false}
        />

        {/* Email Login Form */}
        <div className="space-y-4">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('email')}</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="name@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('password')}</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? t('loading') : t('signIn')}
            </Button>
          </form>
        </Form>
        
        {/* Account Links */}
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            {t('dontHaveAccount')}{' '}
            <Link href="/auth/signup" className="text-primary hover:underline">
              {t('signUp')}
            </Link>
          </p>
          <Link
            href="/auth/forgot-password"
            className="text-sm text-muted-foreground hover:text-primary block"
          >
            {t('forgotPassword')}
          </Link>
        </div>
        </div>
      </CardContent>
    </Card>
  );
}