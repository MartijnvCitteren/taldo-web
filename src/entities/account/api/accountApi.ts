import { httpClient, type ApiError } from '../../../shared/api';
import type { JobRole, OnboardingResponse } from '../model/types';

export const accountApi = {
  /**
   * `POST /onboarding`: gives the logged-in account its Taldo user and company. Names and
   * e-mail come from the verified account; only the job role is sent. Safe to repeat.
   */
  onboard(jobRole: JobRole): Promise<OnboardingResponse> {
    return httpClient.post<OnboardingResponse>('/onboarding', { jobRole });
  },

  /**
   * Whether the logged-in account has been onboarded. The API has no read endpoint for that yet
   * (`GET /me` comes with taldo-api #103), so this sends `PATCH /me` without names: documented to
   * change nothing, `204` once onboarded, `404` before. Other failures are thrown.
   *
   * TODO(taldo-api #103): switch to `GET /me` or a token claim once the API has one.
   */
  async isOnboarded(): Promise<boolean> {
    try {
      await httpClient.patch<void>('/me', {});
      return true;
    } catch (caught) {
      if ((caught as ApiError).status === 404) {
        return false;
      }
      throw caught;
    }
  },
};
