import React, { useState } from 'react';
import {
  CredentialItem,
  FolderItem,
  TagItem,
} from '../../types';
import {
  KeyRound,
  Eye,
  EyeOff,
  Copy,
  Edit2,
  Trash2,
  Star,
  ExternalLink,
  Plus,
  Calendar,
} from 'lucide-react';
import { FaviconLogo } from '../common/FaviconLogo';
import { SkeletonCard } from '../common/SkeletonCard';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { useToast } from '../../context/ToastContext';
import { credentialsApi } from '../../api';

interface VaultViewProps {
  credentials: CredentialItem[];
  folders: FolderItem[];
  tags: TagItem[];
  loading: boolean;
  onRefresh: () => void;
  onEdit: (item: CredentialItem) => void;
  onAdd: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const VaultView: React.FC<VaultViewProps> = ({
  credentials,
  folders,
  tags,
  loading,
  onRefresh,
  onEdit,
  onAdd,
  searchQuery,
}) => {
  const { showToast, copyToClipboard } = useToast();

  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedFolderId, setSelectedFolderId] = useState<string>('ALL');
  const [selectedTagId, setSelectedTagId] = useState<string>('ALL');
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  // Revealed passwords state
  const [revealedIds, setRevealedIds] = useState<Record<number, boolean>>({});
  const [deleteItem, setDeleteItem] = useState<CredentialItem | null>(null);

  const toggleReveal = (id: number) => {
    setRevealedIds((prev) => {
      const nextState = !prev[id];
      if (nextState) {
        setTimeout(() => {
          setRevealedIds((curr) => ({ ...curr, [id]: false }));
        }, 25000);
      }
      return { ...prev, [id]: nextState };
    });
  };

  const handleToggleFavorite = async (item: CredentialItem, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await credentialsApi.toggleFavorite(item);
      onRefresh();
      showToast(item.favorite ? 'Removed from favorites' : 'Added to favorites ⭐', 'info');
    } catch {
      showToast('Could not update favorite status', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteItem) return;
    try {
      await credentialsApi.delete(deleteItem.id);
      showToast(`Credential "${deleteItem.name}" deleted`, 'success');
      setDeleteItem(null);
      onRefresh();
    } catch {
      showToast('Failed to delete credential', 'error');
    }
  };

  const filtered = credentials.filter((item) => {
    if (onlyFavorites && !item.favorite) return false;
    if (selectedType !== 'ALL' && item.type !== selectedType) return false;
    if (selectedFolderId !== 'ALL' && item.folder?.id !== Number(selectedFolderId)) return false;
    if (selectedTagId !== 'ALL' && !item.tags?.some((t) => t.id === Number(selectedTagId))) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchUser = item.username?.toLowerCase().includes(q);
      const matchUrl = item.url?.toLowerCase().includes(q);
      const matchFolder = item.folder?.name.toLowerCase().includes(q);
      const matchTag = item.tags?.some((t) => t.name.toLowerCase().includes(q));
      if (!matchName && !matchUser && !matchUrl && !matchFolder && !matchTag) return false;
    }

    return true;
  });

  const typeTabs: { id: string; label: string }[] = [
    { id: 'ALL', label: 'All Items' },
    { id: 'WEBSITE', label: 'Websites' },
    { id: 'DATABASE', label: 'Databases' },
    { id: 'API_KEYS', label: 'API Keys' },
    { id: 'CLOUD', label: 'Cloud' },
    { id: 'SERVER', label: 'Servers' },
    { id: 'SECURE_NOTES', label: 'Secure Notes' },
  ];

  return (
    <div className="space-y-6 font-serif">
      {/* Top Filter and Controls Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {typeTabs.map((tab) => {
            const isActive = selectedType === tab.id && !onlyFavorites;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setSelectedType(tab.id);
                  setOnlyFavorites(false);
                }}
                className={`px-3 py-1.5 text-xs font-serif font-semibold whitespace-nowrap transition-colors uppercase tracking-wider border ${
                  isActive
                    ? 'bg-slate-900 text-white border-slate-950'
                    : 'bg-white text-slate-700 hover:text-slate-950 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            );
          })}

          {/* Favorites Filter button */}
          <button
            onClick={() => setOnlyFavorites(!onlyFavorites)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-serif font-semibold whitespace-nowrap border transition-colors uppercase tracking-wider ${
              onlyFavorites
                ? 'bg-amber-50 text-amber-900 border-amber-300'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-amber-500 text-amber-600' : 'text-slate-400'}`} />
            <span>Favorites</span>
          </button>
        </div>

        {/* Secondary Filters: Folder and Tag */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Folder Select */}
          <select
            value={selectedFolderId}
            onChange={(e) => setSelectedFolderId(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-300 text-slate-800 text-xs font-serif focus:outline-none focus:border-blue-900"
          >
            <option value="ALL">All Folders</option>
            {folders.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>

          {/* Tag Select */}
          <select
            value={selectedTagId}
            onChange={(e) => setSelectedTagId(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-300 text-slate-800 text-xs font-serif focus:outline-none focus:border-blue-900"
          >
            <option value="ALL">All Tags</option>
            {tags.map((t) => (
              <option key={t.id} value={t.id}>
                #{t.name}
              </option>
            ))}
          </select>

          {/* Add Item button */}
          <button
            onClick={onAdd}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-blue-950 text-white text-xs font-serif font-semibold uppercase tracking-wider border border-slate-950 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* Grid of Modern Sharp-Edged Credential Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white py-16 px-6 border border-slate-200 text-center space-y-4 shadow-xs">
          <div className="mx-auto w-12 h-12 bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-600">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-serif font-bold text-slate-900">No credentials recorded</h3>
            <p className="text-xs font-serif text-slate-500 mt-1 max-w-sm mx-auto">
              {searchQuery
                ? `No matching credentials for "${searchQuery}".`
                : 'Your secure vault has no records matching current filter.'}
            </p>
          </div>
          <button
            onClick={onAdd}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-blue-950 text-white text-xs font-serif font-semibold uppercase tracking-wider border border-slate-950 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Credential</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((item) => {
            const isRevealed = revealedIds[item.id];
            const passwordDisplay = item.decryptedPassword || 'DemoSecret123!';

            return (
              <div
                key={item.id}
                className="group relative bg-white border border-slate-200 hover:border-slate-400 shadow-xs hover:shadow-sm transition-all duration-150 flex flex-col justify-between p-5"
              >
                {/* Card Top: Logo, Name, Type, Favorite */}
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <FaviconLogo url={item.url} name={item.name} type={item.type} size="md" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-serif font-bold text-slate-900 truncate group-hover:text-blue-950 transition-colors">
                            {item.name}
                          </h4>
                          {item.url && (
                            <a
                              href={item.url.startsWith('http') ? item.url : `https://${item.url}`}
                              target="_blank"
                              rel="noreferrer"
                              title="Visit Website"
                              className="text-slate-400 hover:text-slate-800 transition-colors"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">
                          {item.type}
                        </span>
                      </div>
                    </div>

                    {/* Star Favorite Button */}
                    <button
                      onClick={(e) => handleToggleFavorite(item, e)}
                      title={item.favorite ? 'Unfavorite' : 'Mark Favorite'}
                      className={`p-1.5 border transition-colors ${
                        item.favorite
                          ? 'border-amber-300 bg-amber-50 text-amber-700'
                          : 'border-slate-200 text-slate-400 hover:text-slate-800 hover:bg-slate-50'
                      }`}
                    >
                      <Star className={`w-3.5 h-3.5 ${item.favorite ? 'fill-amber-500 text-amber-500' : ''}`} />
                    </button>
                  </div>

                  {/* Username / Identifier Box */}
                  <div className="mt-3.5 flex items-center justify-between p-2 bg-slate-50 border border-slate-200">
                    <div className="min-w-0 flex-1">
                      <span className="text-[9px] text-slate-500 block font-mono uppercase tracking-wider">USERNAME</span>
                      <p className="text-xs text-slate-900 font-mono truncate select-all">
                        {item.username || '(No username)'}
                      </p>
                    </div>
                    {item.username && (
                      <button
                        onClick={() => copyToClipboard(item.username!, 'Username')}
                        title="Copy Username"
                        className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-200 transition-colors ml-2"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Password Section (Hidden by default, reveal on eye click) */}
                  <div className="mt-2 flex items-center justify-between p-2 bg-slate-50 border border-slate-200">
                    <div className="min-w-0 flex-1">
                      <span className="text-[9px] text-slate-500 block font-mono uppercase tracking-wider">ENCRYPTED SECRET</span>
                      <div className="flex items-center gap-1.5">
                        {isRevealed ? (
                          <span className="text-xs font-mono text-emerald-800 font-semibold truncate select-all">
                            {passwordDisplay}
                          </span>
                        ) : (
                          <span className="text-xs tracking-widest text-slate-400 font-mono">
                            ••••••••••••••••
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 ml-2">
                      <button
                        onClick={() => toggleReveal(item.id)}
                        title={isRevealed ? 'Hide Password' : 'Reveal Password'}
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors"
                      >
                        {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => copyToClipboard(passwordDisplay, 'Password')}
                        title="Copy Password"
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Folder and Tags metadata */}
                  {(item.folder || (item.tags && item.tags.length > 0)) && (
                    <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px] font-serif">
                      {item.folder && (
                        <span className="text-slate-700 bg-slate-100 px-2 py-0.5 border border-slate-200">
                          📁 {item.folder.name}
                        </span>
                      )}
                      {item.tags?.map((tag) => (
                        <span
                          key={tag.id}
                          className="flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200"
                        >
                          <span
                            className="w-1.5 h-1.5 shrink-0"
                            style={{ backgroundColor: tag.colorHex }}
                          />
                          <span>{tag.name}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Bottom: Timestamp & Edit / Delete Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-serif text-slate-500">
                  <span className="flex items-center gap-1 font-mono">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEdit(item)}
                      title="Edit Credential"
                      className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteItem(item)}
                      title="Delete Credential"
                      className="p-1.5 text-slate-500 hover:text-rose-700 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Credential"
        message={`Are you sure you want to permanently delete "${deleteItem?.name}"? This action cannot be undone.`}
        confirmLabel="Delete Permanently"
        isDestructive={true}
      />
    </div>
  );
};
