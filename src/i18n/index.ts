import { useState, useEffect } from 'react';
import { en } from './en';
import { te } from './te';
import { hi } from './hi';
import { Language } from '../types';

const STORAGE_KEY = 'buildloop_lang';

let currentLanguage: Language = (() => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as Language;
    if (saved && ['en', 'te', 'hi'].includes(saved)) {
      return saved;
    }
  } catch {
    // fallback
  }
  return 'en';
})();

const listeners = new Set<(lang: Language) => void>();

export function getLanguage(): Language {
  return currentLanguage;
}

export function setLanguage(lang: Language) {
  if (!['en', 'te', 'hi'].includes(lang)) return;
  currentLanguage = lang;
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // ignore
  }
  listeners.forEach(fn => fn(lang));
}

export function t(key: string, params?: Record<string, string | number>): string {
  let dict: Record<string, string> = en;
  if (currentLanguage === 'te') {
    dict = te;
  } else if (currentLanguage === 'hi') {
    dict = hi;
  }

  let text = dict[key] || (en as Record<string, string>)[key] || key;

  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(new RegExp(`{${k}}`, 'g'), String(v));
    }
  }

  return text;
}

export function useTranslation() {
  const [lang, setLangState] = useState<Language>(currentLanguage);

  useEffect(() => {
    const onChange = (newLang: Language) => setLangState(newLang);
    listeners.add(onChange);
    return () => {
      listeners.delete(onChange);
    };
  }, []);

  return {
    t,
    currentLanguage: lang,
    setLanguage: (l: Language) => setLanguage(l)
  };
}
