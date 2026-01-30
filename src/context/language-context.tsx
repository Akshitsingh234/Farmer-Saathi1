// context/language-context.tsx
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import en from '@/locales/en.json';
import hi from '@/locales/hi.json';
import kn from '@/locales/kn.json';
/*
  Uploaded logo (for reference):
  /mnt/data/c918caa3-e790-4f7c-b362-649d54f23baf.png
*/

type Language = 'en' | 'hi' | 'kn' | 'ta' | 'te' | 'bn' | 'gu' | 'mr' | 'pa';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, vars?: Record<string, any>, fallback?: string) => string;
  ready: boolean;
}


const translations: Record<string, any> = {
  en,
  hi,
  kn,
  ta: en, // Using English as fallback for now
  te: en, // Using English as fallback for now
  bn: en, // Using English as fallback for now
  gu: en, // Using English as fallback for now
  mr: en, // Using English as fallback for now
  pa: en, // Using English as fallback for now
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'ag_language';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [messages, setMessages] = useState<Record<string, any>>(translations['en']);
  const [ready, setReady] = useState<boolean>(false);

  useEffect(() => {
    // Initialize language from localStorage or browser
    const stored = localStorage.getItem(STORAGE_KEY);
    let initialLang: Language = 'en';
    
    if (['en', 'hi', 'kn', 'ta', 'te', 'bn', 'gu', 'mr', 'pa'].includes(stored || '')) {
      initialLang = stored as Language;
    } else {
      const nav = navigator.language?.split?.('-')?.[0];
      if (['hi', 'kn', 'ta', 'te', 'bn', 'gu', 'mr', 'pa'].includes(nav || '')) {
        initialLang = nav as Language;
      }
    }
    
    setLanguageState(initialLang);
    setMessages(translations[initialLang] || translations['en']);
    setReady(true);
  }, []);

  useEffect(() => {
    setMessages(translations[language] || translations['en']);
    localStorage.setItem(STORAGE_KEY, language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string, vars?: Record<string, any>, fallback = ''): string => {
    if (!messages) return fallback || key;
  
    // Find the translation value using dot notation
    const keys = key.split('.');
    let cur: any = messages;
    for (const k of keys) {
      if (cur && typeof cur === 'object' && k in cur) {
        cur = cur[k];
      } else {
        return fallback || key;
      }
    }
  
    // If value is not a string, return fallback
    if (typeof cur !== 'string') return fallback || key;
  
    // Interpolate variables
    if (vars && typeof vars === 'object') {
      Object.entries(vars).forEach(([vKey, vVal]) => {
        cur = cur.replaceAll(`{${vKey}}`, String(vVal));
      });
    }
  
    return cur;
  };
  

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, ready }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
}

/**
 * LanguageSwitcher - dropdown select for en / hi / kn
 *
 * Minimal styling provided; replace classes with your design system classes as needed.
 */
export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as Language;
    setLanguage(val);
  };

  return (
    <div>
      <label htmlFor="language-select" className="sr-only">
        Select language
      </label>
      <select
        id="language-select"
        value={language}
        onChange={onChange}
        className="border rounded px-3 py-2 bg-white text-sm"
        aria-label="Select language"
      >
        <option value="en">🇺🇸 English</option>
        <option value="hi">🇮🇳 हिंदी</option>
        <option value="kn">🇮🇳 ಕನ್ನಡ</option>
        <option value="ta">🇮🇳 தமிழ்</option>
        <option value="te">🇮🇳 తెలుగు</option>
        <option value="bn">🇮🇳 বাংলা</option>
        <option value="gu">🇮🇳 ગુજરાતી</option>
        <option value="mr">🇮🇳 मराठी</option>
        <option value="pa">🇮🇳 ਪੰਜਾਬੀ</option>
      </select>
    </div>
  );
}
