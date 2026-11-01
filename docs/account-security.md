# Account security

Two-factor authentication is optional for the single owner. Open **Account security** from the shield icon in the header on mobile or the sidebar on desktop, or visit `/dashboard/security`.

## Enable an authenticator

Enter your password and select **Set up authenticator**. Scan the QR code with an authenticator app, or expand **Enter setup key manually**. The QR is rendered locally in your browser; its secret is never sent to a QR service.

Enter the six-digit code and select **Activate 2FA**. Protection remains off until Better Auth verifies that code. Cancelling an unfinished setup leaves password sign-in available.

Save the ten recovery codes after activation. Each code works once if you cannot use the authenticator. Download them to your password manager or another private location, then select **I saved these codes** to clear them from the page. They are not stored in browser local storage.

## Sign in and recover access

An account with 2FA enabled must provide its password and an authenticator code. The password alone does not create an authenticated session. Select **Use a recovery code** if the authenticator is unavailable. Used recovery codes cannot be reused.

The challenge preserves the original destination and signed OAuth authorization request. An assistant authorization that requires signing in must complete the second factor before reaching consent. Existing OAuth grants keep their normal token and refresh lifetimes.

Browser session cookies last 30 days, with the configured session refresh threshold at 24 hours. Enabling 2FA does not ask for a code on every page visit while that session is valid. No trusted-device exemption is created by the app.

## Maintain protection

When 2FA is enabled, enter your password to generate replacement recovery codes or select **Disable 2FA**. Generating a new set invalidates the previous codes. Disabling returns the account to password sign-in. These actions require the account password as well as an authenticated session.

Financial imports and exports do not include users, authenticator secrets or recovery codes. Restoring an empty portfolio does not remove account protection or reopen registration.

## Implementation and verification

`twoFactor()` is composed before the OAuth provider in the server configuration, and `twoFactorClient()` provides the browser API. `useTwoFactorSettings(initialEnabled)` owns enrollment and password-confirmed maintenance state. `AuthenticatorEnrollment` renders the local QR and verification form; `RecoveryCodes` displays newly generated codes; `SecuritySettings` composes the protected page. `TwoFactorChallenge` verifies a pending sign-in using TOTP or a recovery code, then resumes the requested page or OAuth flow.

The additive `0004_two_factor.sql` migration defaults existing users to protection disabled and adds the encrypted authenticator storage. The production Better Auth secret must remain stable: it protects sessions and stored key material. Back up secrets through the hosting account's approved private process; never commit them to Git.

Unit tests use the real Better Auth handler and an independent HMAC-SHA-1 TOTP calculation. They cover pending enrollment, wrong codes and passwords, absence of a session before the second factor, recovery-code consumption, disabling and the 30-day cookie. The browser flow in `tests/e2e/two-factor.spec.ts` covers setup, narrow layout, download and regeneration, web login, recovery-code reuse, OAuth login through 2FA and disabling. Run `bun run test:unit` and `bun run test:e2e`; browser fixtures use only Wrangler's local D1 explorer API.

Reference: [Better Auth two-factor authentication](https://better-auth.com/docs/plugins/2fa).
