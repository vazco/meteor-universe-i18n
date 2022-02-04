import { EventEmitter } from 'events';
import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';

import { JSON, JSONObject, get, isJSONObject, set } from './utils';

export interface CreateTranslatorOptions extends GetTranslationOptions {
  _namespace?: string;
}

export interface GetCacheEntry {
  getJS(locale: string, namespace: string, isBefore?: boolean): string;
  getJSON(locale: string, namespace: string, diff?: string): string;
  getYML(locale: string, namespace: string, diff?: string): string;
  updatedAt: string;
}

export interface GetCacheFunction {
  (): Record<string, GetCacheEntry>;
  (locale: string): GetCacheEntry;
}

export interface GetTranslationOptions {
  _locale?: string;
  _namespace?: string;
  [key: string]: unknown;
}

export interface LoadLocaleOptions {
  async?: boolean;
  fresh?: boolean;
  host?: string;
  pathOnHost?: string;
  queryParams?: Record<string, unknown>;
  silent?: boolean;
}

export interface Options {
  close: string;
  defaultLocale: string;
  hideMissing: boolean;
  hostUrl: string;
  ignoreNoopLocaleChanges: boolean;
  open: string;
  pathOnHost: string;
  sameLocaleOnServerConnection: boolean;
  translationsHeaders: Record<string, string>;
}

export interface SetLocaleOptions extends LoadLocaleOptions {
  noDownload?: boolean;
}

const i18n = {
  _contextualLocale: new Meteor.EnvironmentVariable<string | undefined>(),
  _deps: new Tracker.Dependency(),
  _emitChange(locale?: string) {
    i18n._events.emit('changeLocale', locale ?? i18n._locale);
    i18n._deps.changed();
  },
  _events: new EventEmitter(),
  _formatgetters: {
    getJS: () => '',
    getJSON: () => '',
    getYML: () => '',
  } as Pick<GetCacheEntry, 'getJS' | 'getJSON' | 'getYML'>,
  _getConnectionId(connection?: Meteor.Connection | null) {
    // Actual implementation is only on the server.
    return undefined as string | undefined;
  },
  _getConnectionLocale(connection?: Meteor.Connection | null) {
    // Actual implementation is only on the server.
    return undefined as string | undefined;
  },
  _isLoaded: {} as Record<string, boolean>,
  _loadLocaleWithAncestors(locale: string, options?: SetLocaleOptions) {
    // Actual implementation is only on the client.
    return Promise.resolve();
  },
  _locale: 'en',
  _logger(error: unknown) {
    console.error(error);
  },
  _normalizeWithAncestors(locale = '') {
    
    if (!(locale in i18n._normalizeWithAncestorsCache)) {
      const locales: string[] = [];
      const parts = locale.split(/[-_]/);
      while (parts.length) {
        const locale = parts.join('-');
        if (locale.match(/^[a-z]{2}$|^[a-z]{2}-[A-Z]{2}$/g)) {
          locales.push(locale);
        }

        parts.pop();
      }

      i18n._normalizeWithAncestorsCache[locale] = locales;
    }

    return i18n._normalizeWithAncestorsCache[locale];
  },
  _normalizeWithAncestorsCache: {} as Record<string, readonly string[]>,
  _translations: {} as JSONObject,
  _ts: 0,
  __(...args: unknown[]) {
    // This will be aliased to i18n.getTranslation.
    return '';
  },
  addTranslation(locale: string, ...args: unknown[]) {
    // This will be aliased to i18n.addTranslations.
    return {};
  },
  addTranslations(locale: string, ...args: unknown[]) {
    const translation = args.pop() as JSONObject;
    const path = args.join('.').replace(/(^\.)|(\.\.)|(\.$)/g, '');

    if (typeof translation === 'string') {
      set(i18n._translations, `${i18n.normalize(locale)}.${path}`, translation);
    } else if (typeof translation === 'object' && !!translation) {
      Object.keys(translation)
        .sort()
        .forEach(key => {
          i18n.addTranslations(locale, `${path}.${key}`, translation[key]);
        });
    }

    return i18n._translations;
  },
  getAllKeysForLocale(locale?: string, exactlyThis = false) {
    if (locale === undefined) {
      locale = i18n.getLocale();
    }

    const keys = Object.create(null);
    function walk(path: string[], data: JSON) {
      if (isJSONObject(data)) {
        for (const [key, value] of Object.entries(data)) {
          path.push(key);
          walk(path, value);
          path.pop();
        }
      } else {
        keys[path.join('.')] = true;
      }
    }

    const path: string[] = [];
    walk(path, i18n._translations[locale]);

    const index = locale.indexOf('-');
    if (!exactlyThis && index >= 2) {
      locale = locale.substr(0, index);
      walk(path, i18n._translations[locale]);
    }

    return Object.keys(keys);
  },
  getCache: (() => ({})) as GetCacheFunction,
  getLanguageCodes() {
    return Object.keys(i18n._translations);
  },
  getLocale() {
    return (
      i18n._contextualLocale.get() ?? i18n._locale ?? i18n.options.defaultLocale
    );
  },
  getTranslation(...args: unknown[]) {
    const maybeOptions = args[args.length - 1];
    const hasOptions = typeof maybeOptions === 'object' && !!maybeOptions;
    const keys = hasOptions ? args.slice(0, -1) : args;
    const options = hasOptions ? (maybeOptions as GetTranslationOptions) : {};

    const key = keys.filter(key => key && typeof key === 'string').join('.');
    const { close, defaultLocale, hideMissing, open } = i18n.options;
    const {
      _locale: locale = i18n.getLocale(),
      ...variables
    } = options;

    let translation: unknown;
    [locale, defaultLocale].some(locale =>
      i18n
        ._normalizeWithAncestors(locale)
        .some(
          locale => (translation = get(i18n._translations, `${locale}.${key}`)),
        ),
    );

    let string = translation ? `${translation}` : hideMissing ? '' : key;
    const interpolatedString = interpolateTranslation(variables, string, open, close);

    return interpolatedString;
  },
  getTranslations(key?: string, locale?: string) {
    if (locale === undefined) {
      locale = i18n.getLocale();
    }

    const path = locale ? (key ? `${locale}.${key}` : locale) : key ?? '';
    return get(i18n._translations, path) ?? {};
  },
  isLoaded(locale?: string) {
    return i18n._isLoaded[locale ?? i18n.getLocale()];
  },
  loadLocale(locale: string, options?: LoadLocaleOptions) {
    // Actual implementation is only on the client.
    return Promise.resolve<HTMLScriptElement | undefined>(undefined);
  },
  normalize(locale: string) {
    return i18n._normalizeWithAncestors(locale)[0] as string | undefined;
  },
  offChangeLocale(fn: (locale: string) => void) {
    i18n._events.removeListener('changeLocale', fn);
  },
  onChangeLocale(fn: (locale: string) => void) {
    i18n._events.on('changeLocale', fn);
  },
  onceChangeLocale(fn: (locale: string) => void) {
    i18n._events.once('changeLocale', fn);
  },
  options: {
    close: '}',
    defaultLocale: 'en',
    hideMissing: false,
    hostUrl: '/',
    ignoreNoopLocaleChanges: false,
    open: '{$',
    pathOnHost: 'universe/locale/',
    sameLocaleOnServerConnection: true,
    translationsHeaders: { 'Cache-Control': 'max-age=2628000' },
  } as Options,
  runWithLocale<T>(locale = '', fn: () => T): T {
    return i18n._contextualLocale.withValue(i18n.normalize(locale), fn);
  },
  setLocale(locale: string, options?: SetLocaleOptions) {
    const normalizedLocale = i18n.normalize(locale);
    if (!normalizedLocale) {
      const message = `Unrecognized locale "${locale}"`;
      i18n._logger(message);
      return Promise.reject(message);
    }

    if (i18n.options.ignoreNoopLocaleChanges && i18n.getLocale() === normalizedLocale) {
      return Promise.resolve();
    }

    i18n._locale = normalizedLocale;

    let promise = i18n._loadLocaleWithAncestors(normalizedLocale, options);
    if (!options?.silent) {
      promise = promise.then(() => {
        i18n._emitChange();
      });
    }

    return promise;
  },
  setLocaleOnConnection(locale: string, connectionId?: string) {
    // Actual implementation is only on the server.
  },
  setOptions(options: Partial<Options>) {
    Object.assign(i18n.options, options);
  },
};

i18n.__ = i18n.getTranslation;
i18n.addTranslation = i18n.addTranslations;

function format(integer: number, separator: string) {
  let result = '';
  while (integer) {
    const n = integer % 1e3;
    integer = Math.floor(integer / 1e3);
    if (integer === 0) {
      return n + result;
    }

    result = separator + (n < 10 ? '00' : n < 100 ? '0' : '') + n + result;
  }

  return '0';
}

function interpolateTranslation(
  variables: Omit<GetTranslationOptions, "_locale" | "_purify">,
  string: string,
  open: string,
  close: string
) {
  let newString = string;
  Object.entries(variables).forEach(([key, value]) => {
    const tag = open + key + close;
    if (newString.includes(tag)) {
      newString = newString.split(tag).join(value as string);
    }
  });
  return newString;
}

export { i18n };
