/** The Keycloak client the app logs in with (authorization code + PKCE, ADR 0006). */
export interface AuthConfig {
  /** Keycloak's base URL, without /realms/…. */
  url: string;
  realm: string;
  clientId: string;
}

export interface RuntimeConfig {
  apiBaseUrl: string;
  /** Without it the app runs without login, e.g. against a mocked API. */
  auth?: AuthConfig;
}

export class RuntimeConfigError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = 'RuntimeConfigError';
  }
}

let resolvedConfig: RuntimeConfig | undefined;

function isValidUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function validate(raw: unknown): RuntimeConfig {
  if (typeof raw !== 'object' || raw === null) {
    throw new RuntimeConfigError('Runtime config is not a JSON object.');
  }

  const apiBaseUrl = (raw as Record<string, unknown>).apiBaseUrl;

  if (typeof apiBaseUrl !== 'string' || apiBaseUrl.trim() === '') {
    throw new RuntimeConfigError('Runtime config is missing a non-empty "apiBaseUrl".');
  }

  if (!isValidUrl(apiBaseUrl)) {
    throw new RuntimeConfigError(`Runtime config "apiBaseUrl" is not a valid URL: ${apiBaseUrl}`);
  }

  const auth = validateAuth((raw as Record<string, unknown>).auth);
  return auth ? { apiBaseUrl, auth } : { apiBaseUrl };
}

function validateAuth(raw: unknown): AuthConfig | undefined {
  if (raw === undefined) {
    return undefined;
  }
  if (typeof raw !== 'object' || raw === null) {
    throw new RuntimeConfigError('Runtime config "auth" is not an object.');
  }
  const { url, realm, clientId } = raw as Record<string, unknown>;
  for (const [key, value] of Object.entries({ url, realm, clientId })) {
    if (typeof value !== 'string' || value.trim() === '') {
      throw new RuntimeConfigError(`Runtime config is missing a non-empty "auth.${key}".`);
    }
  }
  if (!isValidUrl(url as string)) {
    throw new RuntimeConfigError(`Runtime config "auth.url" is not a valid URL: ${String(url)}`);
  }
  return { url: url as string, realm: realm as string, clientId: clientId as string };
}

/**
 * Fetches and validates `/config.json` at app boot. Never falls back to a default URL:
 * every failure mode (network error, non-2xx, malformed JSON, missing/invalid apiBaseUrl)
 * throws a RuntimeConfigError so the caller can render a visible fail-fast error screen.
 */
export async function loadRuntimeConfig(): Promise<RuntimeConfig> {
  let response: Response;
  try {
    response = await fetch('/config.json', { cache: 'no-cache' });
  } catch (cause) {
    throw new RuntimeConfigError('Could not reach /config.json.', { cause });
  }

  if (!response.ok) {
    throw new RuntimeConfigError(`/config.json responded with status ${response.status}.`);
  }

  let raw: unknown;
  try {
    raw = await response.json();
  } catch (cause) {
    throw new RuntimeConfigError('/config.json is not valid JSON.', { cause });
  }

  const config = validate(raw);
  resolvedConfig = config;
  return config;
}

/** Synchronous accessor for the already-resolved config. Throws if boot hasn't resolved yet. */
export function getRuntimeConfig(): RuntimeConfig {
  if (!resolvedConfig) {
    throw new RuntimeConfigError('Runtime config has not been loaded yet. Call loadRuntimeConfig() first.');
  }
  return resolvedConfig;
}
