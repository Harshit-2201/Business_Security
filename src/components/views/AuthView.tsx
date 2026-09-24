import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, User as UserIcon, ArrowRight, Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface AuthViewProps {
  onSuccess?: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login, register } = useAuth();
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation matching backend constraints
    if (isRegister) {
      if (!username.trim()) {
        setError('Username is required');
        return;
      }
      if (!email.trim() || email.length > 50) {
        setError('Valid email is required (maximum 50 characters)');
        return;
      }
      if (password.length < 8 || password.length > 15) {
        setError('Password must be between 8 and 15 characters (enforced by backend validation)');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
    } else {
      if (!username.trim() && !email.trim()) {
        setError('Username or Email is required');
        return;
      }
      if (!password) {
        setError('Password is required');
        return;
      }
    }

    setLoading(true);
    try {
      if (isRegister) {
        await register(username.trim(), email.trim(), password);
        showToast('Account registered successfully! Vault initialized.', 'success');
      } else {
        await login(username.trim() || email.trim(), password);
        showToast('Logged in successfully', 'success');
      }
      if (onSuccess) onSuccess();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Authentication failed. Please check credentials.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const fillQuickDemo = () => {
    setUsername('alex_chen');
    setEmail('alex.chen@cybercore.io');
    setPassword('Pass1234!');
    setConfirmPassword('Pass1234!');
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-center items-center p-4 relative font-serif">
      {/* Main Authentication Card */}
      <div className="relative w-full max-w-md bg-white border border-slate-300 shadow-xl p-8 z-10">
        {/* Brand Icon & Heading */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-900 text-white border border-slate-950 mb-3">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-slate-900 tracking-tight">FORTRESSPASS</h2>
          <p className="text-xs font-serif text-slate-500 mt-1">Zero-Knowledge Encrypted Password Manager</p>
        </div>

        {/* Tab Switcher (Login / Register) */}
        <div className="flex p-1 bg-slate-100 border border-slate-300 mb-6">
          <button
            type="button"
            onClick={() => {
              setIsRegister(false);
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-serif font-semibold tracking-wider uppercase transition-colors ${
              !isRegister
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegister(true);
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-serif font-semibold tracking-wider uppercase transition-colors ${
              isRegister
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Create Vault
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-300 text-rose-800 text-xs font-serif flex items-center gap-2">
            <Info className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-serif font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Username {isRegister && <span className="text-slate-500">(Required)</span>}
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={isRegister ? 'Choose a unique username' : 'Username or Email'}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2 bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 text-xs font-serif focus:outline-none focus:border-blue-900 transition-colors"
                required={isRegister}
              />
            </div>
          </div>

          {isRegister && (
            <div>
              <label className="block text-[11px] font-serif font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address <span className="text-slate-500">(Max 50 chars)</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="your.email@company.com"
                  value={email}
                  maxLength={50}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2 bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 text-xs font-serif focus:outline-none focus:border-blue-900 transition-colors"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-serif font-semibold text-slate-700 uppercase tracking-wider">
                {isRegister ? 'Master Password' : 'Password'}
              </label>
              {isRegister && (
                <span className="text-[10px] text-slate-500 font-mono">8 to 15 chars</span>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                placeholder={isRegister ? '8-15 characters' : 'Enter password'}
                value={password}
                maxLength={isRegister ? 15 : 100}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2 bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 text-xs font-serif focus:outline-none focus:border-blue-900 transition-colors"
                required
              />
            </div>
          </div>

          {isRegister && (
            <div>
              <label className="block text-[11px] font-serif font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Confirm Master Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  maxLength={15}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2 bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 text-xs font-serif focus:outline-none focus:border-blue-900 transition-colors"
                  required
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 px-4 bg-slate-900 hover:bg-blue-950 text-white font-serif font-semibold text-xs tracking-wider uppercase border border-slate-950 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white animate-spin" />
                <span>Authenticating with Spring Boot...</span>
              </span>
            ) : (
              <>
                <span>{isRegister ? 'Create Secure Vault' : 'Unlock & Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Fast-Fill Button */}
        <div className="mt-5 pt-4 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={fillQuickDemo}
            className="text-xs font-serif text-blue-900 hover:text-blue-700 font-semibold transition-colors"
          >
            ⚡ Autofill Demo Credentials
          </button>
          <span className="text-[10px] text-slate-500 font-mono tracking-wider">AES-256-GCM</span>
        </div>
      </div>
    </div>
  );
};
