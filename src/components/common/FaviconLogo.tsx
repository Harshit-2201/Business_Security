import React, { useState } from 'react';
import { Globe, Database, Key, Cloud, Server, FileText } from 'lucide-react';
import { CredentialType } from '../../types';

interface FaviconLogoProps {
  url?: string;
  name: string;
  type: CredentialType;
  size?: 'sm' | 'md' | 'lg';
}

export const FaviconLogo: React.FC<FaviconLogoProps> = ({ url, name, type, size = 'md' }) => {
  const [imgError, setImgError] = useState(false);

  // Extract clean domain for favicon lookup
  let domain = '';
  if (url) {
    try {
      const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
      domain = parsed.hostname;
    } catch {
      domain = '';
    }
  }

  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  }[size];

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }[size];

  const renderFallbackIcon = () => {
    switch (type) {
      case 'DATABASE':
        return <Database className={`${iconSizes} text-emerald-800`} />;
      case 'API_KEYS':
        return <Key className={`${iconSizes} text-amber-800`} />;
      case 'CLOUD':
        return <Cloud className={`${iconSizes} text-sky-800`} />;
      case 'SERVER':
        return <Server className={`${iconSizes} text-slate-800`} />;
      case 'SECURE_NOTES':
        return <FileText className={`${iconSizes} text-indigo-900`} />;
      case 'WEBSITE':
      default:
        if (name && name.trim().length > 0) {
          return <span className="font-serif font-bold text-slate-900 uppercase">{name.trim().charAt(0)}</span>;
        }
        return <Globe className={`${iconSizes} text-slate-700`} />;
    }
  };

  const faviconUrl = domain ? `https://icons.duckduckgo.com/ip3/${domain}.ico` : null;

  return (
    <div
      className={`${sizeClasses} flex items-center justify-center shrink-0 border border-slate-300 bg-slate-50 overflow-hidden shadow-2xs`}
    >
      {faviconUrl && !imgError ? (
        <img
          src={faviconUrl}
          alt={name}
          className="w-full h-full object-contain p-1"
          onError={() => setImgError(true)}
          referrerPolicy="no-referrer"
        />
      ) : (
        renderFallbackIcon()
      )}
    </div>
  );
};
