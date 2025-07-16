import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

export default async function AuthCodeErrorPage() {
  const t = await getTranslations('Auth');

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">
          {t('authError')}
        </h1>
        <p className="text-gray-600 mb-6">
          {t('authErrorDescription')}
        </p>
        <Link 
          href="/auth/login" 
          className="text-blue-600 hover:underline"
        >
          {t('backToLogin')}
        </Link>
      </div>
    </div>
  );
}