import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useOnboardingStatus } from '../features/onboard-account';

/**
 * Sends an account that hasn't been onboarded yet to the last sign-up step (`/onboarding`, the
 * job role) before any app screen. That is where a new user lands after Keycloak's sign-up
 * pages, whatever URL the login started from.
 */
export function RequireOnboarding({ children }: { children: ReactNode }) {
  const status = useOnboardingStatus();
  if (status === 'checking') {
    return null;
  }
  if (status === 'not-onboarded') {
    return <Navigate to="/onboarding" replace />;
  }
  return children;
}
