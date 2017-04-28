import i18n from '../lib/i18n';
import locales from '../lib/locales';
import {_} from 'meteor/underscore';
import {UniUtils} from 'meteor/universe:utilities';

const YAML = Npm.require('yamljs');
const stripJsonComments = Npm.require('strip-json-comments');
const URL = Npm.require('url');
const cache = {};

i18n.getCache = function getCache (locale) {
    if (locale) {
        if (!cache[locale]) {
            cache[locale] = {
                updatedAt: new Date().toUTCString(),
                getYML,
                getJSON,
                getJS
            };
        }
        return cache[locale];
    }
    return cache;
};

function getDiff (locale, diffWith) {
    const keys = _.difference(i18n.getAllKeysForLocale(locale), i18n.getAllKeysForLocale(diffWith));
    const diffLoc = {};
    keys.forEach(key => UniUtils.set(diffLoc, key, i18n.getTranslation(key)));
    return diffLoc;
}

function getYML (locale, namespace, diffWith) {
    if (namespace && typeof namespace === 'string') {
        if (!cache[locale]['_yml' + namespace]) {
            let translations = i18n.getTranslations(namespace, locale) || {};
            translations = _.extend({_namespace: namespace}, translations);
            cache[locale]['_yml' + namespace] = YAML.stringify(translations, 4);
        }
        return cache[locale]['_yml' + namespace];
    }
    if (diffWith && typeof diffWith === 'string') {
        if (!cache[locale]['_yml_diff_' + diffWith]) {
            cache[locale]['_yml_diff_' + diffWith] = YAML.stringify(getDiff(locale, diffWith), 4);
        }
        return cache[locale]['_yml_diff_' + diffWith];
    }
    if (!cache[locale]._yml) {
        cache[locale]._yml = YAML.stringify(i18n._translations[locale] || {}, 4);
    }
    return cache[locale]._yml;
}

function getJSON (locale, namespace, diffWith) {
    if (namespace && typeof namespace === 'string') {
        if (!cache[locale]['_json' + namespace]) {
            let translations = i18n.getTranslations(namespace, locale) || {};
            translations = _.extend({_namespace: namespace}, translations);
            cache[locale]['_json' + namespace] = JSON.stringify(translations);
        }
        return cache[locale]['_json' + namespace];
    }
    if (diffWith && typeof diffWith === 'string') {
        if (!cache[locale]['_json_diff_' + diffWith]) {
            cache[locale]['_json_diff_' + diffWith] = YAML.stringify(getDiff(locale, diffWith), 4);
        }
        return cache[locale]['_json_diff_' + diffWith];
    }
    if (!cache[locale]._json) {
        cache[locale]._json = JSON.stringify(i18n._translations[locale] || {});
    }
    return cache[locale]._json;
}

function getJS (locale, namespace, isBefore) {
    const json = getJSON(locale, namespace);
    if (json.length <= 2 && !isBefore) return '';
    if (namespace && typeof namespace === 'string') {
        if (isBefore) {
            return `var w=this||window;w.__uniI18nPre=w.__uniI18nPre||{};w.__uniI18nPre['${locale}.${namespace}'] = ${json}`;
        }
        return `(Package['universe:i18n'].i18n).addTranslations('${locale}', '${namespace}', ${json});`;
    }
    if (isBefore) {
        return `var w=this||window;w.__uniI18nPre=w.__uniI18nPre||{};w.__uniI18nPre['${locale}'] = ${json}`;
    }
    return `(Package['universe:i18n'].i18n).addTranslations('${locale}', ${json});`;
}

i18n._formatgetters = {getJS, getJSON, getYML};
i18n.setOptions({
    translationsHeaders: {
        'Cache-Control': 'max-age=2628000'
    }
});

i18n.loadLocale = (localeName, {
    host = i18n.options.hostUrl, pathOnHost = i18n.options.pathOnHost,
    queryParams = {}, fresh = false, silent = false
} = {}) => {
    localeName = locales[localeName.toLowerCase()] ? locales[localeName.toLowerCase()][0] : localeName;
    queryParams.type = 'json';
    if (fresh) {
        queryParams.ts = (new Date().getTime());
    }
    let url = URL.resolve(host, pathOnHost + localeName);
    const promise = new Promise(function (resolve, reject) {
        HTTP.get(url, {params: queryParams}, (error, result) => {
            const {content} = result || {};
            if (error || !content) {
                return reject(error || 'missing content');
            }
            try {
                i18n.addTranslations(localeName, JSON.parse(stripJsonComments(content)));
                delete cache[localeName];
            } catch (e) {
                return reject(e);
            }
            resolve();
        });
    });
    if (!silent) {
        promise.then(() => {
            const locale = i18n.getLocale();
            //If current locale is changed we must notify about that.
            if (locale.indexOf(localeName) === 0 || i18n.options.defaultLocale.indexOf(localeName) === 0) {
                i18n._emitChange();
            }
        });
    }
    promise.catch(console.error.bind(console));
    return promise;
};
