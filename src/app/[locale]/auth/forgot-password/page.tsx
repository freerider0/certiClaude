import { Metadata } from 'next';
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';

export const metadata: Metadata = {
  title: 'Reset Password - CertiFast',
  description: 'Reset your CertiFast account password',
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}