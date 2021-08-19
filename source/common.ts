import { EventEmitter } from 'events';
import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';

import { CURRENCIES, LOCALES, SYMBOLS } from './locales';
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
  purify?: (string: string) => string;
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
  open: string;
  pathOnHost: string;
  purify: undefined | ((string: string) => string);
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
  _locales: LOCALES,
  _logger(error: unknown) {
    console.error(error);
  },
  _normalizeWithAncestors(locale = '') {
    if (!(locale in i18n._normalizeWithAncestorsCache)) {
      const locales: string[] = [];
      const parts = locale.toLowerCase().split(/[-_]/);
      while (parts.length) {
        const locale = parts.join('-');
        if (locale in LOCALES) {
          locales.push(LOCALES[locale][0]);
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
  createComponent(
    translatorSeed?: string | ((...args: unknown[]) => string),
    locale?: string,
    reactjs?: typeof import('react'),
    type?: React.ComponentType | string,
  ) {
    const translator =
      typeof translatorSeed === 'string'
        ? i18n.createTranslator(translatorSeed, locale)
        : translatorSeed === undefined
        ? i18n.createTranslator()
        : translatorSeed;

    if (!reactjs) {
      if (typeof React !== 'undefined') {
        reactjs = React;
      } else {
        try {
          reactjs = require('react');
        } catch (error) {
          // Ignore.
        }
      }

      if (!reactjs) {
        console.error('React is not detected!');
      }
    }

    type Props = {
      _containerType?: React.ComponentType | string;
      _props?: {};
      _tagType?: React.ComponentType | string;
      _translateProps?: string[];
      children?: React.ReactNode;
    };

    return class T extends reactjs!.Component<Props> {
      static __ = translator;

      _invalidate = () => this.forceUpdate();

      render() {
        const {
          _containerType,
          _props = {},
          _tagType,
          _translateProps,
          children,
          ...params
        } = this.props;

        const tagType = _tagType || type || 'span';
        const items = reactjs!.Children.map(children, (item, index) => {
          if (typeof item === 'string' || typeof item === 'number') {
            return reactjs!.createElement(tagType, {
              ..._props,
              dangerouslySetInnerHTML: { __html: translator(item, params) },
              key: `_${index}`,
            } as any);
          }

          if (Array.isArray(_translateProps)) {
            const newProps: Record<string, string> = {};
            _translateProps.forEach(propName => {
              const prop = (item as any).props[propName];
              if (prop && typeof prop === 'string') {
                newProps[propName] = translator(prop, params);
              }
            });

            return reactjs!.cloneElement(item as any, newProps);
          }

          return item;
        });

        if (items?.length === 1) {
          return items[0];
        }

        const containerType = _containerType || type || 'div';
        return reactjs!.createElement(containerType, { ..._props }, items);
      }

      componentDidMount() {
        i18n._events.on('changeLocale', this._invalidate);
      }

      componentWillUnmount() {
        i18n._events.removeListener('changeLocale', this._invalidate);
      }
    };
  },
  createReactiveTranslator(namespace?: string, locale?: string) {
    const translator = i18n.createTranslator(namespace, locale);
    return (...args: unknown[]) => {
      i18n._deps.depend();
      return translator(...args);
    };
  },
  createTranslator(
    namespace?: string,
    options?: string | CreateTranslatorOptions,
  ) {
    const finalOptions =
      typeof options === 'string'
        ? options === ''
          ? {}
          : { _locale: options }
        : options;

    return (...args: any[]) => {
      let _namespace = namespace;
      const finalArg = args.length - 1;
      if (typeof args[finalArg] === 'object') {
        _namespace = args[finalArg]._namespace || _namespace;
        args[finalArg] = { ...finalOptions, ...args[finalArg] };
      } else if (options) {
        args.push(options);
      }

      if (_namespace) {
        args.unshift(_namespace);
      }

      return i18n.getTranslation(...args);
    };
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
  getCurrencyCodes(locale?: string) {
    if (locale === undefined) {
      locale = i18n.getLocale();
    }

    const countryCode = locale
      .substr(locale.lastIndexOf('-') + 1)
      .toUpperCase();
    return CURRENCIES[countryCode];
  },
  getCurrencySymbol(locale?: string) {
    if (locale === undefined) {
      locale = i18n.getLocale();
    }

    const code = i18n.getCurrencyCodes(locale);
    return SYMBOLS[code?.[0] || locale];
  },
  getLanguageName(locale?: string) {
    return i18n._locales[i18n.normalize(locale ?? i18n.getLocale())!]?.[1];
  },
  getLanguageNativeName(locale?: string) {
    return i18n._locales[i18n.normalize(locale ?? i18n.getLocale())!]?.[2];
  },
  getLanguages(type: 'code' | 'name' | 'nativeName' = 'code') {
    const codes = Object.keys(i18n._translations);
    switch (type) {
      case 'code':
        return codes;
      case 'name':
        return codes.map(i18n.getLanguageName);
      case 'nativeName':
        return codes.map(i18n.getLanguageNativeName);
      default:
        return [];
    }
  },
  getLocale() {
    return (
      i18n._contextualLocale.get() ?? i18n._locale ?? i18n.options.defaultLocale
    );
  },
  getRefreshMixin() {
    return {
      _localeChanged(this: React.Component, locale: string) {
        this.setState({ locale });
      },
      componentWillMount() {
        i18n.onChangeLocale(this._localeChanged);
      },
      componentWillUnmount() {
        i18n.offChangeLocale(this._localeChanged);
      },
    };
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
      purify = i18n.options.purify,
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
    Object.entries(variables).forEach(([key, value]) => {
      const tag = open + key + close;
      if (string.includes(tag)) {
        string = string.split(tag).join(value as string);
      }
    });

    return typeof purify === 'function' ? purify(string) : string;
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
  isRTL(locale?: string) {
    return i18n._locales[i18n.normalize(locale ?? i18n.getLocale())!]?.[3];
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
    open: '{$',
    pathOnHost: 'universe/locale/',
    purify: undefined,
    sameLocaleOnServerConnection: true,
    translationsHeaders: { 'Cache-Control': 'max-age=2628000' },
  } as Options,
  parseNumber(number: number, locale?: string) {
    const numberAsString = String(number);
    const normalizedLocale = i18n.normalize(locale ?? i18n.getLocale())!;
    const separator = i18n._locales[normalizedLocale.toLowerCase()]?.[4];
    const result = separator
      ? numberAsString.replace(
          /(\d+)[\.,]*(\d*)/gm,
          (_, integer, decimal) =>
            format(+integer, separator[0]) +
            (decimal ? separator[1] + decimal : ''),
        )
      : numberAsString;
    return result || '0';
  },
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

export { i18n };
