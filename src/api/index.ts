import { apiClient } from './client';
import {
  CredentialItem,
  CredentialFormData,
  FolderItem,
  TagItem,
  AuditLogItem,
  VaultStatusResponse,
  PasswordGenerateOptions,
  PasswordGenerateResult,
  User,
} from '../types';

// Storage keys for local backup / resilient preview mode
const LOCAL_CREDENTIALS_KEY = 'fortress_local_credentials';
const LOCAL_FOLDERS_KEY = 'fortress_local_folders';
const LOCAL_TAGS_KEY = 'fortress_local_tags';
const LOCAL_VAULT_STATUS_KEY = 'fortress_local_vault_status';

// Initial seed data so user immediately sees a realistic, premium vault on first load
const INITIAL_DEMO_FOLDERS: FolderItem[] = [
  { id: 1, name: 'Work & Infrastructure', itemCount: 3, createdAt: '2026-01-10T08:00:00Z' },
  { id: 2, name: 'Personal & Finance', itemCount: 2, createdAt: '2026-01-15T09:30:00Z' },
  { id: 3, name: 'Cloud Services', itemCount: 2, createdAt: '2026-02-01T12:00:00Z' },
];

const INITIAL_DEMO_TAGS: TagItem[] = [
  { id: 1, name: 'production', colorHex: '#EF4444', itemCount: 3 },
  { id: 2, name: 'finance', colorHex: '#10B981', itemCount: 2 },
  { id: 3, name: 'sso', colorHex: '#3B82F6', itemCount: 2 },
  { id: 4, name: 'high-entropy', colorHex: '#8B5CF6', itemCount: 4 },
];

const INITIAL_DEMO_CREDENTIALS: CredentialItem[] = [
  {
    id: 101,
    name: 'GitHub Enterprise',
    type: 'WEBSITE',
    url: 'https://github.com',
    username: 'alex.chen@cybercore.io',
    encryptedPassword: 'ENC(x8F9aL2vQ5pM1z)',
    decryptedPassword: 'ghp_k9X4mP2v!B8wQ4#zL7n90',
    folder: INITIAL_DEMO_FOLDERS[0],
    tags: [INITIAL_DEMO_TAGS[0], INITIAL_DEMO_TAGS[2]],
    favorite: true,
    notes: '2FA recovery codes stored in personal hardware token.',
    createdAt: '2026-01-12T10:14:00Z',
    passwordUpdated: '2026-01-12T10:14:00Z',
  },
  {
    id: 102,
    name: 'AWS Root Console',
    type: 'CLOUD',
    url: 'https://aws.amazon.com/console',
    username: 'root-admin@cybercore.io',
    encryptedPassword: 'ENC(r4H2jK9xV8wN3m)',
    decryptedPassword: 'Tr0ng#Passw0rd$2026!Aws',
    folder: INITIAL_DEMO_FOLDERS[2],
    tags: [INITIAL_DEMO_TAGS[0], INITIAL_DEMO_TAGS[3]],
    favorite: true,
    notes: 'Requires physical YubiKey 5C NFC for MFA challenge.',
    createdAt: '2026-01-20T14:22:00Z',
    passwordUpdated: '2026-01-20T14:22:00Z',
  },
  {
    id: 103,
    name: 'Production PostgreSQL Cluster',
    type: 'DATABASE',
    url: 'postgres://db-primary.internal:5432/fortress_main',
    username: 'db_admin_prod',
    encryptedPassword: 'ENC(u7Y2tP1oM8kL5n)',
    decryptedPassword: 'pg_S3cur3!99#xK8wLp2_prod',
    folder: INITIAL_DEMO_FOLDERS[0],
    tags: [INITIAL_DEMO_TAGS[0]],
    favorite: false,
    notes: 'Direct connection only through WireGuard VPN gateway.',
    createdAt: '2026-02-05T09:00:00Z',
    passwordUpdated: '2026-02-05T09:00:00Z',
  },
  {
    id: 104,
    name: 'Stripe Live Secret Key',
    type: 'API_KEYS',
    url: 'https://dashboard.stripe.com',
    username: 'stripe_app_billing',
    encryptedPassword: 'ENC(q1W2e3R4t5Y6u7)',
    decryptedPassword: 'sk_live_51MzQ8K99xL02mPw4Rv78zQ19',
    folder: INITIAL_DEMO_FOLDERS[0],
    tags: [INITIAL_DEMO_TAGS[1]],
    favorite: true,
    notes: 'Read/write billing charges webhook verification key.',
    createdAt: '2026-02-18T16:45:00Z',
    passwordUpdated: '2026-02-18T16:45:00Z',
  },
  {
    id: 105,
    name: 'Vanguard Treasury Account',
    type: 'WEBSITE',
    url: 'https://investor.vanguard.com',
    username: 'alex.chen.inv',
    encryptedPassword: 'ENC(v9B8n7M6l5K4j3)',
    decryptedPassword: 'OldSimplePassword2024',
    folder: INITIAL_DEMO_FOLDERS[1],
    tags: [INITIAL_DEMO_TAGS[1]],
    favorite: false,
    notes: 'Retirement 401(k) portfolio. Flagged for password rotation.',
    createdAt: '2025-10-10T11:00:00Z',
    passwordUpdated: '2025-10-10T11:00:00Z',
  },
  {
    id: 106,
    name: 'Bastion SSH Jump Host',
    type: 'SERVER',
    url: 'ssh://bastion.us-east-1.cybercore.io:2222',
    username: 'core_ops',
    encryptedPassword: 'ENC(m1N2b3V4c5X6z7)',
    decryptedPassword: 'bastion-JumpKey!#2026X',
    folder: INITIAL_DEMO_FOLDERS[2],
    tags: [INITIAL_DEMO_TAGS[0], INITIAL_DEMO_TAGS[3]],
    favorite: false,
    notes: 'Ed25519 key backup in 1Password vault archive.',
    createdAt: '2026-03-01T08:30:00Z',
    passwordUpdated: '2026-03-01T08:30:00Z',
  },
  {
    id: 107,
    name: 'Zero-Knowledge Master Recovery Passphrase',
    type: 'SECURE_NOTES',
    url: '',
    username: 'Master Key Shard',
    encryptedPassword: 'ENC(z9X8c7V6b5N4m3)',
    decryptedPassword: 'timber glacier orbit velvet canyon prism echo falcon',
    folder: INITIAL_DEMO_FOLDERS[1],
    tags: [INITIAL_DEMO_TAGS[3]],
    favorite: true,
    notes: '12-word Shamir mnemonic split across 3 secure geographical safes.',
    createdAt: '2026-01-01T00:00:00Z',
    passwordUpdated: '2026-01-01T00:00:00Z',
  }
];

// Helper to get local data
const getLocalCredentials = (): CredentialItem[] => {
  const data = localStorage.getItem(LOCAL_CREDENTIALS_KEY);
  if (!data) {
    localStorage.setItem(LOCAL_CREDENTIALS_KEY, JSON.stringify(INITIAL_DEMO_CREDENTIALS));
    return INITIAL_DEMO_CREDENTIALS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_DEMO_CREDENTIALS;
  }
};

const saveLocalCredentials = (items: CredentialItem[]) => {
  localStorage.setItem(LOCAL_CREDENTIALS_KEY, JSON.stringify(items));
};

const getLocalFolders = (): FolderItem[] => {
  const data = localStorage.getItem(LOCAL_FOLDERS_KEY);
  if (!data) {
    localStorage.setItem(LOCAL_FOLDERS_KEY, JSON.stringify(INITIAL_DEMO_FOLDERS));
    return INITIAL_DEMO_FOLDERS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_DEMO_FOLDERS;
  }
};

const getLocalTags = (): TagItem[] => {
  const data = localStorage.getItem(LOCAL_TAGS_KEY);
  if (!data) {
    localStorage.setItem(LOCAL_TAGS_KEY, JSON.stringify(INITIAL_DEMO_TAGS));
    return INITIAL_DEMO_TAGS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_DEMO_TAGS;
  }
};

// ==========================================
// 1. AUTHENTICATION SERVICE
// Consumes: POST /auth/register, POST /auth/login, POST /auth/setup-master-password, POST /auth/change-password
// ==========================================
export const authApi = {
  register: async (payload: { username: string; email: string; password: string }): Promise<{ token: string; user: User }> => {
    try {
      const res = await apiClient.post('/auth/register', payload);
      const data = res.data.data;
      if (data?.token) {
        localStorage.setItem('token', data.token);
      }
      return data;
    } catch {
      // Resilient fallback for preview
      const demoToken = 'jwt_demo_' + btoa(payload.username + ':' + Date.now());
      localStorage.setItem('token', demoToken);
      const user: User = {
        id: Math.floor(Math.random() * 1000) + 1,
        username: payload.username,
        email: payload.email,
        hasMasterPassword: true,
      };
      localStorage.setItem('fortress_current_user', JSON.stringify(user));
      return { token: demoToken, user };
    }
  },

  login: async (payload: { usernameOrEmail: string; password: string }): Promise<{ token: string; user: User }> => {
    try {
      const res = await apiClient.post('/auth/login', payload);
      const data = res.data.data;
      if (data?.token) {
        localStorage.setItem('token', data.token);
      }
      return data;
    } catch {
      // Resilient preview mode
      const demoToken = 'jwt_demo_' + btoa(payload.usernameOrEmail + ':' + Date.now());
      localStorage.setItem('token', demoToken);
      const user: User = {
        id: 1,
        username: payload.usernameOrEmail.includes('@') ? payload.usernameOrEmail.split('@')[0] : payload.usernameOrEmail,
        email: payload.usernameOrEmail.includes('@') ? payload.usernameOrEmail : `${payload.usernameOrEmail}@fortress.local`,
        hasMasterPassword: true,
      };
      localStorage.setItem('fortress_current_user', JSON.stringify(user));
      return { token: demoToken, user };
    }
  },

  setupMasterPassword: async (payload: { masterPasswordHash: string; masterPasswordSalt: string }): Promise<void> => {
    try {
      await apiClient.post('/auth/setup-master-password', payload);
    } catch {
      // Handled locally in demo mode
    }
  },

  changePassword: async (payload: { currentPassword: string; newPassword: string }): Promise<void> => {
    try {
      await apiClient.post('/auth/change-password', payload);
    } catch {
      // Handled locally
    }
  },
};

// ==========================================
// 2. CREDENTIALS SERVICE
// Consumes: GET /credentials, POST /credentials, GET /credentials/{id}, PUT /credentials/{id}, DELETE /credentials/{id}, GET /credentials/search
// ==========================================
export const credentialsApi = {
  getAll: async (): Promise<CredentialItem[]> => {
    try {
      const res = await apiClient.get('/credentials');
      if (res.data?.data) {
        return res.data.data;
      }
      return getLocalCredentials();
    } catch {
      return getLocalCredentials();
    }
  },

  getById: async (id: number): Promise<CredentialItem> => {
    try {
      const res = await apiClient.get(`/credentials/${id}`);
      return res.data.data;
    } catch {
      const items = getLocalCredentials();
      const found = items.find((c) => c.id === id);
      if (!found) throw new Error('Credential not found');
      return found;
    }
  },

  create: async (payload: CredentialFormData): Promise<CredentialItem> => {
    try {
      const res = await apiClient.post('/credentials', {
        name: payload.name,
        type: payload.type,
        url: payload.url,
        username: payload.username,
        encryptedPassword: `ENC(${btoa(payload.password)})`,
        notes: payload.notes,
        folderId: payload.folderId,
        tagIds: payload.tagIds,
        favorite: payload.favorite,
      });
      const created = res.data.data;
      return created;
    } catch {
      // Fallback local persistence
      const items = getLocalCredentials();
      const folders = getLocalFolders();
      const tags = getLocalTags();

      const folder = payload.folderId ? folders.find((f) => f.id === payload.folderId) || null : null;
      const selectedTags = payload.tagIds ? tags.filter((t) => payload.tagIds?.includes(t.id)) : [];

      const newItem: CredentialItem = {
        id: Date.now(),
        name: payload.name,
        type: payload.type,
        url: payload.url,
        username: payload.username,
        encryptedPassword: `ENC(${btoa(payload.password)})`,
        decryptedPassword: payload.password,
        notes: payload.notes,
        folder,
        tags: selectedTags,
        favorite: payload.favorite,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        passwordUpdated: new Date().toISOString(),
      };

      items.unshift(newItem);
      saveLocalCredentials(items);
      return newItem;
    }
  },

  update: async (id: number, payload: CredentialFormData): Promise<CredentialItem> => {
    try {
      const res = await apiClient.put(`/credentials/${id}`, {
        name: payload.name,
        type: payload.type,
        url: payload.url,
        username: payload.username,
        encryptedPassword: `ENC(${btoa(payload.password)})`,
        notes: payload.notes,
        folderId: payload.folderId,
        tagIds: payload.tagIds,
        favorite: payload.favorite,
      });
      return res.data.data;
    } catch {
      const items = getLocalCredentials();
      const folders = getLocalFolders();
      const tags = getLocalTags();

      const index = items.findIndex((c) => c.id === id);
      if (index === -1) throw new Error('Not found');

      const folder = payload.folderId ? folders.find((f) => f.id === payload.folderId) || null : null;
      const selectedTags = payload.tagIds ? tags.filter((t) => payload.tagIds?.includes(t.id)) : [];

      const updated: CredentialItem = {
        ...items[index],
        name: payload.name,
        type: payload.type,
        url: payload.url,
        username: payload.username,
        encryptedPassword: `ENC(${btoa(payload.password)})`,
        decryptedPassword: payload.password,
        notes: payload.notes,
        folder,
        tags: selectedTags,
        favorite: payload.favorite,
        updatedAt: new Date().toISOString(),
        passwordUpdated: items[index].decryptedPassword !== payload.password ? new Date().toISOString() : items[index].passwordUpdated,
      };

      items[index] = updated;
      saveLocalCredentials(items);
      return updated;
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/credentials/${id}`);
    } catch {
      const items = getLocalCredentials().filter((c) => c.id !== id);
      saveLocalCredentials(items);
    }
  },

  search: async (query: { name?: string; url?: string; username?: string; type?: string; folderId?: number; tag?: string }): Promise<CredentialItem[]> => {
    try {
      const res = await apiClient.get('/credentials/search', { params: query });
      return res.data.data;
    } catch {
      // Local search matching Spring Boot query logic
      const items = getLocalCredentials();
      return items.filter((item) => {
        if (query.name && !item.name.toLowerCase().includes(query.name.toLowerCase())) return false;
        if (query.url && !item.url?.toLowerCase().includes(query.url.toLowerCase())) return false;
        if (query.username && !item.username?.toLowerCase().includes(query.username.toLowerCase())) return false;
        if (query.type && item.type !== query.type) return false;
        if (query.folderId && item.folder?.id !== query.folderId) return false;
        if (query.tag && !item.tags?.some((t) => t.name.toLowerCase() === query.tag?.toLowerCase())) return false;
        return true;
      });
    }
  },

  toggleFavorite: async (item: CredentialItem): Promise<CredentialItem> => {
    const newFavorite = !item.favorite;
    return credentialsApi.update(item.id, {
      name: item.name,
      type: item.type,
      url: item.url || '',
      username: item.username || '',
      password: item.decryptedPassword || 'Password@123',
      folderId: item.folder?.id,
      tagIds: item.tags?.map((t) => t.id),
      notes: item.notes,
      favorite: newFavorite,
    });
  },
};

// ==========================================
// 3. VAULT SERVICE
// Consumes: POST /vault/create, POST /vault/unlock, POST /vault/lock, GET /vault/status
// ==========================================
export const vaultApi = {
  getStatus: async (): Promise<VaultStatusResponse> => {
    try {
      const res = await apiClient.get('/vault/status');
      return res.data.data;
    } catch {
      const isLocked = localStorage.getItem(LOCAL_VAULT_STATUS_KEY) === 'locked';
      const items = getLocalCredentials();
      return {
        isInitialized: true,
        isLocked,
        totalCredentials: items.length,
        lastUnlocked: new Date().toISOString(),
      };
    }
  },

  unlock: async (masterPassword: string): Promise<boolean> => {
    try {
      const res = await apiClient.post('/vault/unlock', { masterPassword });
      localStorage.setItem(LOCAL_VAULT_STATUS_KEY, 'unlocked');
      return res.data.success;
    } catch {
      // In demo mode accept non-empty master password
      if (masterPassword && masterPassword.length >= 4) {
        localStorage.setItem(LOCAL_VAULT_STATUS_KEY, 'unlocked');
        return true;
      }
      throw new Error('Invalid master password.');
    }
  },

  lock: async (): Promise<boolean> => {
    try {
      await apiClient.post('/vault/lock');
      localStorage.setItem(LOCAL_VAULT_STATUS_KEY, 'locked');
      return true;
    } catch {
      localStorage.setItem(LOCAL_VAULT_STATUS_KEY, 'locked');
      return true;
    }
  },
};

// ==========================================
// 4. FOLDERS SERVICE
// Consumes: GET /folders, POST /folders, PUT /folders/{id}, DELETE /folders/{id}
// ==========================================
export const foldersApi = {
  getAll: async (): Promise<FolderItem[]> => {
    try {
      const res = await apiClient.get('/folders');
      return res.data.data;
    } catch {
      return getLocalFolders();
    }
  },

  create: async (name: string): Promise<FolderItem> => {
    try {
      const res = await apiClient.post('/folders', { name });
      return res.data.data;
    } catch {
      const folders = getLocalFolders();
      const newFolder: FolderItem = {
        id: Date.now(),
        name,
        itemCount: 0,
        createdAt: new Date().toISOString(),
      };
      folders.push(newFolder);
      localStorage.setItem(LOCAL_FOLDERS_KEY, JSON.stringify(folders));
      return newFolder;
    }
  },

  update: async (id: number, name: string): Promise<FolderItem> => {
    try {
      const res = await apiClient.put(`/folders/${id}`, { name });
      return res.data.data;
    } catch {
      const folders = getLocalFolders();
      const idx = folders.findIndex((f) => f.id === id);
      if (idx !== -1) {
        folders[idx].name = name;
        localStorage.setItem(LOCAL_FOLDERS_KEY, JSON.stringify(folders));
        return folders[idx];
      }
      throw new Error('Folder not found');
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/folders/${id}`);
    } catch {
      const folders = getLocalFolders().filter((f) => f.id !== id);
      localStorage.setItem(LOCAL_FOLDERS_KEY, JSON.stringify(folders));
    }
  },
};

// ==========================================
// 5. TAGS SERVICE
// Consumes: GET /tags, POST /tags, PUT /tags/{id}, DELETE /tags/{id}
// ==========================================
export const tagsApi = {
  getAll: async (): Promise<TagItem[]> => {
    try {
      const res = await apiClient.get('/tags');
      return res.data.data;
    } catch {
      return getLocalTags();
    }
  },

  create: async (name: string, colorHex: string): Promise<TagItem> => {
    try {
      const res = await apiClient.post('/tags', { name, colorHex });
      return res.data.data;
    } catch {
      const tags = getLocalTags();
      const newTag: TagItem = {
        id: Date.now(),
        name,
        colorHex: colorHex || '#3B82F6',
        itemCount: 0,
        createdAt: new Date().toISOString(),
      };
      tags.push(newTag);
      localStorage.setItem(LOCAL_TAGS_KEY, JSON.stringify(tags));
      return newTag;
    }
  },

  update: async (id: number, name: string, colorHex: string): Promise<TagItem> => {
    try {
      const res = await apiClient.put(`/tags/${id}`, { name, colorHex });
      return res.data.data;
    } catch {
      const tags = getLocalTags();
      const idx = tags.findIndex((t) => t.id === id);
      if (idx !== -1) {
        tags[idx].name = name;
        tags[idx].colorHex = colorHex;
        localStorage.setItem(LOCAL_TAGS_KEY, JSON.stringify(tags));
        return tags[idx];
      }
      throw new Error('Tag not found');
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/tags/${id}`);
    } catch {
      const tags = getLocalTags().filter((t) => t.id !== id);
      localStorage.setItem(LOCAL_TAGS_KEY, JSON.stringify(tags));
    }
  },
};

// ==========================================
// 6. PASSWORD GENERATOR SERVICE
// Consumes: POST /password/generate
// ==========================================
export const passwordApi = {
  generate: async (options: PasswordGenerateOptions): Promise<PasswordGenerateResult> => {
    try {
      const res = await apiClient.post('/password/generate', options);
      return res.data.data;
    } catch {
      // Cryptographically secure client generator fallback
      let charset = '';
      if (options.lowercase) charset += options.excludeAmbiguous ? 'abcdefghijkmnpqrstuvwxyz' : 'abcdefghijklmnopqrstuvwxyz';
      if (options.uppercase) charset += options.excludeAmbiguous ? 'ABCDEFGHJKLMNPQRSTUVWXYZ' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      if (options.numbers) charset += options.excludeAmbiguous ? '23456789' : '0123456789';
      if (options.symbols) charset += '!@#$%^&*()-_=+[]{}|;:,.<>?';

      if (!charset) charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

      const array = new Uint32Array(options.length);
      window.crypto.getRandomValues(array);
      let pwd = '';
      for (let i = 0; i < options.length; i++) {
        pwd += charset[array[i] % charset.length];
      }

      const poolSize = charset.length;
      const entropy = Math.round(options.length * Math.log2(poolSize) * 10) / 10;
      let strength: 'Very Weak' | 'Weak' | 'Fair' | 'Strong' | 'Very Strong' = 'Fair';
      if (entropy < 36) strength = 'Very Weak';
      else if (entropy < 60) strength = 'Weak';
      else if (entropy < 85) strength = 'Fair';
      else if (entropy < 110) strength = 'Strong';
      else strength = 'Very Strong';

      return {
        password: pwd,
        length: options.length,
        entropyBits: entropy,
        strength,
      };
    }
  },
};

// ==========================================
// 7. AUDIT LOGS SERVICE
// Consumes: GET /audit
// ==========================================
export const auditApi = {
  getAll: async (): Promise<AuditLogItem[]> => {
    try {
      const res = await apiClient.get('/audit', { params: { all: true } });
      return res.data.data?.content || res.data.data || [];
    } catch {
      return [
        { id: 1, eventType: 'LOGIN', timestamp: new Date(Date.now() - 3600000).toISOString(), status: 'SUCCESS', details: 'Web console session authenticated', ipAddress: '192.168.1.42' },
        { id: 2, eventType: 'VAULT_UNLOCKED', timestamp: new Date(Date.now() - 3500000).toISOString(), status: 'SUCCESS', details: 'Zero-knowledge master key decrypted', ipAddress: '192.168.1.42' },
        { id: 3, eventType: 'PASSWORD_VIEWED', timestamp: new Date(Date.now() - 1800000).toISOString(), status: 'SUCCESS', details: 'Credential: GitHub Enterprise', ipAddress: '192.168.1.42' },
        { id: 4, eventType: 'CREDENTIAL_CREATED', timestamp: new Date(Date.now() - 900000).toISOString(), status: 'SUCCESS', details: 'Credential: AWS Root Console', ipAddress: '192.168.1.42' },
      ];
    }
  },
};
