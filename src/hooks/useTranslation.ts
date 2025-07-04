import { useContext } from 'react';
import { LanguageContext } from '../contexts/LanguageContext';

// Import translation files
import en from '../i18n/en.json';
import vi from '../i18n/vi.json';

const translations = {
  en,
  vi,
};

type TranslationKeys = keyof typeof en; // Assuming en.json has all keys

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  const { language } = context;

  const t = (key: TranslationKeys, params?: { [key: string]: string | number }) => {
    let text = (translations[language] as Record<TranslationKeys, string>)[key] || key;

    if (params) {
      for (const paramKey in params) {
        text = text.replace(new RegExp(`{{${paramKey}}}`, 'g'), String(params[paramKey]));
      }
    }
    return text;
  };

  return { t, language };
};