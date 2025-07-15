import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';

export const metadata: Metadata = {
  title: 'Authentication - CertiFast',
  description: 'Sign in or create your CertiFast account',
};

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tAuth = await getTranslations('auth');
  const tHome = await getTranslations('home');
  const tLegal = await getTranslations('legal');

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/10 via-primary/5 to-background">
        <div className="flex flex-col justify-center px-12 py-24">
          <div className="mb-8">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">C</span>
              </div>
              <span className="text-2xl font-bold">CertiFast</span>
            </Link>
          </div>
          
          <div className="space-y-6">
            <h1 className="text-4xl font-bold leading-tight">
              {tHome('subtitle')}
            </h1>
            <p className="text-xl text-muted-foreground">
              {tHome('description')}
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-sm">✓</span>
                </div>
                <span>{tHome('features.ceeGeneration')}</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-sm">✓</span>
                </div>
                <span>{tHome('features.floorPlans')}</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-sm">✓</span>
                </div>
                <span>{tHome('features.automatedReports')}</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-sm">✓</span>
                </div>
                <span>{tHome('features.multiLanguage')}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-12 p-6 bg-card rounded-lg border">
            <blockquote className="text-lg italic">
              "{tHome('testimonial.quote')}"
            </blockquote>
            <div className="mt-4 flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"></div>
              <div>
                <div className="font-semibold">{tHome('testimonial.author')}</div>
                <div className="text-sm text-muted-foreground">{tHome('testimonial.company')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right side - Auth Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-12">
        <div className="mx-auto w-full max-w-sm lg:max-w-2xl">
          {/* Mobile logo */}
          <div className="mb-8 lg:hidden">
            <Link href="/" className="flex items-center justify-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">C</span>
              </div>
              <span className="text-2xl font-bold">CertiFast</span>
            </Link>
          </div>
          
          {children}
          
          {/* Footer */}
          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>
              {tLegal('byContinuing')}{' '}
              <Link href="/legal/terms" className="text-primary hover:underline">
                {tLegal('termsOfService')}
              </Link>{' '}
              {tLegal('and')}{' '}
              <Link href="/legal/privacy" className="text-primary hover:underline">
                {tLegal('privacyPolicy')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}