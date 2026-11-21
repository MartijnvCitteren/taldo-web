import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, waitFor } from '@testing-library/react';

function jsonResponse(status: number, body: unknown) {
  return { ok: status >= 200 && status < 300, status, json: async () => body };
}

describe('bootApp', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it('renders the app (Step 1) given a valid runtime config', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse(200, { apiBaseUrl: 'http://localhost:8080' })),
    );
    const { bootApp } = await import('./boot');

    await act(async () => { await bootApp(container); });

    await waitFor(() => expect(container.textContent).toContain('Basisgegevens'));
  });

  it('renders a visible fail-fast error screen given an invalid runtime config, with no silent fallback', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(404, {})));
    const { bootApp } = await import('./boot');

    await act(async () => { await bootApp(container); });

    await waitFor(() => expect(container.querySelector('[role="alert"]')).toBeTruthy());
    expect(container.textContent).not.toContain('Basisgegevens');
  });

  it('logs in before rendering when the config names a Keycloak client', async () => {
    const auth = { url: 'http://localhost:8080', realm: 'taldo', clientId: 'taldo-web' };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(200, { apiBaseUrl: 'http://localhost:8090', auth })));
    const startSession = vi.fn().mockResolvedValue(undefined);
    vi.doMock('../shared/auth', () => ({ startSession, getAccessToken: async () => null }));
    const { bootApp } = await import('./boot');

    await act(async () => { await bootApp(container); });

    expect(startSession).toHaveBeenCalledWith(auth);
    await waitFor(() => expect(container.textContent).toContain('Basisgegevens'));
    vi.doUnmock('../shared/auth');
  });

  it('says so when logging in fails, instead of rendering the app', async () => {
    const auth = { url: 'http://localhost:8080', realm: 'taldo', clientId: 'taldo-web' };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(200, { apiBaseUrl: 'http://localhost:8090', auth })));
    vi.doMock('../shared/auth', () => ({
      startSession: vi.fn().mockRejectedValue(new Error('Keycloak is niet bereikbaar')),
      getAccessToken: async () => null,
    }));
    const { bootApp } = await import('./boot');

    await act(async () => { await bootApp(container); });

    await waitFor(() => expect(container.querySelector('[role="alert"]')).toHaveTextContent('Inloggen lukt nu niet'));
    expect(container.textContent).not.toContain('Basisgegevens');
    vi.doUnmock('../shared/auth');
  });
});
