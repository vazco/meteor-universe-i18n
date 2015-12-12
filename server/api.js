const YAML = Npm.require('yamljs');
const cache = {};

_i18n.getCache = function getCache(locale){
    if (locale){
        if (!cache[locale]) {
            cache[locale] = {
                updatedAt: new Date(),
                getYML,
                getJSON,
                getJS
            };
        }
        return cache[locale];
    }
    return cache;
};

function getYML (locale, namespace) {
    if (namespace && typeof namespace === 'string') {
        if (!cache[locale]['_yml'+namespace]) {
            let translations = _i18n.getTranslations(namespace, locale) || {};
            translations = _.extend({_namespace: namespace}, translations);
            cache[locale]['_yml'+namespace] = YAML.stringify(translations, 4);
        }
        return cache[locale]['_yml'+namespace];
    }
    if (!cache[locale]._yml) {
        cache[locale]._yml = YAML.stringify(_i18n._translations[locale] || {}, 4);
    }
    return cache[locale]._yml;
}

function getJSON (locale, namespace) {
    if (namespace && typeof namespace === 'string') {
        if (!cache[locale]['_json'+namespace]) {
            let translations = _i18n.getTranslations(namespace, locale) || {};
            translations = _.extend({_namespace: namespace}, translations);
            cache[locale]['_json'+namespace] = JSON.stringify(translations);
        }
        return cache[locale]['_json'+namespace];
    }
    if (!cache[locale]._json) {
        cache[locale]._json = JSON.stringify(_i18n._translations[locale] || {});
    }
    return cache[locale]._json;
}

function getJS (locale, namespace, isBefore) {
    const json = getJSON(locale, namespace);
    if (namespace && typeof namespace === 'string'){
        if (isBefore) {
            return `var w=this||window;w.__uniI18nPre=w.__uniI18nPre||{};w.__uniI18nPre['${locale}.${namespace}'] = ${json}`;
        }
        return `(Package['universe:i18n']._i18n).addTranslations('${locale}', '${namespace}', ${json});`;
    }
    if (isBefore) {
        return `var w=this||window;w.__uniI18nPre=w.__uniI18nPre||{};w.__uniI18nPre['${locale}'] = ${json}`;
    }
    return `(Package['universe:i18n']._i18n).addTranslations('${locale}', ${json});`;
}

_i18n.options.translationsHeaders = {'Cache-Control':'max-age=31536000'};