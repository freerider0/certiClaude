'use client';

import { useState } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShineBorder } from '@/components/ui/shine-border';
import { Card, CardContent } from '@/components/ui/card';

const features = [
  { name: 'Certificados energéticos', price: 'GRATIS', highlight: true },
  { name: 'Cédulas de habitabilidad', price: '20€' },
  { name: 'Tours virtuales', price: '30€' },
  { name: 'Fotos profesionales', price: '20€' },
  { name: 'Walkthroughs', price: '15€' },
];

export function VideoShowcase() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const togglePlay = () => {
    const video = document.getElementById('crm-video') as HTMLVideoElement;
    if (video) {
      if (isPlaying) {
        video.pause();
      } else {
        video.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    const video = document.getElementById('crm-video') as HTMLVideoElement;
    if (video) {
      video.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <section className="py-20 bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4 px-4 py-2 border-emerald-200 text-emerald-700 dark:border-emerald-700 dark:text-emerald-400">
              <Play className="w-4 h-4 mr-2" />
              La herramienta que convierte el "tal vez" en "sí"
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              Más que un CRM: Tu Ventaja Competitiva
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              Mientras otros pierden tiempo en gestiones, tú cierras más ventas. 
              Descubre cómo nuestras herramientas transforman tu forma de trabajar.
            </p>
          </div>

          {/* Video with Shine Border */}
          <div className="grid lg:grid-cols-3 gap-8 items-center mb-16">
            <div className="lg:col-span-2">
              <ShineBorder
                className="w-full"
                borderWidth={3}
                borderRadius={16}
                duration={12}
                color={['#10b981', '#6366f1', '#ec4899', '#f59e0b', '#10b981']}
              >
                <div className="relative bg-slate-900 rounded-xl overflow-hidden aspect-video">
                  <video
                    id="crm-video"
                    className="w-full h-full object-cover"
                    poster="/api/placeholder/800/450"
                    muted={isMuted}
                    loop
                    playsInline
                  >
                    <source src="/videos/crm-demo.mp4" type="video/mp4" />
                    Tu navegador no soporta el elemento de video.
                  </video>
                  
                  {/* Video Controls Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          size="icon"
                          variant="secondary"
                          className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-0"
                          onClick={togglePlay}
                        >
                          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                        <Button
                          size="icon"
                          variant="secondary"
                          className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-0"
                          onClick={toggleMute}
                        >
                          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                        </Button>
                      </div>
                      <span className="text-white text-sm font-medium bg-black/40 px-3 py-1 rounded-full">
                        Ver demo completa
                      </span>
                    </div>
                  </div>
                </div>
              </ShineBorder>
            </div>

            {/* Features List */}
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                Todo incluido en tu suscripción:
              </h3>
              {features.map((feature, index) => (
                <Card
                  key={index}
                  className={`border transition-all duration-300 hover:shadow-md ${
                    feature.highlight
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-700'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <span className={`font-medium ${
                      feature.highlight
                        ? 'text-emerald-700 dark:text-emerald-300'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}>
                      {feature.name}
                    </span>
                    <Badge
                      variant={feature.highlight ? 'default' : 'secondary'}
                      className={
                        feature.highlight
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : ''
                      }
                    >
                      {feature.price}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
              
              <div className="mt-6 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    Ahorra hasta 350€ al mes
                  </span>{' '}
                  comparado con servicios tradicionales
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                5 min
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Tiempo medio por certificado
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                24/7
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Disponibilidad plataforma
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                100%
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Digital y automatizado
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                0€
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Costes adicionales
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Button
              size="lg"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Empieza tu prueba gratuita
            </Button>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-3">
              Sin compromiso • Sin tarjeta de crédito • Cancela cuando quieras
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}