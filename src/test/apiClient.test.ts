import { describe, expect, it, beforeEach } from 'vitest';
import { getAccessToken, setAccessToken, getRefreshToken, setRefreshToken } from '../lib/apiClient';

describe('API Client & Token Management', () => {
  beforeEach(() => {
    localStorage.clear();
    setAccessToken(null);
    setRefreshToken(null);
  });

  it('stores and retrieves access token correctly', () => {
    setAccessToken('test-access-token-xyz');
    expect(getAccessToken()).toBe('test-access-token-xyz');
  });

  it('stores and retrieves refresh token correctly', () => {
    setRefreshToken('test-refresh-token-123');
    expect(getRefreshToken()).toBe('test-refresh-token-123');
  });

  it('clears tokens properly on logout', () => {
    setAccessToken('token1');
    setRefreshToken('token2');
    setAccessToken(null);
    setRefreshToken(null);

    expect(getAccessToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
  });
});
