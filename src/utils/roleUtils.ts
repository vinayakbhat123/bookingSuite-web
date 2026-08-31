import { Role, UserResponse } from '../types/api';

/**
 * Normalizes any role string, authority object, or enum into standard Role types.
 * Handles Spring Boot prefixes (e.g. ROLE_HOTEL_MANAGER, ROLE_ADMIN, ROLE_GUEST),
 * casing variations (e.g. hotel_manager, HotelManager), and alternative aliases.
 */
export function normalizeRole(rawRole: any): Role {
  if (!rawRole) return 'GUEST';

  // Handle authority object e.g. { authority: "ROLE_HOTEL_MANAGER" } or { name: "HOTEL_MANAGER" }
  if (typeof rawRole === 'object') {
    rawRole = rawRole.authority || rawRole.name || rawRole.role || rawRole.value || rawRole.roleName || '';
  }

  if (typeof rawRole !== 'string') return 'GUEST';

  const clean = rawRole.trim().toUpperCase().replace(/^ROLE_/, '');

  if (
    clean === 'HOTEL_MANAGER' ||
    clean === 'HOTELMANAGER' ||
    clean === 'HOTEL_MANAGERS' ||
    clean === 'MANAGER' ||
    clean === 'HOTEL_OWNER' ||
    clean === 'HOTEL' ||
    clean.includes('HOTEL_MANAGER')
  ) {
    return 'HOTEL_MANAGER';
  }

  if (
    clean === 'ADMIN' ||
    clean === 'ADMINISTRATOR' ||
    clean === 'SUPERADMIN' ||
    clean === 'SUPER_ADMIN' ||
    clean.includes('ADMIN')
  ) {
    return 'ADMIN';
  }

  if (clean === 'OWNER' || clean === 'PROPERTY_OWNER') {
    return 'OWNER';
  }

  if (clean === 'SUPPORT' || clean === 'SUPPORT_AGENT' || clean === 'AGENT') {
    return 'SUPPORT';
  }

  if (
    clean === 'GUEST' ||
    clean === 'USER' ||
    clean === 'CUSTOMER' ||
    clean === 'TRAVELER' ||
    clean === 'CLIENT'
  ) {
    return 'GUEST';
  }

  if (clean === 'HOTEL_MANAGER' || clean === 'ADMIN' || clean === 'OWNER' || clean === 'SUPPORT' || clean === 'GUEST') {
    return clean as Role;
  }

  return 'GUEST';
}

/**
 * Safely decodes a JWT token payload without external dependencies.
 */
export function decodeJwt(token: string): Record<string, any> | null {
  try {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length < 2) return null;

    let base64Url = parts[1];
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }

    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

/**
 * Collects and normalizes all roles from various possible sources:
 * - UserResponse object (roles, role, authorities, authority)
 * - JWT token claims (roles, role, authorities, scope, scp, realm_access)
 * - Explicitly passed roles or role arrays
 */
export function extractRolesFromSources(...sources: any[]): Role[] {
  const roleSet = new Set<Role>();

  for (const source of sources) {
    if (!source) continue;

    // String role or comma-separated list
    if (typeof source === 'string') {
      if (source.includes(',')) {
        source.split(',').forEach((p) => {
          const norm = normalizeRole(p);
          if (norm) roleSet.add(norm);
        });
      } else {
        const norm = normalizeRole(source);
        if (norm) roleSet.add(norm);
      }
      continue;
    }

    // Array of strings or objects
    if (Array.isArray(source)) {
      for (const item of source) {
        const norm = normalizeRole(item);
        if (norm) roleSet.add(norm);
      }
      continue;
    }

    // Object with potential role keys
    if (typeof source === 'object') {
      if (source.role) {
        const norm = normalizeRole(source.role);
        if (norm) roleSet.add(norm);
      }

      if (Array.isArray(source.roles)) {
        for (const r of source.roles) {
          const norm = normalizeRole(r);
          if (norm) roleSet.add(norm);
        }
      } else if (typeof source.roles === 'string') {
        source.roles.split(',').forEach((r: string) => {
          const norm = normalizeRole(r);
          if (norm) roleSet.add(norm);
        });
      }

      if (Array.isArray(source.authorities)) {
        for (const a of source.authorities) {
          const norm = normalizeRole(a);
          if (norm) roleSet.add(norm);
        }
      } else if (typeof source.authorities === 'string') {
        source.authorities.split(',').forEach((a: string) => {
          const norm = normalizeRole(a);
          if (norm) roleSet.add(norm);
        });
      }

      if (source.authority) {
        const norm = normalizeRole(source.authority);
        if (norm) roleSet.add(norm);
      }

      if (source.scope && typeof source.scope === 'string') {
        source.scope.split(/[\s,]+/).forEach((s: string) => {
          const norm = normalizeRole(s);
          if (norm) roleSet.add(norm);
        });
      }

      if (Array.isArray(source.scp)) {
        source.scp.forEach((s: any) => {
          const norm = normalizeRole(s);
          if (norm) roleSet.add(norm);
        });
      }

      if (source.realm_access?.roles && Array.isArray(source.realm_access.roles)) {
        source.realm_access.roles.forEach((r: any) => {
          const norm = normalizeRole(r);
          if (norm) roleSet.add(norm);
        });
      }
    }
  }

  const result = Array.from(roleSet);
  return result.length > 0 ? result : ['GUEST'];
}

/**
 * Checks if a list of user roles satisfies any of the required roles.
 */
export function checkHasRole(userRoles: Role[], allowedRoles?: Role[]): boolean {
  if (!allowedRoles || allowedRoles.length === 0) return true;

  const normalizedUserRoles = userRoles.map((r) => normalizeRole(r));
  const normalizedAllowedRoles = allowedRoles.map((r) => normalizeRole(r));

  // Check direct inclusion
  const match = normalizedAllowedRoles.some((allowed) => {
    if (allowed === 'HOTEL_MANAGER') {
      return (
        normalizedUserRoles.includes('HOTEL_MANAGER') ||
        normalizedUserRoles.includes('ADMIN') ||
        normalizedUserRoles.includes('OWNER')
      );
    }
    if (allowed === 'ADMIN') {
      return normalizedUserRoles.includes('ADMIN') || normalizedUserRoles.includes('OWNER');
    }
    return normalizedUserRoles.includes(allowed);
  });

  return match;
}

/**
 * Checks if role represents Hotel Manager, Admin, or Owner
 */
export function isHotelManagerRole(roles: Role[]): boolean {
  return roles.some((r) => {
    const norm = normalizeRole(r);
    return norm === 'HOTEL_MANAGER' || norm === 'ADMIN' || norm === 'OWNER';
  });
}
