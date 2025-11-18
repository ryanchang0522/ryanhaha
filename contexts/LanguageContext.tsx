import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { translations } from '../i18n/translations';

type Language = 'en' | 'zh-TW';

interface LanguageContextType {
  language: Language;
  changeLanguage: (lang: string) => void;
  t: (key: string, options?: { [key: string]: string | number }) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const savedLang = localStorage.getItem('keepEatLanguage');
    return (savedLang === 'en' || savedLang === 'zh-TW') ? savedLang : 'zh-TW';
  });

  useEffect(() => {
    localStorage.setItem('keepEatLanguage', language);
  }, [language]);

  const changeLanguage = (lang: string) => {
    if (lang === 'en' || lang === 'zh-TW') {
      setLanguage(lang);
    }
  };

  const t = (key: string, options?: { [key: string]: string | number }) => {
    let translation = translations[language][key] || translations['en'][key] || key;
    if (options) {
      Object.keys(options).forEach(optionKey => {
        translation = translation.replace(`{${optionKey}}`, String(options[optionKey]));
      });
    }
    return translation;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
