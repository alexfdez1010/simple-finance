import { createHash, randomBytes } from 'node:crypto';
import type { APIRequestContext } from '@playwright/test';

const origin = 'http://localhost:3000';
export const resource = `${origin}/api/mcp/mcp`;

/** Completes real dynamic registration, PKCE and consent using an authenticated local test session. */
export async function oauthTokens(
  request: APIRequestContext,
  scope = 'assets:rw offline_access',
  onConsent?: (url: string) => Promise<string>,
  onLogin?: (url: string) => Promise<string>,
) {
  const clientResponse = await request.post(
    `${origin}/api/auth/oauth2/register`,
    {
      headers: { origin },
      data: {
        client_name: 'E2E Assistant',
        redirect_uris: ['http://127.0.0.1:34567/callback'],
        token_endpoint_auth_method: 'none',
        grant_types: ['authorization_code', 'refresh_token'],
        response_types: ['code'],
      },
    },
  );
  if (!clientResponse.ok())
    throw new Error(`Client registration: ${await clientResponse.text()}`);
  const client = await clientResponse.json();
  const verifier = randomBytes(32).toString('base64url');
  const query = new URLSearchParams({
    client_id: client.client_id,
    redirect_uri: 'http://127.0.0.1:34567/callback',
    response_type: 'code',
    scope,
    state: 'test-state',
    resource,
    code_challenge: createHash('sha256').update(verifier).digest('base64url'),
    code_challenge_method: 'S256',
  });
  const authorization = await request.get(
    `${origin}/api/auth/oauth2/authorize?${query}`,
    { maxRedirects: 0 },
  );
  let callback = authorization.headers().location;
  if (!callback)
    throw new Error(
      `Authorization: ${authorization.status()} ${await authorization.text()}`,
    );
  if (onLogin && new URL(callback, origin).pathname === '/auth') {
    callback = await onLogin(new URL(callback, origin).toString());
  }
  if (onConsent && new URL(callback, origin).pathname === '/consent') {
    callback = await onConsent(new URL(callback, origin).toString());
  } else if (new URL(callback, origin).pathname === '/consent') {
    const consent = await request.post(`${origin}/api/auth/oauth2/consent`, {
      data: {
        accept: true,
        oauth_query: new URL(callback, origin).searchParams.toString(),
      },
      headers: { origin },
    });
    const result = await consent.json();
    if (!consent.ok()) throw new Error(`Consent: ${JSON.stringify(result)}`);
    callback = result.url;
  }
  const code = new URL(callback).searchParams.get('code');
  if (!code) throw new Error(`No authorization code: ${callback}`);
  const tokenResponse = await request.post(`${origin}/api/auth/oauth2/token`, {
    headers: { origin },
    form: {
      grant_type: 'authorization_code',
      client_id: client.client_id,
      code,
      code_verifier: verifier,
      redirect_uri: 'http://127.0.0.1:34567/callback',
      resource,
    },
  });
  const tokens = await tokenResponse.json();
  if (!tokenResponse.ok())
    throw new Error(`Token exchange: ${JSON.stringify(tokens)}`);
  return { ...tokens, clientId: client.client_id, code, verifier };
}
