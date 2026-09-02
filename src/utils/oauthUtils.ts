/**
 * OAuth2 & Spring Security URL Utilities
 * 
 * In standard Spring Security OAuth2 configurations:
 * - The authorization endpoint is hosted at the server root:
 *   GET {backendServerRoot}/oauth2/authorization/{registrationId} (e.g. http://localhost:8080/oauth2/authorization/google)
 * - The OAuth2 callback endpoint is hosted at:
 *   GET {backendServerRoot}/login/oauth2/code/{registrationId} (e.g. http://localhost:8080/login/oauth2/code/google)
 *
 * This utility safely strips any API sub-path (such as /api/v1 or /api) from the base URL
 * to ensure that the authorization URL is never malformed into http://localhost:8080/api/v1oauth2/authorization/google.
 */

/**
 * Returns the sanitized backend server root origin without /api/v1, /api, or trailing slashes.
 */
export function getBackendServerRoot(baseUrl?: string): string {
  const urlToUse = baseUrl || (typeof window !== 'undefined' ? (window as any).__BOOKINGSUITE_API_URL__ : '') || 'http://localhost:8080';
  
  const trimmed = urlToUse.trim();
  if (!trimmed) {
    return 'http://localhost:8080';
  }

  try {
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      const parsed = new URL(trimmed);
      return parsed.origin;
    }
  } catch {
    // Fall back to regex cleaning
  }

  // Strip trailing slashes and /api/v1 or /api
  return trimmed
    .replace(/\/api(\/v\d+)?\/?$/i, '')
    .replace(/\/+$/, '');
}

/**
 * Derives the exact Google OAuth2 authorization endpoint URL.
 * Defaults to: http://localhost:8080/api/v1/oauth2/authorization/google
 */
export function getGoogleOAuthAuthorizationUrl(baseUrl?: string): string {
  const serverRoot = getBackendServerRoot(baseUrl);
  return `${serverRoot}/api/v1/oauth2/authorization/google`;
}

/**
 * Derives the exact Google OAuth2 callback endpoint URL.
 * Defaults to: http://localhost:8080/login/oauth2/code/google
 */
export function getGoogleOAuthCallbackUrl(baseUrl?: string): string {
  const serverRoot = getBackendServerRoot(baseUrl);
  return `${serverRoot}/api/v1/login/oauth2/code/google`;
}
