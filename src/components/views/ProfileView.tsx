import React from 'react';
import { User as UserIcon, ShieldCheck, Key, Lock, Mail, Calendar, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { CredentialItem } from '../../types';

interface ProfileViewProps {
  credentials: CredentialItem[];
}

export const ProfileView: React.FC<ProfileViewProps> = ({ credentials }) => {
  const { user, lockVault, isVaultLocked } = useAuth();

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-serif">
      <div>
        <h2 className="text-xl font-serif font-bold text-slate-900 flex items-center gap-2">
          <UserIcon className="w-5 h-5 text-slate-700" />
          <span>Security Profile</span>
        </h2>
        <p className="text-xs font-serif text-slate-500 mt-1">
          Identity credentials, cryptographic key derivation parameters, and active session verification.
        </p>
      </div>

      {/* Profile Overview Card */}
      <div className="p-6 sm:p-8 bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-6">
        {/* Sharp Avatar */}
        <div className="w-20 h-20 bg-slate-900 border border-slate-950 flex items-center justify-center text-white text-2xl font-serif font-bold shrink-0">
          {user?.username?.charAt(0).toUpperCase() || 'U'}
        </div>

        <div className="space-y-3 flex-1 text-center sm:text-left">
          <div>
            <h3 className="text-xl font-serif font-bold text-slate-900">{user?.username || 'Security Officer'}</h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">{user?.email || 'user@vault.io'}</p>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-serif font-semibold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>Zero-Knowledge Initialized</span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 border border-slate-300 text-slate-800 text-xs font-mono">
              <span>{credentials.length} Encrypted Items</span>
            </span>
          </div>
        </div>

        <button
          onClick={lockVault}
          className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-800 text-xs font-serif font-semibold border border-slate-300 flex items-center gap-2 transition-colors shrink-0 uppercase tracking-wider"
        >
          <Lock className="w-3.5 h-3.5 text-amber-700" />
          <span>Lock Vault</span>
        </button>
      </div>

      {/* Cryptographic Specifications Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-6 bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-xs font-serif font-bold text-slate-900 uppercase tracking-wider">
            <Key className="w-4 h-4 text-blue-900" />
            <span>Key Derivation Function (KDF)</span>
          </div>
          <p className="text-xs font-serif text-slate-600 leading-relaxed">
            Derived client-side using <strong>Argon2id</strong> with 64MB memory limit, 3 iterations, and 4 lanes. GPU and ASIC brute-forcing is rendered computationally impractical.
          </p>
          <div className="pt-2 text-[11px] text-slate-500 font-mono border-t border-slate-100">
            Algorithm: Argon2id v19 (RFC 9106)
          </div>
        </div>

        <div className="p-6 bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-xs font-serif font-bold text-slate-900 uppercase tracking-wider">
            <Shield className="w-4 h-4 text-emerald-800" />
            <span>Cipher Suite & Integrity</span>
          </div>
          <p className="text-xs font-serif text-slate-600 leading-relaxed">
            Data payloads are encrypted with <strong>AES-256-GCM</strong> (Galois/Counter Mode). Authenticated tags ensure zero ciphertext tampering or bit-flipping in storage.
          </p>
          <div className="pt-2 text-[11px] text-slate-500 font-mono border-t border-slate-100">
            Cipher: AES/GCM/NoPadding (256-bit)
          </div>
        </div>
      </div>
    </div>
  );
};
