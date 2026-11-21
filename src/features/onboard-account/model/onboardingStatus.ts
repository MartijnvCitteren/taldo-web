import { useEffect, useState } from 'react';
import { accountApi } from '../../../entities/account';

/**
 * - `checking`: asking the API.
 * - `onboarded` / `not-onboarded`: what the API answered.
 * - `unknown`: the API couldn't tell (no login, unreachable); the app doesn't block on that, the
 *   screens show their own errors.
 */
export type OnboardingStatus = 'checking' | 'onboarded' | 'not-onboarded' | 'unknown';

// Asked once per page load; onboarding itself sets it, so the app doesn't ask again after it.
let known: Promise<OnboardingStatus> | undefined;

export function markOnboarded(): void {
  known = Promise.resolve('onboarded');
}

/** Forgets the answer; for tests. */
export function resetOnboardingStatus(): void {
  known = undefined;
}

function fetchStatus(): Promise<OnboardingStatus> {
  known ??= accountApi.isOnboarded().then(
    (isOnboarded): OnboardingStatus => (isOnboarded ? 'onboarded' : 'not-onboarded'),
    (): OnboardingStatus => 'unknown',
  );
  return known;
}

export function useOnboardingStatus(): OnboardingStatus {
  const [status, setStatus] = useState<OnboardingStatus>('checking');
  useEffect(() => {
    let isCurrent = true;
    void fetchStatus().then((answer) => {
      if (isCurrent) {
        setStatus(answer);
      }
    });
    return () => {
      isCurrent = false;
    };
  }, []);
  return status;
}
