import i18n from '../lib/i18n';
import locales from '../lib/locales';
import {_} from 'meteor/underscore';
import {set} from '../lib/utilities';
import YAML from 'js-yaml';
import stripJsonComments from 'strip-json-comments';
import URL from 'url';

const cache = {};

const YAML_OPTIONS = {skipInvalid: true, indent: 2, schema: YAML.FAILSAFE_SCHEMA, noCompatMode: true, sortKeys: true};

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
    keys.forEach(key => set(diffLoc, key, i18n.getTranslation(key)));
    return diffLoc;
}

function getYML (locale, namespace, diffWith) {
    if (namespace && typeof namespace === 'string') {
        if (!cache[locale]['_yml' + namespace]) {
            let translations = i18n.getTranslations(namespace, locale) || {};
            translations = _.extend({_namespace: namespace}, translations);
            cache[locale]['_yml' + namespace] = YAML.dump(translations, YAML_OPTIONS);
        }
        return cache[locale]['_yml' + namespace];
    }
    if (diffWith && typeof diffWith === 'string') {
        if (!cache[locale]['_yml_diff_' + diffWith]) {
            cache[locale]['_yml_diff_' + diffWith] = YAML.dump(getDiff(locale, diffWith), YAML_OPTIONS);
        }
        return cache[locale]['_yml_diff_' + diffWith];
    }
    if (!cache[locale]._yml) {
        cache[locale]._yml = YAML.dump(i18n._translations[locale] || {}, YAML_OPTIONS);
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
            cache[locale]['_json_diff_' + diffWith] = YAML.safeDump(getDiff(locale, diffWith), {indent: 2});
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

i18n.loadLocale = async (localeName, {
    host = i18n.options.hostUrl, pathOnHost = i18n.options.pathOnHost,
    queryParams = {}, fresh = false, silent = false
} = {}) => {
    localeName = locales[localeName.toLowerCase()] ? locales[localeName.toLowerCase()][0] : localeName;
    queryParams.type = 'json';
    if (fresh) {
        queryParams.ts = (new Date().getTime());
    }
    let url = URL.resolve(host, pathOnHost + localeName);
    try {
        const data = await fetch(url, {method: "GET"});
        const json = await data.json();
        const {content} = json || {};
        if (!content) {
            return console.error('missing content');
        }
        i18n.addTranslations(localeName, JSON.parse(stripJsonComments(content)));
        delete cache[localeName];
        if (!silent) {
            const locale = i18n.getLocale();
            //If current locale is changed we must notify about that.
            if (locale.indexOf(localeName) === 0 || i18n.options.defaultLocale.indexOf(localeName) === 0) {
              i18n._emitChange();
            }
        }
    }catch(err){
        console.error(err);
    }
};
