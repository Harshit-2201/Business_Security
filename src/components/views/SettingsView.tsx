import React, { useState } from 'react';
import {
  Settings,
  KeyRound,
  Shield,
  Server,
  Download,
  Lock,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getApiBaseUrl, setApiBaseUrl } from '../../api/client';
import { authApi } from '../../api';
import { CredentialItem } from '../../types';

interface SettingsViewProps {
  credentials: CredentialItem[];
}

export const SettingsView: React.FC<SettingsViewProps> = ({ credentials }) => {
  const { user, backendConnected, checkBackendHealth, lockVault } = useAuth();
  const { showToast } = useToast();

  const [apiUrl, setApiUrl] = useState(getApiBaseUrl());
  const [testingConnection, setTestingConnection] = useState(false);

  // Change password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdMsg, setPwdMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setApiBaseUrl(apiUrl);
    try {
      const ok = await checkBackendHealth();
      if (ok) {
        showToast('Successfully connected to Spring Boot backend!', 'success');
      } else {
        showToast('Backend did not respond at this URL. Running in local demo mode.', 'info');
      }
    } finally {
      setTestingConnection(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMsg(null);

    if (newPassword.length < 8 || newPassword.length > 15) {
      setPwdMsg({
        type: 'error',
        text: 'New password must be between 8 and 15 characters (enforced by backend validation)',
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdMsg({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    setPwdLoading(true);
    try {
      await authApi.changePassword({ currentPassword, newPassword });
      setPwdMsg({ type: 'success', text: 'Master password updated successfully' });
      showToast('Master password updated', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPwdMsg({
        type: 'error',
        text: err?.response?.data?.message || err?.message || 'Failed to change master password',
      });
    } finally {
      setPwdLoading(false);
    }
  };

  const handleExportBackup = () => {
    const exportData = {
      exportDate: new Date().toISOString(),
      vaultOwner: user?.username,
      totalItems: credentials.length,
      credentials: credentials.map((c) => ({
        id: c.id,
        name: c.name,
        type: c.type,
        url: c.url,
        username: c.username,
        decryptedPassword: c.decryptedPassword,
        notes: c.notes,
        folder: c.folder?.name,
        tags: c.tags?.map((t) => t.name),
        favorite: c.favorite,
        createdAt: c.createdAt,
      })),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fortresspass_export_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Vault backup downloaded', 'success');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-serif">
      <div>
        <h2 className="text-xl font-serif font-bold text-slate-900 flex items-center gap-2">
          <Settings className="w-5 h-5 text-slate-700" />
          <span>Security & System Settings</span>
        </h2>
        <p className="text-xs font-serif text-slate-500 mt-1">
          Manage your master key, backend API endpoints, and backup archives.
        </p>
      </div>

      {/* Spring Boot REST API Configuration */}
      <div className="p-6 bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 text-slate-800 border border-slate-200">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-serif font-bold text-slate-900 uppercase tracking-wider">Spring Boot REST Backend</h3>
              <p className="text-xs font-serif text-slate-500">
                Direct integration with Java 21 Spring Boot + MySQL Docker API container
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-200 text-xs">
            <span
              className={`w-2 h-2 ${
                backendConnected === true ? 'bg-emerald-600' : 'bg-amber-500'
              }`}
            />
            <span className="text-slate-700 font-mono text-[11px] uppercase tracking-wider">
              {backendConnected === true ? 'LIVE CONNECTED' : 'DEMO RESILIENCE MODE'}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <input
            type="text"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            placeholder="http://localhost:8080"
            className="w-full sm:flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 text-xs font-mono focus:outline-none focus:border-blue-900"
          />
          <button
            onClick={handleTestConnection}
            disabled={testingConnection}
            className="w-full sm:w-auto px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-800 text-xs font-serif font-semibold uppercase tracking-wider border border-slate-300 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${testingConnection ? 'animate-spin text-blue-900' : ''}`} />
            <span>Test Connection</span>
          </button>
        </div>
      </div>

      {/* Change Master Password */}
      <div className="p-6 bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-100 text-slate-800 border border-slate-200">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-serif font-bold text-slate-900 uppercase tracking-wider">Change Master Password</h3>
            <p className="text-xs font-serif text-slate-500">
              Derives new Argon2id key and re-encrypts the vault master key
            </p>
          </div>
        </div>

        {pwdMsg && (
          <div
            className={`p-3 border text-xs font-serif flex items-center gap-2 ${
              pwdMsg.type === 'success'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : 'bg-rose-50 border-rose-300 text-rose-900'
            }`}
          >
            {pwdMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-700" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-700" />
            )}
            <span>{pwdMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-3 pt-1">
          <div>
            <label className="block text-[11px] font-serif font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 text-slate-900 text-xs font-serif focus:outline-none focus:border-blue-900"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-serif font-semibold text-slate-700 uppercase tracking-wider mb-1">
                New Password <span className="text-slate-500">(8-15 chars)</span>
              </label>
              <input
                type="password"
                value={newPassword}
                maxLength={15}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="8 to 15 characters"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 text-slate-900 text-xs font-serif focus:outline-none focus:border-blue-900"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-serif font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                maxLength={15}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 text-slate-900 text-xs font-serif focus:outline-none focus:border-blue-900"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={pwdLoading}
            className="px-5 py-2.5 bg-slate-900 hover:bg-blue-950 text-white text-xs font-serif font-semibold uppercase tracking-wider border border-slate-950 transition-colors disabled:opacity-50"
          >
            {pwdLoading ? 'Updating Master Key...' : 'Update Master Password'}
          </button>
        </form>
      </div>

      {/* Export & Data Backup */}
      <div className="p-6 bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-serif font-bold text-slate-900 uppercase tracking-wider">Export Vault Archive</h3>
          <p className="text-xs font-serif text-slate-500 mt-0.5">
            Download a portable JSON archive of your credentials ({credentials.length} items).
          </p>
        </div>
        <button
          onClick={handleExportBackup}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-800 text-xs font-serif font-semibold uppercase tracking-wider border border-slate-300 transition-colors shrink-0"
        >
          <Download className="w-4 h-4 text-slate-700" />
          <span>Export JSON</span>
        </button>
      </div>

      {/* Zero Knowledge Cryptography Verification Card */}
      <div className="p-6 bg-slate-50 border border-slate-200 space-y-3">
        <div className="flex items-center gap-2 text-xs font-serif font-bold text-slate-900 uppercase tracking-wider">
          <Shield className="w-4 h-4 text-blue-900" />
          <span>Zero-Knowledge Architecture Overview</span>
        </div>
        <div className="text-xs font-serif text-slate-600 leading-relaxed space-y-2">
          <p>
            • <strong>Argon2id Key Derivation</strong>: Memory-hard parameters (64 MB RAM, 3 iterations) generate the vault encryption key from your master password client-side.
          </p>
          <p>
            • <strong>AES-256-GCM Authenticated Encryption</strong>: Every credential payload receives a unique cryptographically random 96-bit Initialization Vector (IV).
          </p>
          <p>
            • <strong>Stateless JWT & Rate Limiting</strong>: Backend tokens are signed with HMAC-SHA256, protected by Bucket4j token bucket rate limiters against brute-force attacks.
          </p>
        </div>
      </div>
    </div>
  );
};
