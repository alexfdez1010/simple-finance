'use client';
import { AuthenticatorEnrollment } from './authenticator-enrollment';
import { RecoveryCodes } from './recovery-codes';
import { useTwoFactorSettings } from './use-two-factor-settings';

/** Exposes optional authenticator enrollment and password-confirmed security maintenance. */
export function SecuritySettings({ enabled }: { enabled: boolean }) {
  const settings = useTwoFactorSettings(enabled);

  /** Clears the password after each request; the submitter determines the explicitly named operation. */
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const password = String(new FormData(form).get('password'));
    const action = (event.nativeEvent as SubmitEvent).submitter?.getAttribute(
      'value',
    );
    if (!settings.enabled) await settings.enable(password);
    else
      await settings.manage(
        password,
        action === 'disable' ? 'disable' : 'regenerate',
      );
    form.reset();
  }
  return (
    <section
      aria-label="Two-factor authentication"
      className="max-w-2xl space-y-6 rounded-2xl bg-card p-5 sm:p-8"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">Authenticator app</h2>
        <span className="rounded-lg bg-surface-secondary px-3 py-1 text-sm">
          {settings.enabled ? 'Enabled' : 'Not enabled'}
        </span>
      </div>
      {settings.error && (
        <p role="alert" className="text-sm text-danger">
          {settings.error}
        </p>
      )}
      {settings.setup ? (
        <AuthenticatorEnrollment
          uri={settings.setup.totpURI}
          busy={settings.busy}
          onVerify={settings.verify}
          onCancel={settings.cancel}
        />
      ) : settings.codes.length ? (
        <RecoveryCodes
          codes={settings.codes}
          onDone={settings.acknowledgeCodes}
        />
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {settings.enabled
              ? 'Your password and an authenticator code are required when signing in.'
              : 'Optionally require a code from your authenticator app when signing in.'}
          </p>
          <form onSubmit={submit} className="space-y-5">
            <label className="grid max-w-sm gap-2 text-sm font-medium">
              Password
              <input
                name="password"
                type="password"
                autoComplete="current-password"
                required
                maxLength={128}
                disabled={settings.busy}
                className="min-h-12 rounded-xl border border-input bg-background px-4 outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </label>
            <div className="flex flex-wrap gap-3">
              {settings.enabled ? (
                <>
                  <button
                    value="regenerate"
                    disabled={settings.busy}
                    className="min-h-12 rounded-xl bg-foreground px-5 text-sm text-background disabled:opacity-50"
                  >
                    Generate recovery codes
                  </button>
                  <button
                    value="disable"
                    disabled={settings.busy}
                    className="min-h-12 rounded-xl bg-surface-secondary px-5 text-sm text-danger disabled:opacity-50"
                  >
                    Disable 2FA
                  </button>
                </>
              ) : (
                <button
                  disabled={settings.busy}
                  className="min-h-12 rounded-xl bg-foreground px-5 text-sm text-background disabled:opacity-50"
                >
                  {settings.busy ? 'Starting setup…' : 'Set up authenticator'}
                </button>
              )}
            </div>
          </form>
        </>
      )}
    </section>
  );
}
