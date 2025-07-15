import { Metadata } from 'next';
import { SignupForm } from '@/components/auth/signup-form';

export const metadata: Metadata = {
  title: 'Create Account - CertiFast',
  description: 'Create your CertiFast account and set up your agency',
};

export default function SignupPage() {
  return <SignupForm />;
}