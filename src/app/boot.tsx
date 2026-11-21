import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { startSession } from '../shared/auth';
import { loadRuntimeConfig, RuntimeConfigError } from '../shared/config';
import { App } from './App';
import './styles/tokens.css';

function renderBootFailure(container: Element, reason: string, detail: string) {
  const root = createRoot(container);
  root.render(
    <div role="alert">
      <h1>Taldo kan niet worden gestart.</h1>
      <p>{reason}</p>
      <p>{detail}</p>
    </div>,
  );
}

/**
 * Boot sequence: resolves runtime config, then logs in when the config names a Keycloak client,
 * before rendering anything that depends on them.
 * On failure, renders a minimal fail-fast error screen directly (not the full app shell)
 * with the error detail visible — never a silent fallback URL.
 */
export async function bootApp(container: Element): Promise<void> {
  let config;
  try {
    config = await loadRuntimeConfig();
  } catch (error) {
    const detail =
      error instanceof RuntimeConfigError ? error.message : 'Onbekende fout tijdens het laden van de configuratie.';
    renderBootFailure(container, 'De applicatieconfiguratie kon niet worden geladen.', detail);
    return;
  }

  if (config.auth) {
    try {
      // Without a session this leaves for Keycloak's login page and doesn't come back here.
      await startSession(config.auth);
    } catch (error) {
      const detail = error instanceof Error ? error.message : 'De inlogserver is niet bereikbaar.';
      renderBootFailure(container, 'Inloggen lukt nu niet. Probeer het zo nog een keer.', detail);
      return;
    }
  }

  const root = createRoot(container);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
