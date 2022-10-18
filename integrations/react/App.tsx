import React from 'react';
import { LocaleProvider } from './reactivei18n';
import { useTranslator } from './useTranslator';

const Example = () => {
  const t = useTranslator();
  return (
    <>
      Are you sure?
      <button>{t('ok')}</button>
      <button>{t('dog')}</button>
      <input placeholder={t('company.placeholder')} />
    </>
  );
};

export const App = () => (
  <LocaleProvider>
    <Example />
  </LocaleProvider>
);
