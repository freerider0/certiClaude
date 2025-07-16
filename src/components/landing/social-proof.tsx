'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Quote, Users, Shield, Clock } from 'lucide-react';

export function SocialProof() {
  const testimonials = [
    {
      quote: "CertiFast nos ha ayudado a agilizar significativamente nuestros procesos de certificación energética. La plataforma es intuitiva y confiable.",
      author: "Carlos Martínez",
      role: "Director Comercial",
      company: "Inmobiliaria Premier Madrid",
      rating: 5
    },
    {
      quote: "La rapidez y oficialidad de los certificados nos da tranquilidad. Nuestros clientes aprecian la eficiencia en los trámites.",
      author: "Ana García",
      role: "Fundadora",
      company: "García Propiedades Barcelona",
      rating: 5
    },
    {
      quote: "Una solución profesional que nos permite optimizar tiempos y ofrecer un mejor servicio a nuestros clientes.",
      author: "Miguel Rodríguez",
      role: "Agente Inmobiliario Senior",
      company: "PropTech Valencia",
      rating: 5
    }
  ];

  const stats = [
    {
      number: "500+",
      label: "Agencias Inmobiliarias",
      subtitle: "confían en CertiFast",
      icon: Users
    },
    {
      number: "10,000+",
      label: "Certificados Generados",
      subtitle: "este año",
      icon: Shield
    },
    {
      number: "< 30 min",
      label: "Tiempo Promedio",
      subtitle: "de generación",
      icon: Clock
    }
  ];

  return (
    <section className="py-20 bg-slate-50 dark:bg-slate-800">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4 px-4 py-2 bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800">
              <Star className="w-4 h-4 mr-2" />
              Testimonios
            </Badge>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              Agencias que Confían en CertiFast
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Experiencias reales de agencias inmobiliarias que han optimizado sus procesos.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="text-center p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                  <CardContent className="p-0">
                    <div className="bg-emerald-50 dark:bg-emerald-900/30 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                      {stat.number}
                    </div>
                    <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      {stat.label}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {stat.subtitle}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Testimonials Grid */}
          <div className="grid lg:grid-cols-3 gap-6 mb-12">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                <CardContent className="p-6">
                  {/* Stars */}
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>

                  {/* Quote */}
                  <div className="relative mb-4">
                    <Quote className="absolute -top-1 -left-1 w-6 h-6 text-slate-200 dark:text-slate-700" />
                    <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed pl-4">
                      {testimonial.quote}
                    </p>
                  </div>

                  {/* Author */}
                  <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                    <div className="font-medium text-slate-900 dark:text-slate-100 text-sm">
                      {testimonial.author}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">
                      {testimonial.role}
                    </div>
                    <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      {testimonial.company}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Trust Indicators */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Garantías de Calidad
              </h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                Compromiso con la excelencia y cumplimiento normativo.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-emerald-50 dark:bg-emerald-900/30 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-1 text-sm">
                  Certificados Oficiales
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Válidos ante cualquier administración
                </p>
              </div>

              <div className="text-center">
                <div className="bg-blue-50 dark:bg-blue-900/30 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-1 text-sm">
                  Soporte Técnico
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Equipo especializado disponible
                </p>
              </div>

              <div className="text-center">
                <div className="bg-violet-50 dark:bg-violet-900/30 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                </div>
                <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-1 text-sm">
                  Entrega Rápida
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Procesamiento eficiente garantizado
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}