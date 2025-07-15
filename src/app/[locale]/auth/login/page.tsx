import { Metadata } from 'next';
import { LoginForm } from '@/components/auth/login-form';

export const metadata: Metadata = {
  title: 'Sign In - CertiFast',
  description: 'Sign in to your CertiFast account',
};

export default function LoginPage() {
  return <LoginForm />;
}