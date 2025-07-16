'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Shield, Zap, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

export function HeroSection() {
  const t = useTranslations();

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-slate-900/[0.02] bg-[size:20px_20px] dark:bg-grid-slate-100/[0.02]" />
      
      <div className="relative container mx-auto px-4 py-16 lg:py-24">
        <div className="max-w-4xl mx-auto text-center">
          {/* Trust Badge */}
          <div className="flex justify-center mb-8">
            <Badge variant="secondary" className="px-4 py-2 text-sm font-medium bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800">
              <Shield className="w-4 h-4 mr-2" />
              Certificados Oficiales CEE
            </Badge>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-slate-900 dark:text-slate-100">
            Certificados Energéticos{' '}
            <span className="text-emerald-600 dark:text-emerald-400">Profesionales</span>{' '}
            en Minutos
          </h1>

          {/* Subheadline */}
          <div className="text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            <p className="mb-4">
              La plataforma completa para agencias inmobiliarias que necesitan 
              generar certificados CEE oficiales de forma rápida y profesional.
            </p>
          </div>

          <div className="flex justify-center mb-8">
          Hacer el mejor CRM del mercado fue fácil.
Lo jodido fue aceptar que da igual.

Nadie te pide un CRM.
Te piden razones para darte su piso.
Te piden que parezcas distinto sin parecer desesperado.
Que llegues antes, que enseñes mejor,
que no seas “otro más”.

Y eso no se hace con botones.
Se hace con esto:

— Certificados energéticos ilimitados. Gratis.
— Cédulas por 20€. Entregadas sin perseguir a nadie.
— Tours virtuales por 30€. Que el cliente vea y diga “lo quiero”.
— Fotos pro por 20€. Que no parezcan de inmobiliaria.
— Walkthroughs por 15€. Que vendan sin hablar.

Por cierto, ahora puedes regalar los certificados energéticos.
O mejor aún, cobrarlos al precio que tú quieras.

No hicimos un CRM.
Hicimos excusas para que te digan que sí.
Herramientas que suman antes de firmar.
Ayuda real, antes de que empiece el show.

El CRM está debajo, claro.
Pero no lo notarás.
Como el buen sonido en una peli:
solo sabes que todo suena bien.
          </div>

          {/* Value Proposition */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm mb-10">
            <p className="text-base md:text-lg text-slate-700 dark:text-slate-200 mb-6">
              <strong>CertiFast</strong> te permite generar certificados energéticos oficiales, 
              crear planos profesionales y automatizar tu documentación inmobiliaria.
            </p>
            
            {/* Key Benefits */}
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="flex flex-col items-center">
                <div className="bg-emerald-50 dark:bg-emerald-900/30 p-3 rounded-full mb-3">
                  <Zap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1 text-sm">Generación Rápida</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">Certificados en minutos, no días</p>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-full mb-3">
                  <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1 text-sm">Totalmente Oficial</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">Válidos en toda España</p>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="bg-violet-50 dark:bg-violet-900/30 p-3 rounded-full mb-3">
                  <Users className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1 text-sm">Confianza Probada</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">Miles de agencias confían en nosotros</p>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button 
                size="lg" 
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 text-base font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
              >
                Comenzar Gratis
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            
            <Link href="/auth/login">
              <Button 
                variant="outline" 
                size="lg" 
                className="border border-slate-300 dark:border-slate-600 px-8 py-3 text-base font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200"
              >
                Iniciar Sesión
              </Button>
            </Link>
          </div>

          {/* Social Proof */}
          <div className="mt-12 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
              Utilizado por agencias inmobiliarias en toda España
            </p>
            <div className="flex justify-center items-center space-x-6 opacity-50">
              <div className="text-sm font-medium text-slate-400">Barcelona</div>
              <div className="text-sm font-medium text-slate-400">Madrid</div>
              <div className="text-sm font-medium text-slate-400">Valencia</div>
              <div className="text-sm font-medium text-slate-400">Sevilla</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}