import { i18n } from 'meteor/universe:i18n';
import React, {
  ReactNode,
  createContext,
  useState,
  useEffect,
  useContext,
} from 'react';

import './locales/en.i18n.yml';
import './locales/es.i18n.yml';

const localeContext = createContext(i18n.getLocale());

export type LocaleProviderProps = { children: ReactNode };

export function LocaleProvider({ children }: LocaleProviderProps) {
  const [locale, setLocale] = useState(i18n.getLocale());
  useEffect(() => {
    i18n.onChangeLocale(setLocale);
    return () => {
      i18n.offChangeLocale(setLocale);
    };
  }, [setLocale]);

  return (
    <localeContext.Provider value={locale}>{children}</localeContext.Provider>
  );
}

export function useLocale() {
  return useContext(localeContext);
}
