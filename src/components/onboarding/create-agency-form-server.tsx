import { getLocale } from 'next-intl/server';
import { CreateAgencyForm } from './create-agency-form';

interface CreateAgencyFormServerProps {
  userId: string;
  userEmail: string;
}

export async function CreateAgencyFormServer({ userId, userEmail }: CreateAgencyFormServerProps) {
  const locale = await getLocale();

  return (
    <CreateAgencyForm 
      userId={userId}
      userEmail={userEmail}
      locale={locale}
    />
  );
}