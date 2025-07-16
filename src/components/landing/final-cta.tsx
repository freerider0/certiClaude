'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, Shield, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export function FinalCTA() {
  return (
    <section className="py-16 bg-gradient-to-br from-emerald-600 to-emerald-700 dark:from-emerald-700 dark:to-emerald-800 text-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          {/* Main Headline */}
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Comienza a Optimizar tus Procesos Hoy
          </h2>

          {/* Value Proposition */}
          <div className="mb-8">
            <p className="text-lg md:text-xl mb-6 leading-relaxed text-emerald-50">
              Únete a cientos de agencias inmobiliarias que han digitalizado sus procesos
              de certificación energética con CertiFast.
            </p>

            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-3 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-emerald-300" />
                  Funcionalidades Incluidas
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-emerald-300 flex-shrink-0" />
                    Generación de certificados CEE
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-emerald-300 flex-shrink-0" />
                    Creación de planos profesionales
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-emerald-300 flex-shrink-0" />
                    Soporte técnico incluido
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-emerald-300 flex-shrink-0" />
                    Documentación completa
                  </li>
                </ul>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-3 flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-emerald-300" />
                  Garantías
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-emerald-300 flex-shrink-0" />
                    Certificados 100% oficiales
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-emerald-300 flex-shrink-0" />
                    Válidos en toda España
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-emerald-300 flex-shrink-0" />
                    Conformidad legal garantizada
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-4 mb-8">
            <Link href="/auth/signup">
              <Button 
                size="lg" 
                className="bg-white hover:bg-gray-100 text-emerald-700 px-8 py-3 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 w-full md:w-auto"
              >
                Comenzar Gratis
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            
            <p className="text-emerald-100 text-sm">
              Sin compromisos • Configuración en minutos
            </p>
          </div>

          {/* Social Proof Footer */}
          <div className="text-center">
            <p className="text-sm text-emerald-100 mb-2">
              Únete a las agencias inmobiliarias que han digitalizado sus procesos
            </p>
            <div className="flex justify-center items-center space-x-4 text-emerald-200">
              <span>⭐⭐⭐⭐⭐</span>
              <span className="text-sm">Altamente valorado</span>
              <span className="text-sm">•</span>
              <span className="text-sm">Miles de certificados generados</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}