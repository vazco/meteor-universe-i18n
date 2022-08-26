import { i18n } from 'meteor/universe:i18n';
import { derived, writable } from 'svelte/store';

// Import of all files that contain translations, eg:
import '../locales/en.i18n.yml';
import '../locales/es.i18n.yml';

// Store for updating i18n locale on value change
function createLocale() {
  const { subscribe, set } = writable(i18n.getLocale());
  return {
    subscribe,
    set: lng => {
      i18n.setLocale(lng);
      return set(lng);
    },
  };
}
export const locale = createLocale();

// Reactive getTranslation function for updating translation on locale change
const getTranslation = (key, ...args) => i18n.getTranslation(key, ...args);
export const t = derived(locale, $locale => args => getTranslation(args));
