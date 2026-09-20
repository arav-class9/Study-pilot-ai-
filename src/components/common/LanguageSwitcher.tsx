import React, { useState } from 'react';
import { Globe, Check } from 'lucide-react';
import { SupportedLanguage, LANGUAGE_NAMES } from '../../services/i18n';
import { useLanguage } from '../../context/LanguageContext';

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const currentLang = (language as SupportedLanguage) || 'en';

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
        title="Select AI Vernacular Language"
      >
        <Globe className="w-3.5 h-3.5 text-indigo-500" />
        <span>{LANGUAGE_NAMES[currentLang as SupportedLanguage]?.flag}</span>
        <span className="hidden sm:inline">
          {LANGUAGE_NAMES[currentLang as SupportedLanguage]?.name}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50 animate-fadeIn">
          <div className="px-3 py-1 text-[10px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
            Vernacular AI Medium
          </div>
          {(Object.keys(LANGUAGE_NAMES) as SupportedLanguage[]).map((langKey) => {
            const isSelected = currentLang === langKey;
            return (
              <button
                key={langKey}
                onClick={() => {
                  if (setLanguage) setLanguage(langKey);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold hover:bg-indigo-50 dark:hover:bg-slate-800 transition cursor-pointer ${
                  isSelected
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-slate-800/50'
                    : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{LANGUAGE_NAMES[langKey].flag}</span>
                  <span>{LANGUAGE_NAMES[langKey].name}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
