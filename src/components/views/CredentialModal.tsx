import React, { useState, useEffect } from 'react';
import {
  Modal
} from '../common/Modal';
import {
  CredentialItem,
  CredentialFormData,
  CredentialType,
  FolderItem,
  TagItem,
} from '../../types';
import { Eye, EyeOff, Sparkles, Check } from 'lucide-react';
import { passwordApi } from '../../api';
import { useToast } from '../../context/ToastContext';

interface CredentialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CredentialFormData, editId?: number) => Promise<void>;
  editItem?: CredentialItem | null;
  folders: FolderItem[];
  tags: TagItem[];
}

export const CredentialModal: React.FC<CredentialModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editItem,
  folders,
  tags,
}) => {
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [type, setType] = useState<CredentialType>('WEBSITE');
  const [url, setUrl] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [folderId, setFolderId] = useState<number | undefined>(undefined);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [notes, setNotes] = useState('');
  const [favorite, setFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (editItem) {
      setName(editItem.name || '');
      setType(editItem.type || 'WEBSITE');
      setUrl(editItem.url || '');
      setUsername(editItem.username || '');
      setPassword(editItem.decryptedPassword || '');
      setFolderId(editItem.folder?.id);
      setSelectedTagIds(editItem.tags?.map((t) => t.id) || []);
      setNotes(editItem.notes || '');
      setFavorite(editItem.favorite || false);
    } else {
      setName('');
      setType('WEBSITE');
      setUrl('');
      setUsername('');
      setPassword('');
      setFolderId(folders.length > 0 ? folders[0].id : undefined);
      setSelectedTagIds([]);
      setNotes('');
      setFavorite(false);
    }
  }, [editItem, isOpen, folders]);

  const handleGeneratePassword = async () => {
    setGenerating(true);
    try {
      const res = await passwordApi.generate({
        length: 20,
        uppercase: true,
        lowercase: true,
        numbers: true,
        symbols: true,
        excludeAmbiguous: true,
      });
      setPassword(res.password);
      setShowPassword(true);
      showToast('Generated cryptographically strong password', 'info');
    } catch {
      showToast('Could not generate password', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handleTagToggle = (tagId: number) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Application Name is required', 'error');
      return;
    }
    setLoading(true);
    try {
      await onSave(
        {
          name: name.trim(),
          type,
          url: url.trim(),
          username: username.trim(),
          password,
          folderId: folderId || undefined,
          tagIds: selectedTagIds,
          notes: notes.trim(),
          favorite,
        },
        editItem?.id
      );
      onClose();
    } catch {
      showToast('Failed to save credential', 'error');
    } finally {
      setLoading(false);
    }
  };

  const credentialTypes: { label: string; value: CredentialType }[] = [
    { label: 'Website Login', value: 'WEBSITE' },
    { label: 'Database Credentials', value: 'DATABASE' },
    { label: 'API / Secret Keys', value: 'API_KEYS' },
    { label: 'Cloud Provider', value: 'CLOUD' },
    { label: 'Server / SSH', value: 'SERVER' },
    { label: 'Secure Note', value: 'SECURE_NOTES' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editItem ? 'Edit Credential' : 'Add New Credential'}
      subtitle="Encrypted with AES-256-GCM before saving to backend repository"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 font-serif">
        {/* Name and Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-serif font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Application Name <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. GitHub Enterprise, AWS Console"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 text-slate-900 text-xs font-serif focus:outline-none focus:border-blue-900"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-serif font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Credential Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as CredentialType)}
              className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 text-xs font-serif focus:outline-none focus:border-blue-900"
            >
              {credentialTypes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Website URL */}
        {type !== 'SECURE_NOTES' && (
          <div>
            <label className="block text-[11px] font-serif font-semibold text-slate-700 uppercase tracking-wider mb-1">
              {type === 'SERVER' ? 'Host / Connection String' : 'Website or Service URL'}
            </label>
            <input
              type="text"
              placeholder="https://example.com/login"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 text-slate-900 text-xs font-serif focus:outline-none focus:border-blue-900"
            />
          </div>
        )}

        {/* Username */}
        <div>
          <label className="block text-[11px] font-serif font-semibold text-slate-700 uppercase tracking-wider mb-1">
            {type === 'API_KEYS' ? 'Key Identifier / Name' : 'Username or Email'}
          </label>
          <input
            type="text"
            placeholder="user@company.com"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 text-slate-900 text-xs font-serif focus:outline-none focus:border-blue-900"
          />
        </div>

        {/* Password / Secret */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[11px] font-serif font-semibold text-slate-700 uppercase tracking-wider">
              {type === 'API_KEYS' ? 'Secret Key / Token' : type === 'SECURE_NOTES' ? 'Confidential Content' : 'Password'}
            </label>
            <button
              type="button"
              onClick={handleGeneratePassword}
              disabled={generating}
              className="flex items-center gap-1 text-[11px] text-blue-900 hover:text-blue-700 font-semibold uppercase tracking-wider"
            >
              <Sparkles className="w-3 h-3" />
              <span>Generate Random</span>
            </button>
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter or generate secret..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-3 pr-10 py-2 bg-slate-50 border border-slate-300 text-slate-900 font-mono text-xs focus:outline-none focus:border-blue-900"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Folder Selection & Favorite */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-serif font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Folder
            </label>
            <select
              value={folderId || ''}
              onChange={(e) => setFolderId(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 text-xs font-serif focus:outline-none focus:border-blue-900"
            >
              <option value="">(No Folder)</option>
              {folders.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col justify-end">
            <label className="flex items-center gap-2 cursor-pointer py-2">
              <input
                type="checkbox"
                checked={favorite}
                onChange={(e) => setFavorite(e.target.checked)}
                className="w-4 h-4 text-blue-900 border-slate-300 focus:ring-0"
              />
              <span className="text-xs font-serif font-medium text-slate-800">Mark as Favorite ⭐</span>
            </label>
          </div>
        </div>

        {/* Tags Selection */}
        {tags.length > 0 && (
          <div>
            <label className="block text-[11px] font-serif font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Classification Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => {
                const isSelected = selectedTagIds.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => handleTagToggle(tag.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-serif border transition-colors ${
                      isSelected
                        ? 'border-blue-900 bg-blue-50 text-blue-950 font-bold'
                        : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span
                      className="w-2 h-2 shrink-0"
                      style={{ backgroundColor: tag.colorHex }}
                    />
                    <span>{tag.name}</span>
                    {isSelected && <Check className="w-3 h-3 text-blue-900" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="block text-[11px] font-serif font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Secure Notes & Instructions
          </label>
          <textarea
            rows={3}
            placeholder="Additional details, recovery codes, IP whitelists..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 text-slate-900 text-xs font-serif focus:outline-none focus:border-blue-900 resize-none"
          />
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-serif font-semibold text-slate-600 hover:text-slate-900 uppercase tracking-wider transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 text-xs font-serif font-semibold bg-slate-900 hover:bg-blue-950 text-white uppercase tracking-wider border border-slate-950 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <span>Saving to Vault...</span>
            ) : (
              <span>{editItem ? 'Save Changes' : 'Create Credential'}</span>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
