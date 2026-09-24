import React, { useState, useEffect, useCallback } from 'react';
import {
  Zap,
  Copy,
  RefreshCw,
  Sliders,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { passwordApi } from '../../api';
import { useToast } from '../../context/ToastContext';
import { PasswordGenerateResult } from '../../types';

export const PasswordGeneratorView: React.FC = () => {
  const { copyToClipboard } = useToast();
  const [length, setLength] = useState(20);
  const [uppercase, setUppercase] = useState(true);
  const [lowercase, setLowercase] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(true);

  const [result, setResult] = useState<PasswordGenerateResult>({
    password: '',
    length: 20,
    entropyBits: 130,
    strength: 'Very Strong',
  });
  const [loading, setLoading] = useState(false);

  const generate = useCallback(async () => {
    setLoading(true);
    try {
      const res = await passwordApi.generate({
        length,
        uppercase,
        lowercase,
        numbers,
        symbols,
        excludeAmbiguous,
      });
      setResult(res);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  }, [length, uppercase, lowercase, numbers, symbols, excludeAmbiguous]);

  useEffect(() => {
    generate();
  }, [generate]);

  const handleCopy = () => {
    if (result.password) {
      copyToClipboard(result.password, 'Password');
    }
  };

  const strengthBadges = {
    'Very Weak': 'bg-rose-50 text-rose-800 border-rose-300',
    Weak: 'bg-orange-50 text-orange-800 border-orange-300',
    Fair: 'bg-amber-50 text-amber-800 border-amber-300',
    Strong: 'bg-blue-50 text-blue-900 border-blue-300',
    'Very Strong': 'bg-emerald-50 text-emerald-800 border-emerald-300',
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-serif">
      {/* Title */}
      <div>
        <h2 className="text-xl font-serif font-bold text-slate-900 flex items-center gap-2">
          <Zap className="w-5 h-5 text-slate-700" />
          <span>Cryptographic Password Generator</span>
        </h2>
        <p className="text-xs font-serif text-slate-500 mt-1">
          Generate cryptographically secure secrets calculated via CSPRNG SecureRandom with Shannon entropy scoring.
        </p>
      </div>

      {/* Main Generator Sharp Card */}
      <div className="bg-white p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        {/* Output Box */}
        <div className="p-5 bg-slate-50 border border-slate-300 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full overflow-x-auto text-center sm:text-left py-1">
            <span className="font-mono text-lg sm:text-xl font-semibold tracking-wider text-slate-900 selection:bg-blue-900 selection:text-white break-all">
              {result.password || 'Generating...'}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={generate}
              disabled={loading}
              title="Generate New"
              className="p-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-900' : ''}`} />
            </button>

            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-blue-950 text-white text-xs font-serif font-semibold tracking-wider uppercase border border-slate-950 transition-colors"
            >
              <Copy className="w-4 h-4" />
              <span>Copy Secret</span>
            </button>
          </div>
        </div>

        {/* Strength & Entropy Indicator Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-1 py-1 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-serif text-slate-600 uppercase tracking-wider">Classification:</span>
            <span
              className={`px-2.5 py-0.5 text-xs font-serif font-bold uppercase tracking-wider border ${
                strengthBadges[result.strength]
              }`}
            >
              {result.strength}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-600 font-mono">
            <span className="uppercase font-serif text-slate-500">Shannon Entropy:</span>
            <span className="text-blue-950 font-bold border border-slate-200 bg-slate-50 px-2 py-0.5">{result.entropyBits} bits</span>
          </div>
        </div>

        {/* Length Slider */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-serif font-semibold uppercase tracking-wider text-slate-800">Password Length</label>
            <span className="font-mono text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-900 border border-slate-300">
              {length} characters
            </span>
          </div>
          <input
            type="range"
            min={8}
            max={64}
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            className="w-full accent-slate-900 cursor-pointer h-2 bg-slate-200"
          />
          <div className="flex justify-between text-[11px] text-slate-500 font-mono">
            <span>8 (Basic)</span>
            <span>20 (Recommended)</span>
            <span>64 (Maximum Entropy)</span>
          </div>
        </div>

        {/* Character Set Checkboxes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <label className="flex items-center gap-3 p-3.5 bg-slate-50 border border-slate-200 hover:border-slate-400 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={uppercase}
              onChange={(e) => setUppercase(e.target.checked)}
              className="w-4 h-4 text-blue-900 border-slate-300 focus:ring-0"
            />
            <div className="text-xs font-serif">
              <span className="font-semibold text-slate-900">Uppercase Characters</span>
              <p className="text-[11px] text-slate-500 font-mono">A — Z</p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3.5 bg-slate-50 border border-slate-200 hover:border-slate-400 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={lowercase}
              onChange={(e) => setLowercase(e.target.checked)}
              className="w-4 h-4 text-blue-900 border-slate-300 focus:ring-0"
            />
            <div className="text-xs font-serif">
              <span className="font-semibold text-slate-900">Lowercase Characters</span>
              <p className="text-[11px] text-slate-500 font-mono">a — z</p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3.5 bg-slate-50 border border-slate-200 hover:border-slate-400 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={numbers}
              onChange={(e) => setNumbers(e.target.checked)}
              className="w-4 h-4 text-blue-900 border-slate-300 focus:ring-0"
            />
            <div className="text-xs font-serif">
              <span className="font-semibold text-slate-900">Numeric Digits</span>
              <p className="text-[11px] text-slate-500 font-mono">0 — 9</p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3.5 bg-slate-50 border border-slate-200 hover:border-slate-400 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={symbols}
              onChange={(e) => setSymbols(e.target.checked)}
              className="w-4 h-4 text-blue-900 border-slate-300 focus:ring-0"
            />
            <div className="text-xs font-serif">
              <span className="font-semibold text-slate-900">Special Symbols & Punctuation</span>
              <p className="text-[11px] text-slate-500 font-mono">!@#$%^&*()_+-=</p>
            </div>
          </label>
        </div>

        {/* Ambiguous Filter */}
        <label className="flex items-center gap-3 p-3.5 bg-slate-50 border border-slate-200 hover:border-slate-400 cursor-pointer transition-colors">
          <input
            type="checkbox"
            checked={excludeAmbiguous}
            onChange={(e) => setExcludeAmbiguous(e.target.checked)}
            className="w-4 h-4 text-blue-900 border-slate-300 focus:ring-0"
          />
          <div className="text-xs font-serif">
            <span className="font-semibold text-slate-900">
              Exclude Ambiguous / Confusing Glyphs
            </span>
            <p className="text-[11px] text-slate-500">
              Removes visually similar characters such as <code className="text-slate-900 font-mono font-bold bg-white px-1 border border-slate-200">0, O, 1, l, I</code>
            </p>
          </div>
        </label>
      </div>
    </div>
  );
};
