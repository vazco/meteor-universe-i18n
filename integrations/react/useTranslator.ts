import { i18n } from 'meteor/universe:i18n';
import { useCallback } from 'react';
import { useLocale } from './reactive18n';

export function useTranslator(prefix = '') {
  const locale = useLocale();
  return useCallback(
    (key: string, ...args: unknown[]) =>
      i18n.getTranslation(prefix, key, ...args),
    [locale],
  );
}
