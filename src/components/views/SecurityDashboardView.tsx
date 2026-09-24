import React from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Copy,
  Zap,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { CredentialItem, VaultHealthStats } from '../../types';
import { FaviconLogo } from '../common/FaviconLogo';

interface SecurityDashboardViewProps {
  credentials: CredentialItem[];
  stats: VaultHealthStats;
  onEditCredential: (item: CredentialItem) => void;
  onOpenGenerator: () => void;
}

export const SecurityDashboardView: React.FC<SecurityDashboardViewProps> = ({
  credentials,
  stats,
  onEditCredential,
  onOpenGenerator,
}) => {
  // Identify exact weak passwords (< 10 chars, or simple)
  const weakCredentials = credentials.filter((c) => {
    const pwd = c.decryptedPassword || '';
    if (!pwd) return false;
    return pwd.length < 10 || !/[A-Z]/.test(pwd) || !/[0-9]/.test(pwd) || !/[^A-Za-z0-9]/.test(pwd);
  });

  // Identify duplicate/reused passwords
  const passwordMap = new Map<string, CredentialItem[]>();
  credentials.forEach((c) => {
    const pwd = c.decryptedPassword;
    if (pwd) {
      const list = passwordMap.get(pwd) || [];
      list.push(c);
      passwordMap.set(pwd, list);
    }
  });

  const duplicateCredentials: { password: string; items: CredentialItem[] }[] = [];
  passwordMap.forEach((items, pwd) => {
    if (items.length > 1) {
      duplicateCredentials.push({ password: pwd, items });
    }
  });

  // Identify old credentials (> 90 days since passwordUpdated or createdAt)
  const now = Date.now();
  const ninetyDaysMs = 90 * 24 * 60 * 60 * 1000;
  const oldCredentials = credentials.filter((c) => {
    const ts = c.passwordUpdated ? new Date(c.passwordUpdated).getTime() : new Date(c.createdAt).getTime();
    return now - ts > ninetyDaysMs;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6 font-serif">
      {/* Title */}
      <div>
        <h2 className="text-xl font-serif font-bold text-slate-900 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-slate-700" />
          <span>Security Health Audit</span>
        </h2>
        <p className="text-xs font-serif text-slate-500 mt-1">
          Zero-Knowledge client-side audit evaluating password entropy, reuse, and aging across your vault records.
        </p>
      </div>

      {/* Main Health Card with Sharp Square Score */}
      <div className="bg-white p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-900/30 text-xs text-blue-950 font-serif font-medium uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-900" />
            <span>Overall Vault Security Rating</span>
          </div>
          <h3 className="text-2xl font-serif font-bold text-slate-900">
            {stats.securityScore >= 85
              ? 'Optimal Security Posture'
              : stats.securityScore >= 65
              ? 'Moderate Security — Attention Recommended'
              : 'Critical Risk — Immediate Remediation Required'}
          </h3>
          <p className="text-xs font-serif text-slate-600 max-w-lg leading-relaxed">
            Eliminating reused passwords and rotating aging secrets protects your enterprise assets against credential stuffing and spray attacks.
          </p>
        </div>

        {/* Sharp Square Score Block */}
        <div className="relative flex flex-col items-center justify-center shrink-0">
          <div className="w-28 h-28 border-2 border-slate-900 flex flex-col items-center justify-center bg-slate-50 shadow-xs">
            <span className="text-3xl font-bold font-mono text-slate-900 tabular-nums">
              {stats.securityScore}%
            </span>
            <span className="text-[10px] text-slate-500 font-serif font-semibold uppercase tracking-wider mt-0.5">Rating</span>
          </div>
        </div>
      </div>

      {/* Metrics Triplet */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-600">
            <span className="text-xs font-serif font-semibold uppercase tracking-wider">Weak Passwords</span>
            <div className="p-1.5 bg-rose-50 text-rose-800 border border-rose-200">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-rose-800 tabular-nums">
              {weakCredentials.length}
            </span>
            <span className="text-xs text-slate-500 font-serif">accounts</span>
          </div>
          <p className="text-[11px] text-slate-500 font-serif">Length &lt; 10 or low entropy complexity</p>
        </div>

        <div className="p-5 bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-600">
            <span className="text-xs font-serif font-semibold uppercase tracking-wider">Reused Passwords</span>
            <div className="p-1.5 bg-amber-50 text-amber-800 border border-amber-200">
              <RotateCcw className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-amber-800 tabular-nums">
              {duplicateCredentials.reduce((acc, curr) => acc + curr.items.length, 0)}
            </span>
            <span className="text-xs text-slate-500 font-serif">affected items</span>
          </div>
          <p className="text-[11px] text-slate-500 font-serif">Matches another active vault item</p>
        </div>

        <div className="p-5 bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-600">
            <span className="text-xs font-serif font-semibold uppercase tracking-wider">Aging Passwords</span>
            <div className="p-1.5 bg-blue-50 text-blue-900 border border-blue-200">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {oldCredentials.length}
            </span>
            <span className="text-xs text-slate-500 font-serif">unrotated</span>
          </div>
          <p className="text-[11px] text-slate-500 font-serif">Not rotated in &gt; 90 days</p>
        </div>
      </div>

      {/* Actionable List: Weak Passwords */}
      {weakCredentials.length > 0 && (
        <div className="bg-white border border-rose-200 p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-rose-100 pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-700" />
              <h4 className="text-sm font-serif font-bold text-rose-900 uppercase tracking-wider">Weak Passwords Needing Upgrade</h4>
            </div>
            <span className="text-xs text-rose-700 font-mono font-bold">{weakCredentials.length} detected</span>
          </div>

          <div className="divide-y divide-slate-100">
            {weakCredentials.map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <FaviconLogo url={item.url} name={item.name} type={item.type} size="sm" />
                  <div className="min-w-0">
                    <p className="text-xs font-serif font-bold text-slate-900 truncate">{item.name}</p>
                    <p className="text-[11px] text-slate-500 font-mono truncate">{item.username || '(No username)'}</p>
                  </div>
                </div>

                <button
                  onClick={() => onEditCredential(item)}
                  className="px-3.5 py-1.5 bg-rose-700 hover:bg-rose-800 text-white text-xs font-serif font-semibold tracking-wider uppercase border border-rose-900 flex items-center gap-1 transition-colors shrink-0"
                >
                  <span>Update Password</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actionable List: Reused Passwords */}
      {duplicateCredentials.length > 0 && (
        <div className="bg-white border border-amber-200 p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-amber-100 pb-3">
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-amber-700" />
              <h4 className="text-sm font-serif font-bold text-amber-900 uppercase tracking-wider">Reused Passwords</h4>
            </div>
            <span className="text-xs text-amber-800 font-mono font-bold">
              {duplicateCredentials.length} password cluster{duplicateCredentials.length > 1 ? 's' : ''}
            </span>
          </div>

          <div className="space-y-3">
            {duplicateCredentials.map((dup, i) => (
              <div key={i} className="p-3.5 bg-amber-50/50 border border-amber-200 space-y-2">
                <p className="text-xs font-serif text-amber-900 font-medium">Shared across these services:</p>
                <div className="flex flex-wrap gap-2">
                  {dup.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => onEditCredential(item)}
                      className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-300 hover:border-slate-500 text-xs font-serif text-slate-800 transition-colors shadow-2xs"
                    >
                      <span>{item.name}</span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actionable List: Old Passwords */}
      {oldCredentials.length > 0 && (
        <div className="bg-white border border-slate-200 p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-700" />
              <h4 className="text-sm font-serif font-bold text-slate-900 uppercase tracking-wider">Aging Passwords (&gt; 90 Days)</h4>
            </div>
            <span className="text-xs text-slate-600 font-mono font-bold">{oldCredentials.length} items</span>
          </div>

          <div className="divide-y divide-slate-100">
            {oldCredentials.slice(0, 5).map((item) => (
              <div key={item.id} className="py-2.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <FaviconLogo url={item.url} name={item.name} type={item.type} size="sm" />
                  <div className="min-w-0">
                    <p className="text-xs font-serif font-bold text-slate-900 truncate">{item.name}</p>
                    <p className="text-[11px] text-slate-500 font-mono">
                      Last rotated {new Date(item.passwordUpdated || item.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onEditCredential(item)}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-serif font-semibold border border-slate-300 transition-colors uppercase tracking-wider"
                >
                  Rotate
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
