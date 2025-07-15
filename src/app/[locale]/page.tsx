import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from '@/i18n/navigation';
import { ArrowRight, FileText, Home, Zap } from 'lucide-react';

export default function HomePage() {
  const t = useTranslations('home');

  const features = [
    {
      icon: FileText,
      title: 'Certificados CEE',
      description: 'Genera certificados energéticos oficiales de forma rápida y precisa.',
    },
    {
      icon: Home,
      title: 'Planos Profesionales',
      description: 'Crea planos detallados con nuestra herramienta de dibujo avanzada.',
    },
    {
      icon: Zap,
      title: 'Proceso Automatizado',
      description: 'Ahorra tiempo con nuestro flujo de trabajo optimizado.',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">{t('title')}</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/auth/signup">
                Empezar Gratis <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/auth/login">
                Iniciar Sesión
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Todo lo que necesitas para tu agencia
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index}>
                  <CardHeader>
                    <Icon className="h-10 w-10 mb-4 text-primary" />
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">
            Únete a cientos de agencias inmobiliarias
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Simplifica tu proceso de certificación energética y creación de planos.
          </p>
          <Button asChild size="lg">
            <Link href="/auth/signup">
              Crear Cuenta Gratis
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
