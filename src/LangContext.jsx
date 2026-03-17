import { createContext, useContext, useState, useCallback } from 'react';
import { TRANSLATIONS, LANGUAGES } from './i18n.js';

const LANG_KEY = 'k53_lang';

const LangContext = createContext(null);

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    const stored = localStorage.getItem(LANG_KEY);
    return LANGUAGES.find(l => l.code === stored) ? stored : 'en';
  });

  const setLang = useCallback((code) => {
    localStorage.setItem(LANG_KEY, code);
    setLangState(code);
  }, []);

  const t = useCallback((key) => {
    const dict = TRANSLATIONS[lang] || TRANSLATIONS.en;
    return dict[key] ?? TRANSLATIONS.en[key] ?? key;
  }, [lang]);

  return (
    <LangContext.Provider value={{ lang, setLang, t, LANGUAGES }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be used within LangProvider');
  return ctx;
}
