import { AuthForm } from '@/components/auth/auth-form';
import { registrationOpen } from '@/lib/auth/config';

export const dynamic = 'force-dynamic';

/** Shows account creation once, then sign-in; the database also enforces the owner limit. */
export default async function AuthPage() {
  return <AuthForm canRegister={await registrationOpen()} />;
}
