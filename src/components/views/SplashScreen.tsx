import React from 'react';
import { ShieldCheck, Lock, Key, ArrowRight, Database, Server } from 'lucide-react';

interface SplashScreenProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onGetStarted, onSignIn }) => {
  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-between p-6 relative overflow-hidden font-serif">
      {/* Top Bar Header */}
      <header className="relative z-10 max-w-6xl mx-auto w-full flex items-center justify-between py-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-900 flex items-center justify-center text-white border border-slate-950">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-serif font-bold text-slate-900 tracking-tight">FORTRESSPASS</h1>
            <p className="text-[10px] text-blue-900 font-mono tracking-widest uppercase">Zero-Knowledge Architecture</p>
          </div>
        </div>

        <button
          onClick={onSignIn}
          className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-800 text-xs font-serif font-semibold border border-slate-300 transition-colors uppercase tracking-wider"
        >
          Sign In
        </button>
      </header>

      {/* Center Hero Section */}
      <main className="relative z-10 max-w-3xl mx-auto w-full text-center space-y-6 py-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-900/30 text-xs text-blue-950 font-serif font-medium">
          <Lock className="w-3.5 h-3.5 text-blue-900" />
          <span className="tracking-wide">Zero-Knowledge AES-256-GCM + Spring Boot 3 Engine</span>
        </div>

        <h2 className="text-4xl sm:text-5xl font-serif font-bold text-slate-900 tracking-tight leading-tight">
          Uncompromising Security for High-Value Secrets
        </h2>

        <p className="text-sm sm:text-base font-serif text-slate-600 max-w-xl mx-auto leading-relaxed">
          Engineered with private vault architecture. Encrypted client-side via memory-hard Argon2id key derivation before transmission.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <button
            onClick={onGetStarted}
            className="w-full sm:w-auto px-7 py-3.5 bg-slate-900 hover:bg-blue-950 text-white font-serif font-semibold text-xs tracking-wider uppercase border border-slate-950 flex items-center justify-center gap-2 transition-colors"
          >
            <span>Launch Vault</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onSignIn}
            className="w-full sm:w-auto px-7 py-3.5 bg-white hover:bg-slate-50 text-slate-800 font-serif font-semibold text-xs tracking-wider uppercase border border-slate-300 transition-colors"
          >
            Unlock Existing Vault
          </button>
        </div>

        {/* Feature Rectangles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-10 text-left">
          <div className="p-5 bg-white border border-slate-200 shadow-xs space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-serif font-bold text-slate-900">
              <Key className="w-4 h-4 text-blue-900" />
              <span>Argon2id KDF</span>
            </div>
            <p className="text-xs font-serif text-slate-600 leading-relaxed">
              GPU-resistant memory-hard key derivation executed strictly in-browser.
            </p>
          </div>

          <div className="p-5 bg-white border border-slate-200 shadow-xs space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-serif font-bold text-slate-900">
              <Database className="w-4 h-4 text-emerald-800" />
              <span>Docker MySQL</span>
            </div>
            <p className="text-xs font-serif text-slate-600 leading-relaxed">
              Enterprise persistence storing authenticated ciphertext records only.
            </p>
          </div>

          <div className="p-5 bg-white border border-slate-200 shadow-xs space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-serif font-bold text-slate-900">
              <Server className="w-4 h-4 text-slate-800" />
              <span>Spring Boot REST</span>
            </div>
            <p className="text-xs font-serif text-slate-600 leading-relaxed">
              Java 21 layered controller, service, repository architecture.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-6xl mx-auto w-full text-center text-xs font-serif text-slate-500 py-4 border-t border-slate-200">
        <p>FortressPass Zero-Knowledge Architecture · No plaintext secrets ever logged or stored</p>
      </footer>
    </div>
  );
};
