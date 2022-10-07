import React from 'react';
import { LocaleProvider } from './reactive18n';
import { useTranslator } from './useTranslator';

const Example = () => {
  const t = useTranslator();
  return (
    <>
      Are you sure?
      <button>{t('common.yes')}</button>
      <button>{t('common.no')}</button>
      <input placeholder={t('forms.company.placeholder')} />
    </>
  );
};

const App = () => (
  <LocaleProvider>
    <Example />
  </LocaleProvider>
);

export default App;
