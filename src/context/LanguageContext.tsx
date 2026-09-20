import React, { createContext, useContext, useState, useEffect } from 'react';
import { SupportedLanguage, translateUI, getTranslation, getLanguageInstruction } from '../services/i18n';

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  translate: (text: string) => string;
  getInstruction: () => string;
}

const STORAGE_KEY = 'studypilot_language';

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && ['en', 'hi', 'hinglish', 'ta', 'te', 'mr'].includes(saved)) {
        return saved as SupportedLanguage;
      }
    }
    return 'en';
  });

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, lang);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, language);
    }
  }, [language]);

  const translate = (text: string) => translateUI(text, language);
  const getInstruction = () => getLanguageInstruction(language);

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        translate,
        getInstruction,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
