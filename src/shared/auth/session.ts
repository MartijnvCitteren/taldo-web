import Keycloak from 'keycloak-js';
import type { AuthConfig } from '../config';

/** The logged-in user as the ID token describes them; for display only. */
export interface SessionUser {
  firstName?: string;
  lastName?: string;
  email?: string;
}

/** Refresh the access token when it has less than this many seconds left. */
const MIN_TOKEN_VALIDITY_S = 30;

let keycloak: Keycloak | undefined;

/**
 * Logs in with Keycloak (authorization code + PKCE, client `taldo-web`, ADR 0006). Without a
 * session this sends the browser to Keycloak's login page, where new users find the sign-up
 * too; the promise then never settles. Tokens stay in memory only: a reload logs in again
 * through Keycloak's SSO cookie, without asking anything.
 */
export async function startSession(config: AuthConfig): Promise<void> {
  const client = new Keycloak({ url: config.url, realm: config.realm, clientId: config.clientId });
  await client.init({
    onLoad: 'login-required',
    pkceMethod: 'S256',
    // The login-status iframe needs third-party cookies, which browsers block more and more.
    checkLoginIframe: false,
  });
  keycloak = client;
}

/** A valid access token for the API, or null when the app runs without login. */
export async function getAccessToken(): Promise<string | null> {
  if (!keycloak?.authenticated) {
    return null;
  }
  try {
    await keycloak.updateToken(MIN_TOKEN_VALIDITY_S);
  } catch {
    // The Keycloak session ended (logout elsewhere, idle timeout): log in again.
    await keycloak.login();
    return null;
  }
  return keycloak.token ?? null;
}

export function getSessionUser(): SessionUser | undefined {
  const claims = keycloak?.idTokenParsed as
    | { given_name?: string; family_name?: string; email?: string }
    | undefined;
  if (!claims) {
    return undefined;
  }
  return { firstName: claims.given_name, lastName: claims.family_name, email: claims.email };
}
