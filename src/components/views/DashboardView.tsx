import React from 'react';
import {
  ShieldCheck,
  KeyRound,
  Star,
  AlertTriangle,
  Copy,
  Clock,
  Zap,
  Plus,
  Lock,
  ArrowRight,
  TrendingUp,
  ShieldAlert,
} from 'lucide-react';
import { CredentialItem, VaultHealthStats } from '../../types';
import { FaviconLogo } from '../common/FaviconLogo';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ActiveView } from '../layout/Sidebar';

interface DashboardViewProps {
  credentials: CredentialItem[];
  stats: VaultHealthStats;
  onOpenAddModal: () => void;
  setActiveView: (view: ActiveView) => void;
  onEditCredential: (item: CredentialItem) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  credentials,
  stats,
  onOpenAddModal,
  setActiveView,
  onEditCredential,
}) => {
  const { user, lockVault } = useAuth();
  const { copyToClipboard } = useToast();

  const recentCredentials = [...credentials]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const getScoreBadge = (score: number) => {
    if (score >= 80) return 'text-emerald-900 border-emerald-300 bg-emerald-50';
    if (score >= 60) return 'text-amber-900 border-amber-300 bg-amber-50';
    return 'text-rose-900 border-rose-300 bg-rose-50';
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-serif">
      {/* Executive Welcome Banner */}
      <div className="bg-white border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-blue-50 border border-blue-900/30 text-[11px] text-blue-950 font-serif font-medium uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-900" />
              <span>Zero-Knowledge Vault Active</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-slate-900">
              Welcome, {user?.username || 'Security Officer'}
            </h2>
            <p className="text-xs sm:text-sm font-serif text-slate-600 max-w-xl leading-relaxed">
              Cryptographic vault initialized with client-side AES-256-GCM authenticated encryption and Argon2id key derivation.
            </p>
          </div>

          {/* Quick Action Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-blue-950 text-white text-xs font-serif font-semibold uppercase tracking-wider border border-slate-950 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Credential</span>
            </button>
            <button
              onClick={() => setActiveView('generator')}
              className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-800 text-xs font-serif font-semibold uppercase tracking-wider border border-slate-300 transition-colors"
            >
              <Zap className="w-4 h-4 text-blue-900" />
              <span>Password Generator</span>
            </button>
            <button
              onClick={lockVault}
              className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-800 text-xs font-serif font-semibold uppercase tracking-wider border border-slate-300 transition-colors"
            >
              <Lock className="w-4 h-4 text-amber-700" />
              <span>Lock Vault</span>
            </button>
          </div>
        </div>
      </div>

      {/* High-Level Metric Stat Rectangles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Credentials */}
        <div
          onClick={() => setActiveView('vault')}
          className="p-5 bg-white border border-slate-200 hover:border-slate-400 shadow-xs cursor-pointer transition-colors group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-serif uppercase tracking-wider">Total Credentials</span>
            <div className="p-1.5 bg-slate-100 text-slate-800 border border-slate-200">
              <KeyRound className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 tabular-nums">
              {stats.total}
            </span>
            <span className="text-xs text-slate-500 font-serif">items</span>
          </div>
        </div>

        {/* Favorites */}
        <div
          onClick={() => setActiveView('vault')}
          className="p-5 bg-white border border-slate-200 hover:border-slate-400 shadow-xs cursor-pointer transition-colors group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-serif uppercase tracking-wider">Favorite Logins</span>
            <div className="p-1.5 bg-amber-50 text-amber-800 border border-amber-200">
              <Star className="w-4 h-4 fill-amber-400/50" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 tabular-nums">
              {stats.favorites}
            </span>
            <span className="text-xs text-slate-500 font-serif">starred</span>
          </div>
        </div>

        {/* Security Health Score */}
        <div
          onClick={() => setActiveView('security')}
          className="p-5 bg-white border border-slate-200 hover:border-slate-400 shadow-xs cursor-pointer transition-colors group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-serif uppercase tracking-wider">Security Score</span>
            <div className="p-1.5 bg-blue-50 text-blue-900 border border-blue-200">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 tabular-nums">
              {stats.securityScore}%
            </span>
            <span
              className={`px-2 py-0.5 text-[10px] font-serif font-bold uppercase tracking-wider border ${getScoreBadge(
                stats.securityScore
              )}`}
            >
              {stats.securityScore >= 80 ? 'Optimal' : stats.securityScore >= 60 ? 'Fair' : 'Risk'}
            </span>
          </div>
        </div>

        {/* Weak or Duplicate Passwords Warning */}
        <div
          onClick={() => setActiveView('security')}
          className="p-5 bg-white border border-slate-200 hover:border-slate-400 shadow-xs cursor-pointer transition-colors group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-serif uppercase tracking-wider">Vulnerable Items</span>
            <div className="p-1.5 bg-rose-50 text-rose-800 border border-rose-200">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-rose-700 tabular-nums">
              {stats.weakCount + stats.duplicateCount}
            </span>
            <span className="text-xs text-slate-500 font-serif">
              ({stats.weakCount} weak, {stats.duplicateCount} dup)
            </span>
          </div>
        </div>
      </div>

      {/* Security Health Alert Bar if issues exist */}
      {(stats.weakCount > 0 || stats.duplicateCount > 0) && (
        <div className="p-4 bg-rose-50 border border-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-100 text-rose-800 border border-rose-200 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-serif font-bold text-rose-900">
                Security Attention Required ({stats.weakCount + stats.duplicateCount} Issues)
              </h4>
              <p className="text-xs font-serif text-rose-800 mt-0.5">
                Identified {stats.weakCount} weak passwords and {stats.duplicateCount} reused credentials in active storage.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveView('security')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-800 hover:bg-rose-900 text-white text-xs font-serif font-semibold tracking-wider uppercase border border-rose-900 transition-colors shrink-0"
          >
            <span>Audit & Resolve</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Recent Credentials Section */}
      <div className="bg-white border border-slate-200 p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-700" />
            <h3 className="text-sm font-serif font-bold text-slate-900 uppercase tracking-wider">
              Recent Vault Additions
            </h3>
          </div>
          <button
            onClick={() => setActiveView('vault')}
            className="text-xs font-serif text-blue-900 hover:text-blue-700 font-semibold transition-colors flex items-center gap-1 uppercase tracking-wider"
          >
            <span>View All ({credentials.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentCredentials.length === 0 ? (
          <p className="text-xs font-serif text-slate-500 py-6 text-center">No credentials recorded.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentCredentials.map((item) => (
              <div
                key={item.id}
                onClick={() => onEditCredential(item)}
                className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50 px-3 cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <FaviconLogo url={item.url} name={item.name} type={item.type} size="sm" />
                  <div className="min-w-0">
                    <p className="text-xs font-serif font-bold text-slate-900 group-hover:text-blue-900 truncate">
                      {item.name}
                    </p>
                    <p className="text-[11px] text-slate-500 font-mono truncate">
                      {item.username || '(No username)'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] text-slate-500 font-mono uppercase hidden sm:inline">
                    {item.type}
                  </span>
                  {item.username && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(item.username!, 'Username');
                      }}
                      title="Copy Username"
                      className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
