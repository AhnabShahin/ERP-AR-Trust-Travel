import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  WebsiteLanguageCode,
  WebsiteTranslations,
  WEBSITE_TRANSLATIONS,
} from '../data/websiteTranslations';

interface WebsiteLanguageContextType {
  websiteLang: WebsiteLanguageCode;
  setWebsiteLang: (lang: WebsiteLanguageCode) => void;
  t: WebsiteTranslations;
}

const WebsiteLanguageContext = createContext<WebsiteLanguageContextType | undefined>(undefined);

export const WebsiteLanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [websiteLang, setWebsiteLangState] = useState<WebsiteLanguageCode>(() => {
    try {
      const saved = localStorage.getItem('artrust_website_language');
      if (saved && ['en', 'de', 'fr', 'it', 'es', 'ru'].includes(saved)) {
        return saved as WebsiteLanguageCode;
      }
    } catch {}
    return 'en';
  });

  const setWebsiteLang = (lang: WebsiteLanguageCode) => {
    setWebsiteLangState(lang);
    try {
      localStorage.setItem('artrust_website_language', lang);
    } catch {}
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
      document.documentElement.dir = 'ltr';
    }
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = websiteLang;
      document.documentElement.dir = 'ltr';
    }
  }, [websiteLang]);

  const t = WEBSITE_TRANSLATIONS[websiteLang] || WEBSITE_TRANSLATIONS.en;

  return (
    <WebsiteLanguageContext.Provider value={{ websiteLang, setWebsiteLang, t }}>
      {children}
    </WebsiteLanguageContext.Provider>
  );
};

export const useWebsiteLanguage = (): WebsiteLanguageContextType => {
  const context = useContext(WebsiteLanguageContext);
  if (!context) {
    // Graceful fallback if used outside provider
    const fallbackLang: WebsiteLanguageCode = 'en';
    return {
      websiteLang: fallbackLang,
      setWebsiteLang: () => {},
      t: WEBSITE_TRANSLATIONS.en,
    };
  }
  return context;
};
