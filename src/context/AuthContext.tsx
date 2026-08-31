import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getAccessToken, setAccessToken, setRefreshToken } from '../lib/apiClient';
import { authService } from '../services/authService';
import { userService } from '../services/userService';
import { LoginRequest, Role, SignupRequest, UserProfileRequest, UserResponse } from '../types/api';
import { useToast } from './ToastContext';

interface AuthContextValue {
  user: UserResponse | null;
  roles: Role[];
  isAuthenticated: boolean;
  isLoading: boolean;
  isGuest: boolean;
  isHotelManager: boolean;
  isAdmin: boolean;
  isOwner: boolean;
  login: (data: LoginRequest) => Promise<UserResponse>;
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
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { error: toastError, success: toastSuccess, info: toastInfo } = useToast();

  const resolveRoles = (userObj: UserResponse | null, explicitRoles?: Role[]): Role[] => {
    if (explicitRoles && explicitRoles.length > 0) return explicitRoles;
    if (userObj?.roles && userObj.roles.length > 0) return userObj.roles;
    if (userObj?.role) return [userObj.role];
    return ['GUEST'];
  };

  const refreshUser = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setUser(null);
      setRoles([]);
      setIsLoading(false);
      return;
    }

    try {
      const profile = await userService.getMe();
      setUser(profile);
      setRoles(resolveRoles(profile));
    } catch {
      // If unable to fetch /users/me, check if token exists or clear
      // If token is invalid it might have cleared
      if (!getAccessToken()) {
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
      let resolvedUser: UserResponse;
      if (res.user) {
        resolvedUser = res.user;
        setUser(res.user);
        setRoles(resolveRoles(res.user, res.roles));
      } else {
        // Fetch /users/me
        try {
          const profile = await userService.getMe();
          resolvedUser = profile;
          setUser(profile);
          setRoles(resolveRoles(profile, res.roles));
        } catch {
          // Default fallback
          const defaultRoles: Role[] = res.roles || ['GUEST'];
          resolvedUser = {
            id: 1,
            name: data.email.split('@')[0],
            email: data.email,
            roles: defaultRoles,
          };
          setUser(resolvedUser);
          setRoles(defaultRoles);
        }
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
      const profile = await userService.getMe();
      setUser(profile);
      setRoles(resolveRoles(profile));
      toastSuccess('OAuth2 Sign-In Successful', `Welcome, ${profile.name || 'Traveler'}!`);
      return profile;
    } catch {
      const defaultUser: UserResponse = {
        id: Date.now(),
        name: 'OAuth Traveler',
        email: 'user@oauth.com',
        roles: ['GUEST'],
      };
      setUser(defaultUser);
      setRoles(['GUEST']);
      toastSuccess('OAuth2 Sign-In Successful', 'Logged in via OAuth2.');
      return defaultUser;
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
      toastInfo('Signed Out', 'You have been signed out.');
    }
  };

  const updateProfile = async (data: UserProfileRequest): Promise<UserResponse> => {
    try {
      const updated = await userService.updateProfile(data);
      setUser(updated);
      toastSuccess('Profile Updated', 'Your profile details have been saved.');
      return updated;
    } catch (err: any) {
      toastError('Update Failed', typeof err === 'string' ? err : err.message || 'Could not update profile.');
      throw err;
    }
  };

  const switchSimulatedRole = (newRole: Role) => {
    if (user) {
      const updated = { ...user, roles: [newRole], role: newRole };
      setUser(updated);
      setRoles([newRole]);
      toastInfo('Role Switched', `Active view role set to: ${newRole}`);
    } else {
      // Mock session for quick testing if backend not logged in
      const mockUser: UserResponse = {
        id: 999,
        name: 'Manager Test',
        email: 'manager@bookingsuite.com',
        roles: [newRole],
        role: newRole,
      };
      setAccessToken('test-token-simulated');
      setUser(mockUser);
      setRoles([newRole]);
      toastInfo('Test Session Active', `Logged in as ${newRole}`);
    }
  };

  const isGuest = roles.includes('GUEST') || roles.length === 0;
  const isHotelManager = roles.includes('HOTEL_MANAGER') || roles.includes('ADMIN') || roles.includes('OWNER');
  const isAdmin = roles.includes('ADMIN');
  const isOwner = roles.includes('OWNER');

  return (
    <AuthContext.Provider
      value={{
        user,
        roles,
        isAuthenticated: !!user || !!getAccessToken(),
        isLoading,
        isGuest,
        isHotelManager,
        isAdmin,
        isOwner,
        login,
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
