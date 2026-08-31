import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { ApiLogEntry, getStoredBaseUrl, setStoredBaseUrl, subscribeToApiLogs } from '../lib/apiClient';

interface ApiConfigContextValue {
  baseUrl: string;
  updateBaseUrl: (newUrl: string) => void;
  isBackendConnected: boolean | null;
  checkingConnection: boolean;
  checkConnection: () => Promise<boolean>;
  apiLogs: ApiLogEntry[];
  clearLogs: () => void;
  testedEndpoints: Set<string>;
  recordTestedEndpoint: (endpointKey: string) => void;
}

const ApiConfigContext = createContext<ApiConfigContextValue | undefined>(undefined);

export const ApiConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [baseUrl, setBaseUrlState] = useState<string>(getStoredBaseUrl());
  const [isBackendConnected, setIsBackendConnected] = useState<boolean | null>(null);
  const [checkingConnection, setCheckingConnection] = useState<boolean>(false);
  const [apiLogs, setApiLogs] = useState<ApiLogEntry[]>([]);
  const [testedEndpoints, setTestedEndpoints] = useState<Set<string>>(new Set());

  const updateBaseUrl = (newUrl: string) => {
    setStoredBaseUrl(newUrl);
    setBaseUrlState(newUrl);
    checkConnection();
  };

  const recordTestedEndpoint = (endpointKey: string) => {
    setTestedEndpoints((prev) => new Set(prev).add(endpointKey));
  };

  const checkConnection = async (): Promise<boolean> => {
    setCheckingConnection(true);
    try {
      // Try hitting /auth/refresh or /hotels/search or base path
      await axios.get(`${baseUrl.replace(/\/$/, '')}/users/me`, {
        timeout: 4000,
        validateStatus: (status) => status < 500, // 401/403/200 means backend is alive!
      });
      setIsBackendConnected(true);
      return true;
    } catch (err: any) {
      if (err.response && err.response.status) {
        setIsBackendConnected(true);
        return true;
      }
      setIsBackendConnected(false);
      return false;
    } finally {
      setCheckingConnection(false);
    }
  };

  useEffect(() => {
    checkConnection();

    // Subscribe to all outgoing API logs
    const unsubscribe = subscribeToApiLogs((log) => {
      setApiLogs((prev) => [log, ...prev].slice(0, 100));
      // Register tested operation pattern
      const key = `${log.method} ${log.url.split('?')[0]}`;
      setTestedEndpoints((prev) => new Set(prev).add(key));
    });

    return () => {
      unsubscribe();
    };
  }, [baseUrl]);

  const clearLogs = () => setApiLogs([]);

  return (
    <ApiConfigContext.Provider
      value={{
        baseUrl,
        updateBaseUrl,
        isBackendConnected,
        checkingConnection,
        checkConnection,
        apiLogs,
        clearLogs,
        testedEndpoints,
        recordTestedEndpoint,
      }}
    >
      {children}
    </ApiConfigContext.Provider>
  );
};

export const useApiConfig = () => {
  const context = useContext(ApiConfigContext);
  if (!context) {
    throw new Error('useApiConfig must be used within an ApiConfigProvider');
  }
  return context;
};
