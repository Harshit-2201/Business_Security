import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { Sidebar, ActiveView } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { LockScreenModal } from './components/common/LockScreenModal';
import { CredentialModal } from './components/views/CredentialModal';
import { SplashScreen } from './components/views/SplashScreen';
import { AuthView } from './components/views/AuthView';
import { DashboardView } from './components/views/DashboardView';
import { VaultView } from './components/views/VaultView';
import { SearchView } from './components/views/SearchView';
import { PasswordGeneratorView } from './components/views/PasswordGeneratorView';
import { SecurityDashboardView } from './components/views/SecurityDashboardView';
import { FoldersTagsView } from './components/views/FoldersTagsView';
import { SettingsView } from './components/views/SettingsView';
import { ProfileView } from './components/views/ProfileView';

import {
  CredentialItem,
  CredentialFormData,
  FolderItem,
  TagItem,
  VaultHealthStats,
} from './types';
import { credentialsApi, foldersApi, tagsApi } from './api';

const PasswordManagerContent: React.FC = () => {
  const { isAuthenticated, isVaultLocked } = useAuth();
  const { showToast } = useToast();

  const [hasVisited, setHasVisited] = useState(() => localStorage.getItem('fortress_visited') === 'true');
  const [showSplash, setShowSplash] = useState(() => !hasVisited && !localStorage.getItem('token'));
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Data states
  const [credentials, setCredentials] = useState<CredentialItem[]>([]);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [tags, setTags] = useState<TagItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Credential Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCredential, setEditingCredential] = useState<CredentialItem | null>(null);

  // Load all records from backend
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [credsData, foldersData, tagsData] = await Promise.all([
        credentialsApi.getAll(),
        foldersApi.getAll(),
        tagsApi.getAll(),
      ]);
      setCredentials(credsData);
      setFolders(foldersData);
      setTags(tagsData);
    } catch {
      showToast('Failed to sync vault records', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, loadData]);

  // Compute live security posture stats
  const computeStats = (): VaultHealthStats => {
    const total = credentials.length;
    const favorites = credentials.filter((c) => c.favorite).length;

    let weakCount = 0;
    const passwordMap = new Map<string, number>();

    const now = Date.now();
    const ninetyDaysMs = 90 * 24 * 60 * 60 * 1000;
    let oldCount = 0;

    credentials.forEach((c) => {
      const pwd = c.decryptedPassword || '';
      if (pwd) {
        if (
          pwd.length < 10 ||
          !/[A-Z]/.test(pwd) ||
          !/[0-9]/.test(pwd) ||
          !/[^A-Za-z0-9]/.test(pwd)
        ) {
          weakCount++;
        }
        passwordMap.set(pwd, (passwordMap.get(pwd) || 0) + 1);
      }
      const ts = c.passwordUpdated
        ? new Date(c.passwordUpdated).getTime()
        : new Date(c.createdAt).getTime();
      if (now - ts > ninetyDaysMs) {
        oldCount++;
      }
    });

    let duplicateCount = 0;
    passwordMap.forEach((count) => {
      if (count > 1) duplicateCount += count;
    });

    let score = 100;
    if (total > 0) {
      const weakPenalty = (weakCount / total) * 35;
      const dupPenalty = (duplicateCount / total) * 35;
      const oldPenalty = (oldCount / total) * 15;
      score = Math.max(20, Math.round(100 - weakPenalty - dupPenalty - oldPenalty));
    }

    return {
      total,
      favorites,
      weakCount,
      duplicateCount,
      oldCount,
      securityScore: score,
    };
  };

  const stats = computeStats();

  const handleSaveCredential = async (data: CredentialFormData, editId?: number) => {
    if (editId) {
      await credentialsApi.update(editId, data);
      showToast('Credential updated in vault', 'success');
    } else {
      await credentialsApi.create(data);
      showToast('New credential securely saved', 'success');
    }
    loadData();
  };

  const handleOpenAdd = () => {
    setEditingCredential(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (item: CredentialItem) => {
    setEditingCredential(item);
    setIsAddModalOpen(true);
  };

  // 1. Splash Screen
  if (showSplash) {
    return (
      <SplashScreen
        onGetStarted={() => {
          localStorage.setItem('fortress_visited', 'true');
          setHasVisited(true);
          setShowSplash(false);
        }}
        onSignIn={() => {
          localStorage.setItem('fortress_visited', 'true');
          setHasVisited(true);
          setShowSplash(false);
        }}
      />
    );
  }

  // 2. Authentication View (if not logged in)
  if (!isAuthenticated) {
    return <AuthView onSuccess={() => loadData()} />;
  }

  // 3. Authenticated App Layout
  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 flex flex-col antialiased font-serif">
      {/* Sidebar Navigation */}
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        onOpenAddModal={handleOpenAdd}
        isMobileOpen={isMobileMenuOpen}
        setIsMobileOpen={setIsMobileMenuOpen}
      />

      {/* Main View Area */}
      <div className="lg:pl-64 flex flex-col flex-1 min-h-screen">
        <Header
          activeView={activeView}
          setActiveView={setActiveView}
          onOpenAddModal={handleOpenAdd}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeView === 'dashboard' && (
            <DashboardView
              credentials={credentials}
              stats={stats}
              onOpenAddModal={handleOpenAdd}
              setActiveView={setActiveView}
              onEditCredential={handleOpenEdit}
            />
          )}

          {activeView === 'vault' && (
            <VaultView
              credentials={credentials}
              folders={folders}
              tags={tags}
              loading={loading}
              onRefresh={loadData}
              onEdit={handleOpenEdit}
              onAdd={handleOpenAdd}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          )}

          {activeView === 'search' && (
            <SearchView
              credentials={credentials}
              folders={folders}
              tags={tags}
              onEditCredential={handleOpenEdit}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          )}

          {activeView === 'generator' && <PasswordGeneratorView />}

          {activeView === 'security' && (
            <SecurityDashboardView
              credentials={credentials}
              stats={stats}
              onEditCredential={handleOpenEdit}
              onOpenGenerator={() => setActiveView('generator')}
            />
          )}

          {activeView === 'folders' && (
            <FoldersTagsView
              folders={folders}
              tags={tags}
              credentials={credentials}
              onRefresh={loadData}
              initialTab="folders"
            />
          )}

          {activeView === 'tags' && (
            <FoldersTagsView
              folders={folders}
              tags={tags}
              credentials={credentials}
              onRefresh={loadData}
              initialTab="tags"
            />
          )}

          {activeView === 'profile' && <ProfileView credentials={credentials} />}

          {activeView === 'settings' && <SettingsView credentials={credentials} />}
        </main>
      </div>

      {/* Lock Screen Modal: Blocks access if user locks vault */}
      <LockScreenModal />

      {/* Add / Edit Credential Modal */}
      <CredentialModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingCredential(null);
        }}
        onSave={handleSaveCredential}
        editItem={editingCredential}
        folders={folders}
        tags={tags}
      />
    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <PasswordManagerContent />
      </AuthProvider>
    </ToastProvider>
  );
}
