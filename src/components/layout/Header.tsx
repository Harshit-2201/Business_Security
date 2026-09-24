import React from 'react';
import { Menu, Search, Plus, Lock, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ActiveView } from './Sidebar';

interface HeaderProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  onOpenAddModal: () => void;
  onToggleMobileMenu: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  setActiveView,
  onOpenAddModal,
  onToggleMobileMenu,
  searchQuery,
  setSearchQuery,
}) => {
  const { lockVault, isVaultLocked } = useAuth();

  const viewTitles: Record<ActiveView, { title: string; subtitle: string }> = {
    dashboard: { title: 'Executive Dashboard', subtitle: 'Overview & Security Posture' },
    vault: { title: 'Primary Vault', subtitle: 'Encrypted Credential Repository' },
    search: { title: 'Vault Live Search', subtitle: 'Real-time multi-attribute query' },
    generator: { title: 'Password Generator', subtitle: 'Cryptographic Shannon Entropy' },
    folders: { title: 'Vault Folders', subtitle: 'Hierarchical categorization' },
    tags: { title: 'Classification Tags', subtitle: 'Color-coded security labels' },
    security: { title: 'Security Health Audit', subtitle: 'Entropy, weak & duplicate verification' },
    profile: { title: 'Security Profile', subtitle: 'Master key derivation parameters' },
    settings: { title: 'System Settings', subtitle: 'Zero-Knowledge & backend configuration' },
  };

  const current = viewTitles[activeView] || { title: 'Vault', subtitle: 'Secure Manager' };

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-slate-200 bg-white/95 backdrop-blur-xs px-4 lg:px-8 flex items-center justify-between">
      {/* Left: Mobile Toggle + Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="p-2 text-slate-600 hover:text-slate-900 border border-transparent hover:border-slate-200 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-base font-serif font-bold text-slate-900 tracking-tight">{current.title}</h2>
          <p className="text-xs text-slate-500 font-serif hidden sm:block">{current.subtitle}</p>
        </div>
      </div>

      {/* Middle/Right: Quick Search bar, Lock Vault, Add Credential */}
      <div className="flex items-center gap-3">
        {/* Search input in header */}
        <div className="relative hidden md:block w-64 lg:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search vault (Ctrl + K)..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (activeView !== 'search' && activeView !== 'vault') {
                setActiveView('vault');
              }
            }}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-900 font-serif"
          />
        </div>

        {/* Lock Vault Button */}
        <button
          onClick={lockVault}
          title={isVaultLocked ? 'Vault Locked' : 'Lock Vault Now'}
          className="p-2 text-slate-600 hover:text-slate-950 bg-white hover:bg-slate-50 border border-slate-300 transition-colors"
        >
          <Lock className="w-4 h-4 text-slate-700" />
        </button>

        {/* Add Credential Button */}
        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-blue-950 text-white text-xs font-serif font-semibold tracking-wider uppercase border border-slate-950 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Item</span>
        </button>
      </div>
    </header>
  );
};
