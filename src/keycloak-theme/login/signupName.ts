/**
 * Carries the name typed on the register page to the later sign-up steps, so the ID badge keeps
 * it. Keycloak doesn't give those pages the name: login-update-password.ftl only knows the
 * address (auth.attemptedUsername).
 *
 * Kept in localStorage, not sessionStorage: the verification link in the mail usually opens a new
 * tab. Stored per address, so a different account on the same browser never shows this name,
 * and for a day only, about as long as a sign-up takes. Opened in another browser, the badge
 * just shows its placeholder. Keycloak stays the source of the name; this is display only.
 */
const STORAGE_KEY = 'taldo.signup-name';
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

interface StoredName {
  email: string;
  name: string;
  savedAt: number;
}

export function rememberSignupName(email: string, name: string): void {
  const entry: StoredName = { email: normalise(email), name: name.trim(), savedAt: Date.now() };
  if (entry.email === '' || entry.name === '') {
    return;
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entry));
  } catch {
    // Storage blocked (private mode, policy): the badge falls back to its placeholder.
  }
}

/** The name remembered for this address, if it was typed on this browser in the last day. */
export function recallSignupName(email: string | undefined): string | undefined {
  if (!email) {
    return undefined;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return undefined;
    }
    const entry = JSON.parse(raw) as Partial<StoredName>;
    const isFresh = typeof entry.savedAt === 'number' && Date.now() - entry.savedAt < MAX_AGE_MS;
    if (!isFresh) {
      localStorage.removeItem(STORAGE_KEY);
      return undefined;
    }
    return entry.email === normalise(email) && typeof entry.name === 'string' ? entry.name : undefined;
  } catch {
    return undefined;
  }
}

function normalise(email: string): string {
  return email.trim().toLowerCase();
}
