import React, { useState } from 'react';
import { FolderLock, Tag, Plus, Edit2, Trash2, Folder, Check } from 'lucide-react';
import { FolderItem, TagItem, CredentialItem } from '../../types';
import { foldersApi, tagsApi } from '../../api';
import { useToast } from '../../context/ToastContext';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { Modal } from '../common/Modal';

interface FoldersTagsViewProps {
  folders: FolderItem[];
  tags: TagItem[];
  credentials: CredentialItem[];
  onRefresh: () => void;
  initialTab?: 'folders' | 'tags';
}

export const FoldersTagsView: React.FC<FoldersTagsViewProps> = ({
  folders,
  tags,
  credentials,
  onRefresh,
  initialTab = 'folders',
}) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'folders' | 'tags'>(initialTab);

  // Folder modal state
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<FolderItem | null>(null);
  const [folderName, setFolderName] = useState('');

  // Tag modal state
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<TagItem | null>(null);
  const [tagName, setTagName] = useState('');
  const [tagColor, setTagColor] = useState('#1E3A8A');

  // Deletion confirm
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'folder' | 'tag'; item: any } | null>(null);

  const colorPresets = ['#1E3A8A', '#0F172A', '#047857', '#B45309', '#B91C1C', '#4338CA', '#0E7490', '#BE185D'];

  const getFolderCount = (folderId: number) => {
    return credentials.filter((c) => c.folder?.id === folderId).length;
  };

  const getTagCount = (tagId: number) => {
    return credentials.filter((c) => c.tags?.some((t) => t.id === tagId)).length;
  };

  const handleSaveFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim()) return;

    try {
      if (editingFolder) {
        await foldersApi.update(editingFolder.id, folderName.trim());
        showToast('Folder updated', 'success');
      } else {
        await foldersApi.create(folderName.trim());
        showToast('Folder created', 'success');
      }
      setIsFolderModalOpen(false);
      onRefresh();
    } catch {
      showToast('Failed to save folder', 'error');
    }
  };

  const handleSaveTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagName.trim()) return;

    try {
      if (editingTag) {
        await tagsApi.update(editingTag.id, tagName.trim(), tagColor);
        showToast('Tag updated', 'success');
      } else {
        await tagsApi.create(tagName.trim(), tagColor);
        showToast('Tag created', 'success');
      }
      setIsTagModalOpen(false);
      onRefresh();
    } catch {
      showToast('Failed to save tag', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    try {
      if (deleteTarget.type === 'folder') {
        await foldersApi.delete(deleteTarget.item.id);
        showToast(`Folder "${deleteTarget.item.name}" deleted`, 'success');
      } else {
        await tagsApi.delete(deleteTarget.item.id);
        showToast(`Tag "${deleteTarget.item.name}" deleted`, 'success');
      }
      setDeleteTarget(null);
      onRefresh();
    } catch {
      showToast(`Failed to delete ${deleteTarget.type}`, 'error');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 font-serif">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-slate-900 flex items-center gap-2">
            <FolderLock className="w-5 h-5 text-slate-700" />
            <span>Vault Organization</span>
          </h2>
          <p className="text-xs font-serif text-slate-500 mt-1">
            Organize credentials into hierarchical folders and classified security tags.
          </p>
        </div>

        {/* Sharp Rectangular Tab Switcher */}
        <div className="flex p-1 bg-slate-100 border border-slate-300">
          <button
            onClick={() => setActiveTab('folders')}
            className={`px-4 py-1.5 text-xs font-serif font-semibold uppercase tracking-wider transition-colors ${
              activeTab === 'folders'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Folders ({folders.length})
          </button>
          <button
            onClick={() => setActiveTab('tags')}
            className={`px-4 py-1.5 text-xs font-serif font-semibold uppercase tracking-wider transition-colors ${
              activeTab === 'tags'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tags ({tags.length})
          </button>
        </div>
      </div>

      {/* FOLDERS TAB */}
      {activeTab === 'folders' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-serif uppercase tracking-wider text-slate-600 font-semibold">Vault Folders</span>
            <button
              onClick={() => {
                setEditingFolder(null);
                setFolderName('');
                setIsFolderModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-blue-950 text-white text-xs font-serif font-semibold uppercase tracking-wider border border-slate-950 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Folder</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {folders.map((f) => (
              <div
                key={f.id}
                className="p-4 bg-white border border-slate-200 hover:border-slate-400 shadow-xs flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 text-slate-800 border border-slate-200">
                    <Folder className="w-5 h-5 text-slate-700" />
                  </div>
                  <div>
                    <h4 className="text-sm font-serif font-bold text-slate-900">{f.name}</h4>
                    <p className="text-[11px] text-slate-500 font-mono">
                      {getFolderCount(f.id)} credential{getFolderCount(f.id) !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setEditingFolder(f);
                      setFolderName(f.name);
                      setIsFolderModalOpen(true);
                    }}
                    className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget({ type: 'folder', item: f })}
                    className="p-1.5 text-slate-500 hover:text-rose-700 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAGS TAB */}
      {activeTab === 'tags' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-serif uppercase tracking-wider text-slate-600 font-semibold">Classification Tags</span>
            <button
              onClick={() => {
                setEditingTag(null);
                setTagName('');
                setTagColor('#1E3A8A');
                setIsTagModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-blue-950 text-white text-xs font-serif font-semibold uppercase tracking-wider border border-slate-950 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Tag</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {tags.map((t) => (
              <div
                key={t.id}
                className="p-3.5 bg-white border border-slate-200 hover:border-slate-400 shadow-xs flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-3.5 h-3.5 shrink-0 border border-slate-300"
                    style={{ backgroundColor: t.colorHex }}
                  />
                  <div>
                    <h4 className="text-xs font-serif font-bold text-slate-900">#{t.name}</h4>
                    <p className="text-[10px] text-slate-500 font-mono">
                      {getTagCount(t.id)} item{getTagCount(t.id) !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setEditingTag(t);
                      setTagName(t.name);
                      setTagColor(t.colorHex);
                      setIsTagModalOpen(true);
                    }}
                    className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget({ type: 'tag', item: t })}
                    className="p-1.5 text-slate-500 hover:text-rose-700 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Folder Modal */}
      <Modal
        isOpen={isFolderModalOpen}
        onClose={() => setIsFolderModalOpen(false)}
        title={editingFolder ? 'Edit Folder' : 'New Folder'}
        maxWidth="sm"
      >
        <form onSubmit={handleSaveFolder} className="space-y-4 font-serif">
          <div>
            <label className="block text-[11px] font-serif font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Folder Name
            </label>
            <input
              type="text"
              placeholder="e.g. Production Infrastructure"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 text-slate-900 text-xs font-serif focus:outline-none focus:border-blue-900"
              required
              autoFocus
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsFolderModalOpen(false)}
              className="px-3.5 py-2 text-xs font-serif font-semibold text-slate-600 hover:text-slate-900 uppercase tracking-wider transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 hover:bg-blue-950 text-white text-xs font-serif font-semibold uppercase tracking-wider border border-slate-950 transition-colors"
            >
              Save Folder
            </button>
          </div>
        </form>
      </Modal>

      {/* Tag Modal */}
      <Modal
        isOpen={isTagModalOpen}
        onClose={() => setIsTagModalOpen(false)}
        title={editingTag ? 'Edit Tag' : 'New Tag'}
        maxWidth="sm"
      >
        <form onSubmit={handleSaveTag} className="space-y-4 font-serif">
          <div>
            <label className="block text-[11px] font-serif font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Tag Name
            </label>
            <input
              type="text"
              placeholder="e.g. high-security"
              value={tagName}
              onChange={(e) => setTagName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 text-slate-900 text-xs font-serif focus:outline-none focus:border-blue-900"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-[11px] font-serif font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Color Accent
            </label>
            <div className="flex items-center gap-2">
              {colorPresets.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setTagColor(c)}
                  className="w-6 h-6 flex items-center justify-center border border-slate-300 transition-transform hover:scale-105"
                  style={{ backgroundColor: c }}
                >
                  {tagColor === c && <Check className="w-3.5 h-3.5 text-white" />}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsTagModalOpen(false)}
              className="px-3.5 py-2 text-xs font-serif font-semibold text-slate-600 hover:text-slate-900 uppercase tracking-wider transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 hover:bg-blue-950 text-white text-xs font-serif font-semibold uppercase tracking-wider border border-slate-950 transition-colors"
            >
              Save Tag
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title={`Delete ${deleteTarget?.type === 'folder' ? 'Folder' : 'Tag'}`}
        message={`Are you sure you want to remove "${deleteTarget?.item?.name}"? Associated credentials will not be deleted, but will be unassigned.`}
        confirmLabel="Delete"
        isDestructive={true}
      />
    </div>
  );
};
