import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getAuth } from '@/lib/auth/config';
import { PageHeading } from '@/components/workspace/page-heading';
import { SecuritySettings } from '@/components/security/security-settings';

/** Reads only the authenticated owner's 2FA status; enrollment secrets never enter server-rendered props. */
export default async function SecurityPage() {
  const session = await getAuth().api.getSession({ headers: await headers() });
  if (!session) redirect('/auth?redirectTo=%2Fdashboard%2Fsecurity');
  return (
    <div className="space-y-8">
      <PageHeading title="Account security" description="" />
      <SecuritySettings enabled={Boolean(session.user.twoFactorEnabled)} />
    </div>
  );
}
