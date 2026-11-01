import { betterAuth, type BetterAuthOptions } from 'better-auth';
import { APIError } from 'better-auth/api';
import { jwt } from 'better-auth/plugins';
import { mcp } from '@better-auth/mcp';
import { getDatabase } from '@/lib/cloudflare/context';

/** Returns the canonical configured origin; request Host headers never choose the OAuth issuer. */
export function authOrigin(): string {
  return process.env.BETTER_AUTH_URL || 'http://localhost:3000';
}

/** Checks the permanent owner claim, including after an account is deleted. */
export async function registrationOpen(): Promise<boolean> {
  return !(await getDatabase()
    .prepare('SELECT id FROM owner_registration LIMIT 1')
    .first());
}

/** Creates Better Auth with password sessions and resource-bound OAuth 2.1 for the single owner. */
export function getAuth(
  database: BetterAuthOptions['database'] = getDatabase(),
  canRegister: () => Promise<boolean> = registrationOpen,
) {
  return betterAuth({
    appName: 'Simple Finance',
    baseURL: authOrigin(),
    secret: process.env.BETTER_AUTH_SECRET,
    database,
    advanced: { ipAddress: { ipAddressHeaders: ['cf-connecting-ip'] } },
    emailAndPassword: { enabled: true, minPasswordLength: 12 },
    session: { expiresIn: 60 * 60 * 24 * 30, updateAge: 60 * 60 * 24 },
    rateLimit: {
      enabled: process.env.NODE_ENV === 'production',
      storage: 'database',
      window: 60,
      max: 60,
    },
    databaseHooks: {
      user: {
        create: {
          before: async () => {
            if (!(await canRegister())) {
              throw new APIError('FORBIDDEN', {
                message: 'Registration is closed',
              });
            }
          },
        },
      },
    },
    disabledPaths: ['/token'],
    plugins: [
      jwt(),
      mcp({
        loginPage: '/auth',
        consentPage: '/consent',
        resource: `${authOrigin()}/api/mcp/mcp`,
        scopes: ['openid', 'profile', 'email', 'offline_access', 'assets:rw'],
        grantTypes: ['authorization_code', 'refresh_token'],
        allowDynamicClientRegistration: true,
        allowUnauthenticatedClientRegistration: true,
        clientRegistrationDefaultApplicationType: 'infer',
      }),
    ],
  });
}
