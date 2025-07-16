'use client';

import { useEffect, useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useSupabase } from '@/components/providers/supabase-provider';
import type { User } from '@supabase/supabase-js';

interface AuthGuardOptions {
  redirectTo?: string;
  requireAuth?: boolean;
  checkProfile?: boolean;
  skipRedirect?: boolean;
}

interface AuthGuardState {
  isLoading: boolean;
  user: User | null;
  isAuthenticated: boolean;
}

export function useAuthGuard(options: AuthGuardOptions = {}): AuthGuardState {
  const {
    redirectTo = '/agency/dashboard',
    requireAuth = false,
    checkProfile = true,
    skipRedirect = false
  } = options;
  
  const router = useRouter();
  const supabase = useSupabase();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session check error:', error);
          setIsLoading(false);
          return;
        }

        if (session?.user) {
          setUser(session.user);
          
          // Skip redirect logic if skipRedirect is true
          if (skipRedirect) {
            return;
          }
          
          if (checkProfile) {
            // Check if user is an admin
            const { data: adminUser } = await supabase
              .from('admin_users')
              .select('id')
              .eq('user_id', session.user.id)
              .maybeSingle();

            if (adminUser) {
              router.push('/admin/dashboard');
              return;
            }

            // Check if user has an agency association
            const { data: agencyUser, error: agencyError } = await supabase
              .from('agency_users')
              .select('agency_id, role')
              .eq('user_id', session.user.id)
              .maybeSingle();

            if (agencyError) {
              console.error('Agency check error:', agencyError);
              // If error checking agency, redirect to onboarding
              router.push('/onboarding');
              return;
            }

            if (!agencyUser?.agency_id) {
              // User has no agency, redirect to onboarding
              router.push('/onboarding');
              return;
            }

            // User has an agency, redirect to agency dashboard
            router.push('/agency/dashboard');
          } else {
            router.push(redirectTo);
          }
        } else if (requireAuth) {
          router.push('/auth/login');
        }
      } catch (error) {
        console.error('Auth guard error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          checkSession();
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          if (requireAuth) {
            router.push('/auth/login');
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase, router, redirectTo, requireAuth, checkProfile]);

  return { 
    isLoading, 
    user, 
    isAuthenticated: !!user 
  };
}