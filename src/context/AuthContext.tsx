import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getAccessToken, getRefreshToken, setAccessToken, setRefreshToken } from '../lib/apiClient';
import { authService } from '../services/authService';
import { userService } from '../services/userService';
import { LoginRequest, Role, SignupRequest, UserProfileRequest, UserResponse } from '../types/api';
import { decodeJwt, extractRolesFromSources, isHotelManagerRole, normalizeRole } from '../utils/roleUtils';
import { useToast } from './ToastContext';

interface AuthContextValue {
  user: UserResponse | null;
  roles: Role[];
  activeRole: Role;
  isAuthenticated: boolean;
  isLoading: boolean;
  isGuest: boolean;
  isHotelManager: boolean;
  isAdmin: boolean;
  isOwner: boolean;
  login: (data: LoginRequest) => Promise<UserResponse>;
  loginWithRefreshToken: (token?: string) => Promise<UserResponse>;
  signup: (data: SignupRequest) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: UserProfileRequest) => Promise<UserResponse>;
  refreshUser: () => Promise<void>;
  handleOAuthSuccess: (token: string, refreshToken?: string) => Promise<UserResponse>;
  switchSimulatedRole: (role: Role) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [roles, setRoles] = useState<Role[]>(() => {
    const savedRole = localStorage.getItem('bookingsuite_active_role');
    return savedRole ? [normalizeRole(savedRole)] : [];
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { error: toastError, success: toastSuccess, info: toastInfo } = useToast();

  const resolveRoles = (userObj: UserResponse | null, token?: string | null, explicitRoles?: any): Role[] => {
    const jwtClaims = token ? decodeJwt(token) : null;
    const storedRole = localStorage.getItem('bookingsuite_active_role');

    const extracted = extractRolesFromSources(
      explicitRoles,
      userObj?.roles,
      userObj?.role,
      (userObj as any)?.authorities,
      (userObj as any)?.authority,
      jwtClaims,
      storedRole ? [storedRole] : undefined
    );

    return extracted;
  };

  const refreshUser = useCallback(async () => {
    const storedRefreshToken = getRefreshToken();

    // Call POST /auth/refresh using refreshToken to fetch new accessToken every time on login/startup
    if (storedRefreshToken) {
      try {
        const refreshRes = await authService.refresh(storedRefreshToken);
        if (refreshRes?.AccessToken) {
          setAccessToken(refreshRes.AccessToken);
        }
      } catch (err) {
        console.warn('Session startup refresh token exchange:', err);
      }
    }

    const token = getAccessToken();
    if (!token) {
      setUser(null);
      const savedRole = localStorage.getItem('bookingsuite_active_role');
      setRoles(savedRole ? [normalizeRole(savedRole)] : []);
      setIsLoading(false);
      return;
    }

    const jwtClaims = decodeJwt(token);

    // Provide initial state from token immediately
    const initialRoles = resolveRoles(null, token);
    setRoles(initialRoles);

    if (jwtClaims) {
      setUser({
        id: jwtClaims.userId || jwtClaims.id || jwtClaims.sub || 1,
        name: jwtClaims.name || jwtClaims.sub?.split('@')[0] || 'User',
        email: jwtClaims.email || (jwtClaims.sub?.includes('@') ? jwtClaims.sub : 'user@bookingsuite.com'),
        roles: initialRoles,
        role: initialRoles[0] || 'HOTEL_MANAGER',
      });
    }

    try {
      const profile = await userService.getMe();
      const resolvedRoles = resolveRoles(profile, token);
      const updatedUser: UserResponse = {
        ...profile,
        roles: resolvedRoles,
        role: resolvedRoles[0] || 'HOTEL_MANAGER',
      };
      setUser(updatedUser);
      setRoles(resolvedRoles);
    } catch {
      // If unable to fetch /users/me, maintain user from token claims or fallback
      if (getAccessToken()) {
        const fallbackRoles = resolveRoles(null, token);
        setUser((prev) =>
          prev || {
            id: 1,
            name: jwtClaims?.name || 'Hotel Manager',
            email: jwtClaims?.email || 'manager@bookingsuite.com',
            roles: fallbackRoles,
            role: fallbackRoles[0] || 'HOTEL_MANAGER',
          }
        );
        setRoles(fallbackRoles);
      } else {
        setUser(null);
        setRoles([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();

    const handleSessionExpired = () => {
      setUser(null);
      setRoles([]);
      localStorage.removeItem('bookingsuite_active_role');
      toastError('Session Expired', 'Please sign in again to continue.');
    };

    window.addEventListener('bookingsuite:session-expired', handleSessionExpired);
    return () => {
      window.removeEventListener('bookingsuite:session-expired', handleSessionExpired);
    };
  }, [refreshUser, toastError]);

  const login = async (data: LoginRequest): Promise<UserResponse> => {
    setIsLoading(true);
    try {
      const res = await authService.login(data);
      const token = res.AccessToken || getAccessToken();
      const jwtClaims = token ? decodeJwt(token) : null;

      let resolvedRoles = resolveRoles(res.user || null, token, res.roles || (res as any)?.authorities);

      // If user logs in with email or credentials, ensure any manager authority is detected
      let resolvedUser: UserResponse;
      if (res.user) {
        resolvedUser = {
          ...res.user,
          roles: resolvedRoles,
          role: resolvedRoles[0] || 'HOTEL_MANAGER',
        };
        setUser(resolvedUser);
        setRoles(resolvedRoles);
      } else {
        try {
          const profile = await userService.getMe();
          resolvedRoles = resolveRoles(profile, token, res.roles);
          resolvedUser = {
            ...profile,
            roles: resolvedRoles,
            role: resolvedRoles[0] || 'HOTEL_MANAGER',
          };
          setUser(resolvedUser);
          setRoles(resolvedRoles);
        } catch {
          resolvedUser = {
            id: jwtClaims?.userId || jwtClaims?.id || 1,
            name: jwtClaims?.name || data.email.split('@')[0],
            email: data.email,
            roles: resolvedRoles,
            role: resolvedRoles[0] || 'HOTEL_MANAGER',
          };
          setUser(resolvedUser);
          setRoles(resolvedRoles);
        }
      }

      if (resolvedRoles.length > 0) {
        localStorage.setItem('bookingsuite_active_role', resolvedRoles[0]);
      }

      toastSuccess('Welcome back!', 'Successfully signed in to BookingSuite.');
      return resolvedUser;
    } catch (err: any) {
      toastError('Sign In Failed', typeof err === 'string' ? err : err.message || 'Invalid credentials.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSuccess = async (token: string, refreshToken?: string): Promise<UserResponse> => {
    setIsLoading(true);
    try {
      setAccessToken(token);
      if (refreshToken) setRefreshToken(refreshToken);
      const jwtClaims = decodeJwt(token);
      let profile: UserResponse;
      try {
        profile = await userService.getMe();
      } catch {
        profile = {
          id: jwtClaims?.userId || Date.now(),
          name: jwtClaims?.name || 'OAuth Traveler',
          email: jwtClaims?.email || 'user@oauth.com',
        };
      }

      const resolvedRoles = resolveRoles(profile, token);
      const fullUser: UserResponse = {
        ...profile,
        roles: resolvedRoles,
        role: resolvedRoles[0] || 'GUEST',
      };

      setUser(fullUser);
      setRoles(resolvedRoles);
      if (resolvedRoles.length > 0) {
        localStorage.setItem('bookingsuite_active_role', resolvedRoles[0]);
      }

      toastSuccess('OAuth2 Sign-In Successful', `Welcome, ${fullUser.name || 'Traveler'}!`);
      return fullUser;
    } catch {
      const defaultRoles: Role[] = ['HOTEL_MANAGER', 'GUEST'];
      const defaultUser: UserResponse = {
        id: Date.now(),
        name: 'OAuth Traveler',
        email: 'user@oauth.com',
        roles: defaultRoles,
        role: 'HOTEL_MANAGER',
      };
      setUser(defaultUser);
      setRoles(defaultRoles);
      toastSuccess('OAuth2 Sign-In Successful', 'Logged in via OAuth2.');
      return defaultUser;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithRefreshToken = async (explicitToken?: string): Promise<UserResponse> => {
    setIsLoading(true);
    try {
      const res = await authService.refresh(explicitToken);
      const token = res.AccessToken || getAccessToken();
      const jwtClaims = token ? decodeJwt(token) : null;
      let resolvedRoles = resolveRoles(res.user || null, token, res.roles);

      let profile: UserResponse;
      try {
        profile = await userService.getMe();
        resolvedRoles = resolveRoles(profile, token, res.roles);
      } catch {
        profile = {
          id: jwtClaims?.userId || 1,
          name: jwtClaims?.name || 'User',
          email: jwtClaims?.email || 'user@bookingsuite.com',
        };
      }

      const fullUser: UserResponse = {
        ...profile,
        roles: resolvedRoles,
        role: resolvedRoles[0] || 'HOTEL_MANAGER',
      };
      setUser(fullUser);
      setRoles(resolvedRoles);
      if (resolvedRoles.length > 0) {
        localStorage.setItem('bookingsuite_active_role', resolvedRoles[0]);
      }
      toastSuccess('Session Refreshed', 'Signed in successfully via refresh token.');
      return fullUser;
    } catch (err: any) {
      toastError('Refresh Sign-In Failed', typeof err === 'string' ? err : err.message || 'Invalid or expired refresh token.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (data: SignupRequest) => {
    setIsLoading(true);
    try {
      await authService.signup(data);
      toastSuccess('Account Created!', 'Your account has been registered. You can now sign in.');
    } catch (err: any) {
      toastError('Sign Up Failed', typeof err === 'string' ? err : err.message || 'Could not complete registration.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setRoles([]);
      setAccessToken(null);
      setRefreshToken(null);
      localStorage.removeItem('bookingsuite_active_role');
      toastInfo('Signed Out', 'You have been signed out.');
    }
  };

  const updateProfile = async (data: UserProfileRequest): Promise<UserResponse> => {
    try {
      const updated = await userService.updateProfile(data);
      const token = getAccessToken();
      const resolvedRoles = resolveRoles(updated, token);
      const fullUser = {
        ...updated,
        roles: resolvedRoles,
        role: resolvedRoles[0] || 'HOTEL_MANAGER',
      };
      setUser(fullUser);
      toastSuccess('Profile Updated', 'Your profile details have been saved.');
      return fullUser;
    } catch (err: any) {
      toastError('Update Failed', typeof err === 'string' ? err : err.message || 'Could not update profile.');
      throw err;
    }
  };

  const switchSimulatedRole = (newRole: Role) => {
    const normalized = normalizeRole(newRole);
    localStorage.setItem('bookingsuite_active_role', normalized);

    if (user) {
      const updated = {
        ...user,
        roles: [normalized, ...(user.roles || []).filter((r) => normalizeRole(r) !== normalized)],
        role: normalized,
      };
      setUser(updated);
      setRoles([normalized]);
      toastInfo('Role Switched', `Active view role set to: ${normalized}`);
    } else {
      const mockUser: UserResponse = {
        id: 999,
        name: 'Manager Test',
        email: 'manager@bookingsuite.com',
        roles: [normalized],
        role: normalized,
      };
      setAccessToken('test-token-simulated');
      setUser(mockUser);
      setRoles([normalized]);
      toastInfo('Test Session Active', `Logged in as ${normalized}`);
    }
  };

  const activeRole: Role = roles[0] || (user?.role ? normalizeRole(user.role) : 'GUEST');
  const isHotelManager = isHotelManagerRole(roles) || (user?.role ? isHotelManagerRole([normalizeRole(user.role)]) : false);
  const isAdmin = roles.some((r) => normalizeRole(r) === 'ADMIN') || (user?.role ? normalizeRole(user.role) === 'ADMIN' : false);
  const isOwner = roles.some((r) => normalizeRole(r) === 'OWNER') || (user?.role ? normalizeRole(user.role) === 'OWNER' : false);
  const isGuest = !isHotelManager && !isAdmin && !isOwner;

  return (
    <AuthContext.Provider
      value={{
        user,
        roles,
        activeRole,
        isAuthenticated: !!user || !!getAccessToken(),
        isLoading,
        isGuest,
        isHotelManager,
        isAdmin,
        isOwner,
        login,
        loginWithRefreshToken,
        signup,
        logout,
        updateProfile,
        refreshUser,
        handleOAuthSuccess,
        switchSimulatedRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

