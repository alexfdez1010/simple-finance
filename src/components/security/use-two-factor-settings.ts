'use client';
import { useState } from 'react';
import { authClient } from '@/lib/auth/client';

export type AuthenticatorSetup = { totpURI: string; backupCodes: string[] };

/** Keeps enrollment secrets in component memory; every sensitive operation requires server verification. */
export function useTwoFactorSettings(initialEnabled: boolean) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [setup, setSetup] = useState<AuthenticatorSetup | null>(null);
  const [codes, setCodes] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  /** Serializes form actions and exposes recoverable failures without logging credentials or secrets. */
  async function run(message: string, operation: () => Promise<void>) {
    setBusy(true);
    setError('');
    try {
      await operation();
    } catch {
      setError(message);
    } finally {
      setBusy(false);
    }
  }

  /** Creates an unverified authenticator enrollment after checking the account password. */
  function enable(password: string) {
    return run(
      'Could not start setup. Check your password and try again.',
      async () => {
        const { data, error } = await authClient.twoFactor.enable({
          password,
          method: 'totp',
        });
        if (error || !data || !('totpURI' in data))
          throw new Error('Enrollment failed');
        setSetup({ totpURI: data.totpURI, backupCodes: data.backupCodes });
      },
    );
  }

  /** Activates 2FA only after proving possession of the authenticator; then displays recovery codes once. */
  function verify(code: string) {
    return run('Invalid or expired code. Try again.', async () => {
      const result = await authClient.twoFactor.verifyTotp({ code });
      if (result.error) throw new Error('Verification failed');
      setEnabled(true);
      setCodes(setup?.backupCodes || []);
      setSetup(null);
    });
  }

  /** Requires the password to disable 2FA or invalidate and replace all existing recovery codes. */
  function manage(password: string, action: 'disable' | 'regenerate') {
    return run(
      'Could not update security settings. Check your password and try again.',
      async () => {
        if (action === 'disable') {
          const result = await authClient.twoFactor.disable({ password });
          if (result.error) throw new Error('Disable failed');
          setEnabled(false);
          setSetup(null);
          setCodes([]);
        } else {
          const { data, error } =
            await authClient.twoFactor.generateBackupCodes({ password });
          if (error || !data)
            throw new Error('Recovery-code generation failed');
          setCodes(data.backupCodes);
        }
      },
    );
  }

  /** Cancels the local unverified flow; the account stays password-only and can restart enrollment. */
  function cancel() {
    setSetup(null);
    setCodes([]);
    setError('');
  }
  /** Removes recovery codes from the rendered page and component state after the owner saves them. */
  function acknowledgeCodes() {
    setCodes([]);
  }

  return {
    enabled,
    setup,
    codes,
    busy,
    error,
    enable,
    verify,
    manage,
    cancel,
    acknowledgeCodes,
  };
}
