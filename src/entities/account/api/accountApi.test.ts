import { beforeEach, describe, expect, it, vi } from 'vitest';
import { httpClient } from '../../../shared/api';
import { accountApi } from './accountApi';

vi.mock('../../../shared/api', () => ({ httpClient: { post: vi.fn(), patch: vi.fn() } }));

beforeEach(() => {
  vi.mocked(httpClient.patch).mockReset();
});

describe('accountApi.isOnboarded', () => {
  it('asks with a PATCH /me without names, which changes nothing', async () => {
    vi.mocked(httpClient.patch).mockResolvedValue(undefined);

    await expect(accountApi.isOnboarded()).resolves.toBe(true);
    expect(httpClient.patch).toHaveBeenCalledWith('/me', {});
  });

  it('is false when the API has no Taldo user for the account yet (404)', async () => {
    vi.mocked(httpClient.patch).mockRejectedValue({ status: 404, title: 'Not onboarded' });

    await expect(accountApi.isOnboarded()).resolves.toBe(false);
  });

  it('passes on any other failure', async () => {
    vi.mocked(httpClient.patch).mockRejectedValue({ status: 401, title: 'Unauthorized' });

    await expect(accountApi.isOnboarded()).rejects.toMatchObject({ status: 401 });
  });
});
