import { Metadata } from 'next';
import { ResetPasswordForm } from '@/components/auth/reset-password-form';

export const metadata: Metadata = {
  title: 'Reset Password - CertiFast',
  description: 'Set your new CertiFast account password',
};

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}