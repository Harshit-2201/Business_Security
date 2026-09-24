export type CredentialType = 'WEBSITE' | 'DATABASE' | 'API_KEYS' | 'CLOUD' | 'SERVER' | 'SECURE_NOTES';

export interface User {
  id: number;
  username: string;
  email: string;
  hasMasterPassword?: boolean;
  createdAt?: string;
}

export interface FolderItem {
  id: number;
  name: string;
  createdAt?: string;
  itemCount?: number;
}

export interface TagItem {
  id: number;
  name: string;
  colorHex: string;
  createdAt?: string;
  itemCount?: number;
}

export interface CredentialItem {
  id: number;
  name: string;
  type: CredentialType;
  url?: string;
  username?: string;
  encryptedPassword?: string;
  decryptedPassword?: string;
  notes?: string;
  folder?: FolderItem | null;
  tags?: TagItem[];
  favorite: boolean;
  createdAt: string;
  updatedAt?: string;
  lastUsed?: string;
  passwordUpdated?: string;
}

export interface CredentialFormData {
  name: string;
  type: CredentialType;
  url: string;
  username: string;
  password: string;
  folderId?: number | null;
  tagIds?: number[];
  notes?: string;
  favorite: boolean;
}

export interface VaultStatusResponse {
  isInitialized: boolean;
  isLocked: boolean;
  totalCredentials: number;
  lastUnlocked?: string;
}

export interface AuditLogItem {
  id: number;
  eventType: 'LOGIN' | 'LOGIN_FAILED' | 'VAULT_UNLOCKED' | 'PASSWORD_VIEWED' | 'PASSWORD_COPIED' | 'PASSWORD_GENERATED' | 'CREDENTIAL_CREATED' | 'CREDENTIAL_UPDATED' | 'CREDENTIAL_DELETED';
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
  status: 'SUCCESS' | 'FAILURE';
  details?: string;
}

export interface PasswordGenerateOptions {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  excludeAmbiguous: boolean;
}

export interface PasswordGenerateResult {
  password: string;
  length: number;
  entropyBits: number;
  strength: 'Very Weak' | 'Weak' | 'Fair' | 'Strong' | 'Very Strong';
}

export interface VaultHealthStats {
  total: number;
  favorites: number;
  weakCount: number;
  duplicateCount: number;
  oldCount: number;
  securityScore: number;
}
