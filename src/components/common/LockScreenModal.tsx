import React, { useState } from 'react';
import { Lock, KeyRound, ShieldAlert, Unlock, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const LockScreenModal: React.FC = () => {
  const { isVaultLocked, unlockVault, user, logout } = useAuth();
  const { showToast } = useToast();
  const [masterPassword, setMasterPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isVaultLocked) return null;

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!masterPassword) {
      setError('Please enter your Master Password');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await unlockVault(masterPassword);
      showToast('Vault decrypted successfully', 'success');
      setMasterPassword('');
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Invalid Master Password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white border border-slate-300 shadow-2xl p-8 text-center">
        {/* Lock Icon */}
        <div className="mx-auto w-14 h-14 bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-800 mb-5">
          <Lock className="w-6 h-6" />
        </div>

        <h3 className="text-xl font-serif font-bold text-slate-900 tracking-tight">VAULT IS LOCKED</h3>
        <p className="text-xs font-serif text-slate-600 mt-1.5 leading-relaxed">
          Provide Master Password to derive your AES-256 decryption key for{' '}
          <span className="text-slate-900 font-bold">{user?.username || 'this vault'}</span>.
        </p>

        {error && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-300 text-rose-800 text-xs flex items-center gap-2 text-left">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleUnlock} className="mt-6 space-y-4">
          <div className="relative text-left">
            <label className="block text-[11px] font-serif font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Master Password
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                placeholder="Enter master password..."
                value={masterPassword}
                onChange={(e) => setMasterPassword(e.target.value)}
                autoFocus
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-900 text-xs font-serif"
              />
            </div>
            <p className="text-[11px] font-serif text-slate-500 mt-1">
              Hint: In preview demo mode, any master password (4+ chars) unlocks the vault.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-slate-900 hover:bg-blue-950 text-white font-serif font-semibold text-xs tracking-wider uppercase border border-slate-950 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white animate-spin" />
                <span>Deriving Key & Decrypting...</span>
              </span>
            ) : (
              <>
                <Unlock className="w-4 h-4" />
                <span>Unlock Vault</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between text-xs font-serif text-slate-500">
          <span>Active user: {user?.email}</span>
          <button
            onClick={logout}
            className="text-slate-600 hover:text-rose-700 underline transition-colors"
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
};
