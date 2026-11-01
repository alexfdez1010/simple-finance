import { TwoFactorChallenge } from '@/components/auth/two-factor-challenge';

/** Public challenge shell; Better Auth requires its signed, short-lived pending-login cookie. */
export default function TwoFactorPage() {
  return <TwoFactorChallenge />;
}
