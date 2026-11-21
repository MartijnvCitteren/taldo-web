import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { accountApi } from '../entities/account';
import { markOnboarded, resetOnboardingStatus } from '../features/onboard-account';
import { RequireOnboarding } from './RequireOnboarding';

vi.mock('../entities/account', async () => {
  const actual = await vi.importActual<typeof import('../entities/account')>('../entities/account');
  return { ...actual, accountApi: { onboard: vi.fn(), isOnboarded: vi.fn() } };
});

beforeEach(() => {
  resetOnboardingStatus();
  vi.mocked(accountApi.isOnboarded).mockReset();
});

function renderApp() {
  render(
    <MemoryRouter initialEntries={['/vacancies/new']}>
      <Routes>
        <Route
          path="/vacancies/new"
          element={
            <RequireOnboarding>
              <p>Nieuwe vacature</p>
            </RequireOnboarding>
          }
        />
        <Route path="/onboarding" element={<p>Wat is je rol?</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('RequireOnboarding', () => {
  it('sends a new account to the role step first', async () => {
    vi.mocked(accountApi.isOnboarded).mockResolvedValue(false);
    renderApp();

    expect(await screen.findByText('Wat is je rol?')).toBeInTheDocument();
    expect(screen.queryByText('Nieuwe vacature')).not.toBeInTheDocument();
  });

  it('lets an onboarded account into the app', async () => {
    vi.mocked(accountApi.isOnboarded).mockResolvedValue(true);
    renderApp();

    expect(await screen.findByText('Nieuwe vacature')).toBeInTheDocument();
  });

  it("doesn't block the app when the API can't tell", async () => {
    vi.mocked(accountApi.isOnboarded).mockRejectedValue({ status: 0, title: 'Netwerkfout' });
    renderApp();

    expect(await screen.findByText('Nieuwe vacature')).toBeInTheDocument();
  });

  it("doesn't ask again right after onboarding", async () => {
    markOnboarded();
    renderApp();

    expect(await screen.findByText('Nieuwe vacature')).toBeInTheDocument();
    expect(accountApi.isOnboarded).not.toHaveBeenCalled();
  });
});
