import React, { useState } from 'react';
import { Search, Filter, Copy, Eye, EyeOff } from 'lucide-react';
import { CredentialItem, FolderItem, TagItem } from '../../types';
import { FaviconLogo } from '../common/FaviconLogo';
import { useToast } from '../../context/ToastContext';

interface SearchViewProps {
  credentials: CredentialItem[];
  folders: FolderItem[];
  tags: TagItem[];
  onEditCredential: (item: CredentialItem) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const SearchView: React.FC<SearchViewProps> = ({
  credentials,
  folders,
  tags,
  onEditCredential,
  searchQuery,
  setSearchQuery,
}) => {
  const { copyToClipboard } = useToast();
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterFolderId, setFilterFolderId] = useState<string>('ALL');
  const [filterTag, setFilterTag] = useState<string>('ALL');
  const [revealedIds, setRevealedIds] = useState<Record<number, boolean>>({});

  const toggleReveal = (id: number) => {
    setRevealedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const results = credentials.filter((item) => {
    if (filterType !== 'ALL' && item.type !== filterType) return false;
    if (filterFolderId !== 'ALL' && item.folder?.id !== Number(filterFolderId)) return false;
    if (filterTag !== 'ALL' && !item.tags?.some((t) => t.name.toLowerCase() === filterTag.toLowerCase())) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchName = item.name.toLowerCase().includes(q);
    const matchUser = item.username?.toLowerCase().includes(q);
    const matchUrl = item.url?.toLowerCase().includes(q);
    const matchFolder = item.folder?.name.toLowerCase().includes(q);
    const matchNotes = item.notes?.toLowerCase().includes(q);
    const matchTag = item.tags?.some((t) => t.name.toLowerCase().includes(q));

    return matchName || matchUser || matchUrl || matchFolder || matchNotes || matchTag;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6 font-serif">
      <div>
        <h2 className="text-xl font-serif font-bold text-slate-900 flex items-center gap-2">
          <Search className="w-5 h-5 text-slate-700" />
          <span>Vault Live Search</span>
        </h2>
        <p className="text-xs font-serif text-slate-500 mt-1">
          Instant multi-attribute search across application names, usernames, domains, folders, and tags.
        </p>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by application, username, URL, folder, or classification tag..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          autoFocus
          className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 text-xs font-serif focus:outline-none focus:border-blue-900 shadow-xs"
        />
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-2.5 p-3 bg-slate-50 border border-slate-200">
        <span className="text-xs font-serif font-semibold text-slate-700 flex items-center gap-1.5 px-2 uppercase tracking-wider">
          <Filter className="w-3.5 h-3.5" />
          <span>Filters:</span>
        </span>

        {/* Type filter */}
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-1.5 bg-white border border-slate-300 text-slate-800 text-xs font-serif focus:outline-none focus:border-blue-900"
        >
          <option value="ALL">All Types</option>
          <option value="WEBSITE">Websites</option>
          <option value="DATABASE">Databases</option>
          <option value="API_KEYS">API Keys</option>
          <option value="CLOUD">Cloud</option>
          <option value="SERVER">Servers</option>
          <option value="SECURE_NOTES">Secure Notes</option>
        </select>

        {/* Folder filter */}
        <select
          value={filterFolderId}
          onChange={(e) => setFilterFolderId(e.target.value)}
          className="px-3 py-1.5 bg-white border border-slate-300 text-slate-800 text-xs font-serif focus:outline-none focus:border-blue-900"
        >
          <option value="ALL">All Folders</option>
          {folders.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>

        {/* Tag filter */}
        <select
          value={filterTag}
          onChange={(e) => setFilterTag(e.target.value)}
          className="px-3 py-1.5 bg-white border border-slate-300 text-slate-800 text-xs font-serif focus:outline-none focus:border-blue-900"
        >
          <option value="ALL">All Tags</option>
          {tags.map((t) => (
            <option key={t.id} value={t.name}>
              #{t.name}
            </option>
          ))}
        </select>

        <span className="ml-auto text-xs text-slate-500 font-mono pr-2">
          {results.length} record{results.length !== 1 ? 's' : ''} found
        </span>
      </div>

      {/* Results List */}
      <div className="space-y-3">
        {results.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs bg-white border border-slate-200">
            No credentials matched your search criteria.
          </div>
        ) : (
          results.map((item) => {
            const isRevealed = revealedIds[item.id];
            const passwordDisplay = item.decryptedPassword || 'DemoSecret123!';

            return (
              <div
                key={item.id}
                className="p-4 bg-white border border-slate-200 hover:border-slate-400 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors"
              >
                <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                  <FaviconLogo url={item.url} name={item.name} type={item.type} size="md" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-serif font-bold text-slate-900 truncate">{item.name}</h4>
                      <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">
                        {item.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 font-mono mt-0.5 truncate">
                      {item.username || '(No username)'}
                    </p>
                    {item.folder && (
                      <span className="text-[11px] text-slate-500 mt-1 inline-block">
                        📁 {item.folder.name}
                      </span>
                    )}
                  </div>
                </div>

                {/* Password & Quick Actions */}
                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 flex items-center gap-2 text-xs font-mono">
                    {isRevealed ? (
                      <span className="text-emerald-800 font-semibold">{passwordDisplay}</span>
                    ) : (
                      <span className="tracking-widest text-slate-400">••••••••••</span>
                    )}
                    <button
                      onClick={() => toggleReveal(item.id)}
                      className="p-1 text-slate-400 hover:text-slate-800"
                    >
                      {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => copyToClipboard(passwordDisplay, 'Password')}
                      className="p-1 text-slate-400 hover:text-slate-800"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => onEditCredential(item)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-serif font-semibold border border-slate-300 transition-colors uppercase tracking-wider"
                  >
                    Edit
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
