'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export function ProblemSolution() {
  return (
    <section className="py-16 bg-white dark:bg-slate-900">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4 px-4 py-2 text-slate-600 border-slate-200 dark:text-slate-400 dark:border-slate-700">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Situación Actual
            </Badge>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              El Desafío de los Certificados Energéticos
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Los procesos tradicionales pueden generar retrasos en tus operaciones inmobiliarias.
            </p>
          </div>

          {/* Problem vs Solution Grid */}
          <div className="grid lg:grid-cols-2 gap-8 mb-16">
            {/* The Problem */}
            <Card className="border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Clock className="w-6 h-6 text-slate-600 dark:text-slate-400 mr-3" />
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Proceso Tradicional</h3>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-slate-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <div>
                      <p className="font-medium text-slate-700 dark:text-slate-300">Múltiples días de espera</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Los certificados tradicionales requieren tiempo</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-slate-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <div>
                      <p className="font-medium text-slate-700 dark:text-slate-300">Costos variables</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Desplazamientos y servicios externos</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-slate-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <div>
                      <p className="font-medium text-slate-700 dark:text-slate-300">Proceso manual</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Dependencia de terceros y coordinación</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* The Solution */}
            <Card className="border-emerald-200 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/20">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mr-3" />
                  <h3 className="text-lg font-semibold text-emerald-800 dark:text-emerald-200">Con CertiFast</h3>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-1 mr-3 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-emerald-700 dark:text-emerald-300">Certificados en minutos</p>
                      <p className="text-sm text-emerald-600 dark:text-emerald-400">Proceso automatizado y eficiente</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-1 mr-3 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-emerald-700 dark:text-emerald-300">Precios transparentes</p>
                      <p className="text-sm text-emerald-600 dark:text-emerald-400">Sin costos adicionales ni sorpresas</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-1 mr-3 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-emerald-700 dark:text-emerald-300">Totalmente digital</p>
                      <p className="text-sm text-emerald-600 dark:text-emerald-400">Gestión completa desde la plataforma</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                  <p className="text-emerald-800 dark:text-emerald-300 font-medium text-center text-sm">
                    "La plataforma nos ha ayudado a agilizar nuestros procesos significativamente."
                  </p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 text-center mt-1">
                    - Inmobiliaria Barcelona
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bottom CTA */}
          <div className="text-center bg-slate-50 dark:bg-slate-800 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">
              ¿Listo para Optimizar tus Procesos?
            </h3>
            <p className="text-base text-slate-600 dark:text-slate-300 mb-4">
              Únete a las agencias inmobiliarias que han digitalizado sus certificaciones energéticas.
            </p>
            <Link href="/auth/signup">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                Comenzar Ahora
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}