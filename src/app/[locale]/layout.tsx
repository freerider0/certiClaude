import type { Metadata } from "next";
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Geist, Geist_Mono } from "next/font/google";
import { routing } from '@/i18n/routing';
import { StripeProvider } from '@/components/providers/stripe-provider';
import { SupabaseProvider } from '@/components/providers/supabase-provider';
import { Toaster } from '@/components/ui/sonner';
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CertiFast - Certificados Energéticos y Planos",
  description: "Plataforma profesional para agencias inmobiliarias. Genera certificados CEE y crea planos profesionales.",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  // Ensure that the incoming `locale` is valid
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SupabaseProvider>
          <NextIntlClientProvider messages={messages}>
            <StripeProvider>
              {children}
              <Toaster />
            </StripeProvider>
          </NextIntlClientProvider>
        </SupabaseProvider>
      </body>
    </html>
  );
}
