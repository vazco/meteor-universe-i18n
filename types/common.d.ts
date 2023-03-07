/// <reference types="meteor" />
/// <reference types="node" />
import { EventEmitter } from 'events';
import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';
import { JSONObject } from './utils';
export interface GetCacheEntry {
  getJS(locale: string, namespace?: string, isBefore?: boolean): string;
  getJSON(locale: string, namespace?: string, diff?: string): string;
  getYML(locale: string, namespace?: string, diff?: string): string;
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
  localeRegEx: RegExp;
  open: string;
  pathOnHost: string;
  sameLocaleOnServerConnection: boolean;
  translationsHeaders: Record<string, string>;
}
export interface SetLocaleOptions extends LoadLocaleOptions {
  noDownload?: boolean;
}
declare const i18n: {
  _deps: Tracker.Dependency;
  _emitChange(locale?: string | undefined): void;
  _events: EventEmitter;
  _formatgetters: Pick<GetCacheEntry, 'getJS' | 'getJSON' | 'getYML'>;
  _getConnectionId(
    connection?: Meteor.Connection | null | undefined,
  ): string | undefined;
  _getConnectionLocale(
    connection?: Meteor.Connection | null | undefined,
  ): string | undefined;
  _isLoaded: Record<string, boolean>;
  _loadLocaleWithAncestors(
    locale: string,
    options?: SetLocaleOptions | undefined,
  ): Promise<void>;
  _locale: string;
  _logger(error: unknown): void;
  _normalizeWithAncestors(locale?: string): readonly string[];
  _normalizeWithAncestorsCache: Record<string, readonly string[]>;
  _translations: JSONObject;
  _ts: number;
  _interpolateTranslation(
    variables: Record<string, unknown>,
    translation: string,
  ): string;
  _normalizeGetTranslation(locales: string[], key: string): string;
  __(...args: unknown[]): string;
  addTranslation(locale: string, ...args: unknown[]): {};
  addTranslations(locale: string, ...args: unknown[]): JSONObject;
  getAllKeysForLocale(
    locale?: string | undefined,
    exactlyThis?: boolean,
  ): string[];
  getCache: GetCacheFunction;
  getLocales(): string[];
  getLocale(): string;
  getTranslation(...args: unknown[]): string;
  getTranslations(
    key?: string | undefined,
    locale?: string | undefined,
  ): unknown;
  isLoaded(locale?: string | undefined): boolean;
  loadLocale(
    locale: string,
    options?: LoadLocaleOptions | undefined,
  ): Promise<HTMLScriptElement | undefined>;
  normalize(locale: string): string | undefined;
  offChangeLocale(fn: (locale: string) => void): void;
  onChangeLocale(fn: (locale: string) => void): void;
  onceChangeLocale(fn: (locale: string) => void): void;
  options: Options;
  setLocale(
    locale: string,
    options?: SetLocaleOptions | undefined,
  ): Promise<void>;
  setLocaleOnConnection(
    locale: string,
    connectionId?: string | undefined,
  ): void;
  setOptions(options: Partial<Options>): void;
};
export { i18n };
export default i18n;
//# sourceMappingURL=common.d.ts.map
