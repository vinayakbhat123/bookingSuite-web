import { describe, expect, it } from 'vitest';
import { checkHasRole, extractRolesFromSources, isHotelManagerRole, normalizeRole } from '../utils/roleUtils';

describe('Role Utilities & Authorization', () => {
  it('normalizes various casing and prefix formats to standard Role', () => {
    expect(normalizeRole('ROLE_HOTEL_MANAGER')).toBe('HOTEL_MANAGER');
    expect(normalizeRole('hotel_manager')).toBe('HOTEL_MANAGER');
    expect(normalizeRole('ROLE_ADMIN')).toBe('ADMIN');
    expect(normalizeRole('admin')).toBe('ADMIN');
    expect(normalizeRole('ROLE_GUEST')).toBe('GUEST');
    expect(normalizeRole('guest')).toBe('GUEST');
    expect(normalizeRole('OWNER')).toBe('OWNER');
    expect(normalizeRole(null)).toBe('GUEST');
    expect(normalizeRole(undefined)).toBe('GUEST');
  });

  it('correctly identifies HOTEL_MANAGER, ADMIN, and OWNER as manager roles', () => {
    expect(isHotelManagerRole(['HOTEL_MANAGER'])).toBe(true);
    expect(isHotelManagerRole(['ADMIN'])).toBe(true);
    expect(isHotelManagerRole(['OWNER'])).toBe(true);
    expect(isHotelManagerRole(['GUEST'])).toBe(false);
  });

  it('enforces checkHasRole strictly against required roles', () => {
    expect(checkHasRole(['GUEST'], ['HOTEL_MANAGER', 'ADMIN'])).toBe(false);
    expect(checkHasRole(['HOTEL_MANAGER'], ['HOTEL_MANAGER', 'ADMIN'])).toBe(true);
    expect(checkHasRole(['ADMIN'], ['HOTEL_MANAGER', 'ADMIN'])).toBe(true);
    expect(checkHasRole(['GUEST'], ['GUEST'])).toBe(true);
  });

  it('extractRolesFromSources extracts authentic roles without privilege escalation', () => {
    const roles = extractRolesFromSources(
      { roles: ['GUEST'] },
      { role: 'GUEST' }
    );
    expect(roles).toEqual(['GUEST']);
    expect(roles).not.toContain('HOTEL_MANAGER');
  });
});
