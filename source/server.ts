import type { NextHandleFunction } from 'connect';
import Fibers from 'fibers';
import YAML from 'js-yaml';
import { Match, check } from 'meteor/check';
import { DDP } from 'meteor/ddp';
import { Meteor } from 'meteor/meteor';
import { WebApp } from 'meteor/webapp';
import stripJsonComments from 'strip-json-comments';
import URL from 'url';

import { GetCacheEntry, GetCacheFunction, i18n } from './common';
import './global';
import { LOCALES as locales } from './locales';
import { JSONObject, set } from './utils';

i18n.setOptions({ hostUrl: Meteor.absoluteUrl() });

const _get = i18n._contextualLocale.get.bind(i18n._contextualLocale);
i18n._contextualLocale.get = () =>
  Fibers.current ? _get() ?? i18n._getConnectionLocale() : undefined;

function getDiff(locale: string, diffWith?: string) {
  const diff: JSONObject = {};
  const diffKeys = i18n.getAllKeysForLocale(diffWith);
  i18n.getAllKeysForLocale(locale).forEach(key => {
    if (diffKeys.includes(key)) {
      set(diff, key, i18n.getTranslation(key));
    }
  });

  return diff;
}

function getJS(locale: string, namespace: string, isBefore?: boolean) {
  const json = getJSON(locale, namespace);
  if (json.length <= 2 && !isBefore) {
    return '';
  }

  return isBefore
    ? `var w=this||window;w.__uniI18nPre=w.__uniI18nPre||{};w.__uniI18nPre['${locale}${
        namespace && typeof namespace === 'string' ? `.${namespace}` : ''
      }'] = ${json}`
    : `(Package['universe:i18n'].i18n).addTranslations('${locale}', ${
        namespace && typeof namespace === 'string' ? `'${namespace}', ` : ''
      }${json});`;
}

function getCachedFormatter(
  type: 'json' | 'yml',
  format: (translations: JSONObject) => string,
) {
  function cacheEntry(locale: string, namespace: string, diffWith?: string) {
    if (typeof namespace === 'string' && namespace) {
      return {
        key: `_${type}${namespace}`,
        get: () =>
          format({
            _namespace: namespace,
            ...((i18n.getTranslations(namespace, locale) as object) || {}),
          }),
      };
    }

    if (typeof diffWith === 'string' && diffWith) {
      return {
        key: `_${type}_diff_${diffWith}`,
        get: () => format(getDiff(locale, diffWith)),
      };
    }

    return {
      key: `_${type}`,
      get: () => format((i18n._translations[locale] as JSONObject) || {}),
    };
  }

  return function cached(locale: string, namespace: string, diffWith?: string) {
    const localeCache = cache[locale] as unknown as Record<string, string>;
    const { get, key } = cacheEntry(locale, namespace, diffWith);
    if (!(key in localeCache)) {
      localeCache[key] = get();
    }

    return localeCache[key];
  };
}

const getJSON = getCachedFormatter('json', object => JSON.stringify(object));
const getYML = getCachedFormatter('yml', object =>
  YAML.dump(object, {
    indent: 2,
    noCompatMode: true,
    schema: YAML.FAILSAFE_SCHEMA,
    skipInvalid: true,
    sortKeys: true,
  }),
);

i18n._formatgetters = { getJS, getJSON, getYML };

const _publishConnectionId = new Meteor.EnvironmentVariable<
  string | undefined
>();
i18n._getConnectionId = connection => {
  let connectionId = connection?.id;
  try {
    connectionId =
      (DDP as any)._CurrentInvocation.get()?.connection?.id ??
      _publishConnectionId.get();
  } catch (error) {
    // Outside of fibers we cannot detect the connection id.
  }

  return connectionId;
};

const _localesPerConnections: Record<string, string> = {};
i18n._getConnectionLocale = connection =>
  _localesPerConnections[i18n._getConnectionId(connection)!];

const cache: Record<string, GetCacheEntry> = {};
i18n.getCache = (locale => {
  if (!locale) {
    return cache;
  }

  if (!cache[locale]) {
    cache[locale] = {
      updatedAt: new Date().toUTCString(),
      getYML,
      getJSON,
      getJS,
    };
  }

  return cache[locale];
}) as GetCacheFunction;

i18n.loadLocale = async (
  localeName,
  {
    fresh = false,
    host = i18n.options.hostUrl,
    pathOnHost = i18n.options.pathOnHost,
    queryParams = {},
    silent = false,
  } = {},
) => {
  localeName = locales[localeName.toLowerCase()]?.[0] ?? localeName;

  queryParams.type = 'json';
  if (fresh) {
    queryParams.ts = new Date().getTime();
  }

  const url = URL.resolve(host, pathOnHost + localeName);
  try {
    const data = await fetch(url, { method: 'GET' });
    const json = await data.json();
    const { content } = json || {};
    if (content) {
      i18n.addTranslations(localeName, JSON.parse(stripJsonComments(content)));
      delete cache[localeName];
      if (!silent) {
        const locale = i18n.getLocale();
        // If current locale is changed we must notify about that.
        if (
          locale.indexOf(localeName) === 0 ||
          i18n.options.defaultLocale.indexOf(localeName) === 0
        ) {
          i18n._emitChange();
        }
      }
    } else {
      console.error('missing content');
    }
  } catch (error) {
    console.error(error);
  }

  return undefined;
};

i18n.setLocaleOnConnection = (
  locale: string,
  connectionId = i18n._getConnectionId(),
) => {
  if (typeof _localesPerConnections[connectionId!] === 'string') {
    _localesPerConnections[connectionId!] = i18n.normalize(locale)!;
    return;
  }

  throw new Error(`There is no connection under id: ${connectionId}`);
};

WebApp.connectHandlers.use('/universe/locale/', ((request, response, next) => {
  const {
    pathname,
    query: {
      attachment = false,
      diff = false,
      namespace,
      preload = false,
      type,
    },
  } = URL.parse(request.url || '', true);

  if (type && !['js', 'js', 'yml'].includes(type as string)) {
    response.writeHead(415);
    response.end();
    return;
  }

  const locale = pathname?.match(/^\/?([a-z]{2}[a-z0-9\-_]*)/i)?.[1];
  if (!locale) {
    next();
    return;
  }

  const cache = i18n.getCache(locale);
  if (!cache?.updatedAt) {
    response.writeHead(501);
    response.end();
    return;
  }

  const headers: Record<string, string> = {
    ...i18n.options.translationsHeaders,
    'Last-Modified': cache.updatedAt,
  };

  if (attachment) {
    const filename = `${locale}.i18n.${type || 'js'}`;
    headers['Content-Disposition'] = `attachment; filename="${filename}"`;
  }

  switch (type) {
    case 'json':
      response.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8',
        ...headers,
      });
      response.end(cache.getJSON(locale, namespace as string, diff as string));
      break;
    case 'yml':
      response.writeHead(200, {
        'Content-Type': 'text/yaml; charset=utf-8',
        ...headers,
      });
      response.end(cache.getYML(locale, namespace as string, diff as string));
      break;
    default:
      response.writeHead(200, {
        'Content-Type': 'application/javascript; charset=utf-8',
        ...headers,
      });
      response.end(
        cache.getJS(locale, namespace as string, preload as boolean),
      );
      break;
  }
}) as NextHandleFunction);

Meteor.methods({
  'universe.i18n.setServerLocaleForConnection'(locale) {
    check(locale, Match.Any);

    if (
      typeof locale !== 'string' ||
      !i18n.options.sameLocaleOnServerConnection
    ) {
      return;
    }

    const connectionId = i18n._getConnectionId(this.connection);
    if (!connectionId) {
      return;
    }

    i18n.setLocaleOnConnection(locale, connectionId);
  },
});

Meteor.onConnection(connection => {
  _localesPerConnections[connection.id] = '';
  connection.onClose(() => {
    delete _localesPerConnections[connection.id];
  });
});

function patchPublish(publish: typeof Meteor.publish) {
  return function (this: typeof Meteor, name, func, ...args) {
    return publish.call(
      this,
      name,
      function (...args) {
        return _publishConnectionId.withValue(this?.connection?.id, () =>
          func.apply(this, args),
        );
      },
      ...args,
    );
  } as typeof Meteor.publish;
}

Meteor.publish = patchPublish(Meteor.publish);
(Meteor as any).server.publish = patchPublish((Meteor as any).server.publish);

export { i18n };
export default i18n;
