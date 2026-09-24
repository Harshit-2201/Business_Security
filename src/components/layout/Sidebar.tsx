import React from 'react';
import {
  ShieldCheck,
  LayoutDashboard,
  KeyRound,
  PlusCircle,
  Search,
  Zap,
  FolderLock,
  Tag,
  ShieldAlert,
  User as UserIcon,
  Settings,
  LogOut,
  Lock,
  Unlock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export type ActiveView =
  | 'dashboard'
  | 'vault'
  | 'search'
  | 'generator'
  | 'security'
  | 'folders'
  | 'tags'
  | 'profile'
  | 'settings';

interface SidebarProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  onOpenAddModal: () => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  setActiveView,
  onOpenAddModal,
  isMobileOpen,
  setIsMobileOpen,
}) => {
  const { user, logout, isVaultLocked, lockVault } = useAuth();
  const { showToast } = useToast();

  const handleNavClick = (view: ActiveView) => {
    setActiveView(view);
    setIsMobileOpen(false);
  };

  const handleLockClick = async () => {
    await lockVault();
    showToast('Vault locked securely', 'info');
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'vault', label: 'My Vault', icon: KeyRound },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'generator', label: 'Password Generator', icon: Zap },
    { id: 'folders', label: 'Folders', icon: FolderLock },
    { id: 'tags', label: 'Tags', icon: Tag },
    { id: 'security', label: 'Security Dashboard', icon: ShieldAlert },
    { id: 'profile', label: 'Profile', icon: UserIcon },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const;

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-200 lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top: Logo & Quick Add */}
        <div>
          {/* Logo Header */}
          <div className="p-5 flex items-center justify-between border-b border-slate-200 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-slate-900 flex items-center justify-center text-white border border-slate-950">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base font-serif font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
                  FORTRESSPASS
                </h1>
                <p className="text-[10px] text-blue-900 font-mono tracking-widest uppercase">Zero-Knowledge</p>
              </div>
            </div>
          </div>

          {/* Quick Add CTA Button */}
          <div className="p-4">
            <button
              onClick={() => {
                onOpenAddModal();
                setIsMobileOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-900 hover:bg-blue-950 text-white text-xs font-semibold uppercase tracking-wider border border-slate-950 transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Credential</span>
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="px-2 space-y-0.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id as ActiveView)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-serif transition-colors text-left ${
                    isActive
                      ? 'bg-blue-50/80 text-blue-950 border-l-2 border-blue-900 font-bold'
                      : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100/70 border-l-2 border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-900' : 'text-slate-500'}`} />
                  <span className="tracking-wide">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Vault Status, User Card, Lock & Logout */}
        <div className="p-4 border-t border-slate-200 space-y-3 bg-slate-50/40">
          {/* Vault Lock Quick Toggle */}
          <button
            onClick={handleLockClick}
            className="w-full flex items-center justify-between px-3 py-2 bg-white border border-slate-300 hover:border-slate-400 text-xs text-slate-800 transition-colors"
          >
            <div className="flex items-center gap-2">
              {isVaultLocked ? (
                <Lock className="w-3.5 h-3.5 text-rose-600" />
              ) : (
                <Unlock className="w-3.5 h-3.5 text-emerald-600" />
              )}
              <span className="font-serif">{isVaultLocked ? 'Vault is Locked' : 'Vault is Decrypted'}</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono tracking-wider">LOCK</span>
          </button>

          {/* User Profile Info */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 bg-slate-200 border border-slate-300 flex items-center justify-center text-xs font-serif font-bold text-slate-800 shrink-0">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-serif font-bold text-slate-900 truncate">
                  {user?.username || 'Security User'}
                </p>
                <p className="text-[10px] text-slate-500 font-mono truncate">{user?.email || 'user@vault.io'}</p>
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={() => {
                logout();
                showToast('Logged out of session', 'info');
              }}
              title="Logout"
              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
