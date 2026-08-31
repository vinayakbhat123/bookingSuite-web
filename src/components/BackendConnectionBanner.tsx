import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Database,
  FileCode,
  Globe,
  RefreshCw,
  Settings,
} from 'lucide-react';
import { useApiConfig } from '../context/ApiConfigContext';
import { ApiIntegrationReportModal } from './ApiIntegrationReportModal';
import { Modal } from './Modal';

export const BackendConnectionBanner: React.FC<{ onOpenReport?: () => void }> = ({ onOpenReport }) => {
  const {
    baseUrl,
    updateBaseUrl,
    isBackendConnected,
    checkingConnection,
    checkConnection,
  } = useApiConfig();

  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [inputUrl, setInputUrl] = useState(baseUrl);

  const handleSaveUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputUrl.trim()) {
      updateBaseUrl(inputUrl.trim());
      setIsUrlModalOpen(false);
    }
  };

  const handleReportClick = () => {
    if (onOpenReport) {
      onOpenReport();
    } else {
      setIsReportModalOpen(true);
    }
  };

  return (
    <>
      <div className="bg-slate-900 text-slate-200 text-xs px-4 py-2 border-b border-slate-800 transition-all">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Backend Connection Status */}
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 font-medium text-slate-300">
              <Database className="w-3.5 h-3.5 text-rose-400" />
              <span>Spring Boot REST API:</span>
            </span>

            <button
              onClick={() => {
                setInputUrl(baseUrl);
                setIsUrlModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 font-mono px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              title="Click to change API Base URL"
            >
              <Globe className="w-3 h-3 text-sky-400" />
              <span>{baseUrl}</span>
              <Settings className="w-3 h-3 text-slate-400" />
            </button>

            {checkingConnection ? (
              <span className="inline-flex items-center gap-1 text-slate-400">
                <RefreshCw className="w-3 h-3 animate-spin text-amber-400" />
                <span>Checking...</span>
              </span>
            ) : isBackendConnected ? (
              <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Backend Connected</span>
              </span>
            ) : (
              <div className="inline-flex items-center gap-1.5 text-amber-400">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Backend offline or CORS waiting (localhost:8080)</span>
                <button
                  onClick={checkConnection}
                  className="underline hover:text-amber-200 text-[11px] ml-1"
                >
                  Retry Ping
                </button>
              </div>
            )}
          </div>

          {/* Right Tools: API Report Modal Button */}
          <div className="flex items-center gap-2.5">
            {/* OpenAPI 31-Endpoints Report Button */}
            <button
              onClick={handleReportClick}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-lg transition-colors shadow-2xs text-[11px]"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>API Integration Report (31/31)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Base URL Configuration Modal */}
      <Modal
        isOpen={isUrlModalOpen}
        onClose={() => setIsUrlModalOpen(false)}
        title="Configure Backend API Base URL"
        maxWidth="md"
      >
        <form onSubmit={handleSaveUrl} className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            By default, BookingSuite connects to your local Spring Boot REST backend at{' '}
            <code className="bg-slate-100 px-1 py-0.5 rounded text-rose-600 font-mono">
              http://localhost:8080/api/v1
            </code>
            . If your server is hosted on another port or host URL, enter it below.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Backend Base URL
            </label>
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="http://localhost:8080/api/v1"
              className="w-full px-3 py-2 text-sm font-mono rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsUrlModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-sm"
            >
              Save & Reconnect
            </button>
          </div>
        </form>
      </Modal>

      {/* OpenAPI Specification Report Modal */}
      <ApiIntegrationReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
    </>
  );
};
