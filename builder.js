import  stripJsonComments from 'strip-json-comments';
import {CachingCompiler} from 'meteor/caching-compiler';
import Utils from './lib/utilities';

import YAML from 'js-yaml';

class UniverseI18nBuilder extends CachingCompiler {
    constructor () {
        super({
            compilerName: 'Universe I18n',
            defaultCacheSize: 1024 * 1024
        });
        if (process.env.UNIVERSE_I18N_LOCALES) {
            this.localesInClientBundle = process.env.UNIVERSE_I18N_LOCALES.split(',');
        } else {
        	this.localesInClientBundle = ['en-us'];
        }
        let lcb = [];
        this.localesInClientBundle = this.localesInClientBundle.map(loc => {
            loc = loc.toLowerCase().trim();
            const loc2 = loc.replace(/\-.+$/, '');
            loc2 !== loc && lcb.push(loc2);
            return loc;
        });
        this.localesInClientBundle.push(...lcb);
    }

    getCacheKey (file) {
        return file.getSourceHash();
    }

    compileResultSize ({data = ''}) {
        return data.length;
    }

    compileOneFile (file) {
        const source = file.getContentsAsString();
        if (!source) {
            return;
        }
        const filePath = file.getPathInPackage();
        let path = filePath.split('.i18n.');
        const type = path[path.length - 1].toLowerCase();
        const packageName = file.getPackageName();
        let translations;
        if (type === 'json') {
            try {
                translations = JSON.parse(stripJsonComments(source));
            } catch (e) {
                file.error({
                    message: `Parsing Error: ${e.message}\n`
                });
                return;
            }
        } else {
            try {
                translations = YAML.load(source, {
                    schema: YAML.FAILSAFE_SCHEMA,
                    onWarning: console.warn.bind(console)
                });
            } catch (e) {
                file.error({
                    message:  `Parsing Error: ${e.message}\n`
                });
                return;
            }
        }

        let locale = translations._locale || getLocaleFromPath(filePath);
        if (!locale) {
            file.error({
                message: `Cannot find localization for file: ${file} ${(
                    packageName ? 'in package: ' + packageName : ''
                )}. Please change file name or set _locale key in file`
            });
            return;
        }
        locale = locale.toLowerCase();
        const namespace = typeof translations._namespace === 'string' ? translations._namespace : packageName || '';
        delete translations._locale;
        delete translations._namespace;
        if (translations._splitKey) {
            this.splitKeys(translations);
        }
        return {
            locale,
            ts: `Package['universe:i18n'].i18n._ts = Math.max(Package['universe:i18n'].i18n._ts, ${Date.now()});`,
            data:`Package['universe:i18n'].i18n.addTranslations('${localesNames[locale]}','${namespace}',${JSON.stringify(translations)});`
        };
    }

    splitKeys (translations) {
        const _splitKeys = translations._splitKey;
        delete translations._splitKey;
        for (let {node, key, parent} of new Utils.RecursiveIterator(translations)) {
            if (key.indexOf(_splitKeys) !== -1) {
                const path = key.split(_splitKeys);
                if (path.every(prop => prop.length)) {
                    delete parent[key];
                    Utils.set(parent, path.join('.'), node);
                }
            }
        }
    }

    addCompileResult (file, {locale, data, ts}) {
        if (file.getArch() === 'web.browser' && !_.contains(this.localesInClientBundle, 'all')) {
            if (!_.contains(this.localesInClientBundle, locale)) {
                file.addJavaScript({
                    path: file.getPathInPackage() + '.js',
                    data: ts
                });
                return;
            }
        }
        file.addJavaScript({
            path: file.getPathInPackage() + '.js',
            sourcePath: file.getPathInPackage(),
            data: data
        });
    }
}

Plugin.registerCompiler({
    extensions: ['i18n.json', 'i18n.yml']
}, () => new UniverseI18nBuilder());

// function getSourcePath (filePath, packageName) {
//     return packageName? `\nPackage: ${packageName}\n File: ${filePath}`: `File: ${filePath}`;
// }

function getLocaleFromPath (path) {
    path = path.toLowerCase();
    var strForSearch = path.replace(/\.i18n\.(?:json|yml)$/, '').replace(/[_\/]/g, '-');
    let thisOne;
    if (typeof strForSearch === 'string') {
        ['^CODE$', '\-CODE$', '(?:^|\-)CODE\-[^-]+$'].some(function (r) {
            thisOne = testIt(r, strForSearch);
            if (thisOne) {
                return true;
            }
        });
        return thisOne;
    }
}
function testIt (reg, str) {
    let thisOne;
    Object.keys(localesNames).some(function (code) {
        let r = new RegExp(reg.replace('CODE', code));
        if (r.test(str)) {
            thisOne = code;
            return true;
        }
    });
    return thisOne;
}

var localesNames = {
    "af-za": "af-ZA",
    "af": "af",
    "am-et": "am-ET",
    "am": "am",
    "ar-ae": "ar-AE",
    "ar": "ar",
    "ar-bh": "ar-BH",
    "ar-dz": "ar-DZ",
    "ar-eg": "ar-EG",
    "ar-iq": "ar-IQ",
    "ar-jo": "ar-JO",
    "ar-kw": "ar-KW",
    "ar-lb": "ar-LB",
    "ar-ly": "ar-LY",
    "ar-ma": "ar-MA",
    "ar-om": "ar-OM",
    "ar-qa": "ar-QA",
    "ar-sa": "ar-SA",
    "ar-sy": "ar-SY",
    "ar-tn": "ar-TN",
    "ar-ye": "ar-YE",
    "arn-cl": "arn-CL",
    "arn": "arn",
    "as-in": "as-IN",
    "as": "as",
    "az-cyrl-az": "az-Cyrl-AZ",
    "az": "az",
    "az-cyrl": "az-Cyrl",
    "az-latn-az": "az-Latn-AZ",
    "az-latn": "az-Latn",
    "ba-ru": "ba-RU",
    "ba": "ba",
    "be-by": "be-BY",
    "be": "be",
    "bg-bg": "bg-BG",
    "bg": "bg",
    "bn-bd": "bn-BD",
    "bn": "bn",
    "bn-in": "bn-IN",
    "bo-cn": "bo-CN",
    "bo": "bo",
    "br-fr": "br-FR",
    "br": "br",
    "bs-cyrl-ba": "bs-Cyrl-BA",
    "bs": "bs",
    "bs-cyrl": "bs-Cyrl",
    "bs-latn-ba": "bs-Latn-BA",
    "bs-latn": "bs-Latn",
    "ca-es": "ca-ES",
    "ca": "ca",
    "co-fr": "co-FR",
    "co": "co",
    "cs-cz": "cs-CZ",
    "cs": "cs",
    "cy-gb": "cy-GB",
    "cy": "cy",
    "da-dk": "da-DK",
    "da": "da",
    "de-at": "de-AT",
    "de": "de",
    "de-ch": "de-CH",
    "de-de": "de-DE",
    "de-li": "de-LI",
    "de-lu": "de-LU",
    "dsb-de": "dsb-DE",
    "dsb": "dsb",
    "dv-mv": "dv-MV",
    "dv": "dv",
    "el-gr": "el-GR",
    "el": "el",
    "en-029": "en-029",
    "en": "en",
    "en-au": "en-AU",
    "en-bz": "en-BZ",
    "en-ca": "en-CA",
    "en-gb": "en-GB",
    "en-ie": "en-IE",
    "en-in": "en-IN",
    "en-jm": "en-JM",
    "en-my": "en-MY",
    "en-nz": "en-NZ",
    "en-ph": "en-PH",
    "en-sg": "en-SG",
    "en-tt": "en-TT",
    "en-us": "en-US",
    "en-za": "en-ZA",
    "en-zw": "en-ZW",
    "es-ar": "es-AR",
    "es": "es",
    "es-bo": "es-BO",
    "es-cl": "es-CL",
    "es-co": "es-CO",
    "es-cr": "es-CR",
    "es-do": "es-DO",
    "es-ec": "es-EC",
    "es-es": "es-ES",
    "es-gt": "es-GT",
    "es-hn": "es-HN",
    "es-mx": "es-MX",
    "es-ni": "es-NI",
    "es-pa": "es-PA",
    "es-pe": "es-PE",
    "es-pr": "es-PR",
    "es-py": "es-PY",
    "es-sv": "es-SV",
    "es-us": "es-US",
    "es-uy": "es-UY",
    "es-ve": "es-VE",
    "et-ee": "et-EE",
    "et": "et",
    "eu-es": "eu-ES",
    "eu": "eu",
    "fa-ir": "fa-IR",
    "fa": "fa",
    "fi-fi": "fi-FI",
    "fi": "fi",
    "fil-ph": "fil-PH",
    "fil": "fil",
    "fo-fo": "fo-FO",
    "fo": "fo",
    "fr-be": "fr-BE",
    "fr": "fr",
    "fr-ca": "fr-CA",
    "fr-ch": "fr-CH",
    "fr-fr": "fr-FR",
    "fr-lu": "fr-LU",
    "fr-mc": "fr-MC",
    "fy-nl": "fy-NL",
    "fy": "fy",
    "ga-ie": "ga-IE",
    "ga": "ga",
    "gd-gb": "gd-GB",
    "gd": "gd",
    "gl-es": "gl-ES",
    "gl": "gl",
    "gsw-fr": "gsw-FR",
    "gsw": "gsw",
    "gu-in": "gu-IN",
    "gu": "gu",
    "ha-latn-ng": "ha-Latn-NG",
    "ha": "ha",
    "ha-latn": "ha-Latn",
    "he-il": "he-IL",
    "he": "he",
    "hi-in": "hi-IN",
    "hi": "hi",
    "hr-ba": "hr-BA",
    "hr": "hr",
    "hr-hr": "hr-HR",
    "hsb-de": "hsb-DE",
    "hsb": "hsb",
    "hu-hu": "hu-HU",
    "hu": "hu",
    "hy-am": "hy-AM",
    "hy": "hy",
    "id-id": "id-ID",
    "id": "id",
    "ig-ng": "ig-NG",
    "ig": "ig",
    "ii-cn": "ii-CN",
    "ii": "ii",
    "is-is": "is-IS",
    "is": "is",
    "it-ch": "it-CH",
    "it": "it",
    "it-it": "it-IT",
    "iu-cans-ca": "iu-Cans-CA",
    "iu": "iu",
    "iu-cans": "iu-Cans",
    "iu-latn-ca": "iu-Latn-CA",
    "iu-latn": "iu-Latn",
    "ja-jp": "ja-JP",
    "ja": "ja",
    "ka-ge": "ka-GE",
    "ka": "ka",
    "kk-kz": "kk-KZ",
    "kk": "kk",
    "kl-gl": "kl-GL",
    "kl": "kl",
    "km-kh": "km-KH",
    "km": "km",
    "kn-in": "kn-IN",
    "kn": "kn",
    "ko-kr": "ko-KR",
    "ko": "ko",
    "kok-in": "kok-IN",
    "kok": "kok",
    "ky-kg": "ky-KG",
    "ky": "ky",
    "lb-lu": "lb-LU",
    "lb": "lb",
    "lo-la": "lo-LA",
    "lo": "lo",
    "lt-lt": "lt-LT",
    "lt": "lt",
    "lv-lv": "lv-LV",
    "lv": "lv",
    "mi-nz": "mi-NZ",
    "mi": "mi",
    "mk-mk": "mk-MK",
    "mk": "mk",
    "ml-in": "ml-IN",
    "ml": "ml",
    "mn-cyrl": "mn-Cyrl",
    "mn": "mn",
    "mn-mn": "mn-MN",
    "mn-mong-cn": "mn-Mong-CN",
    "mn-mong": "mn-Mong",
    "moh-ca": "moh-CA",
    "moh": "moh",
    "mr-in": "mr-IN",
    "mr": "mr",
    "ms-bn": "ms-BN",
    "ms": "ms",
    "ms-my": "ms-MY",
    "mt-mt": "mt-MT",
    "mt": "mt",
    "nb-no": "nb-NO",
    "nb": "nb",
    "ne-np": "ne-NP",
    "ne": "ne",
    "nl-be": "nl-BE",
    "nl": "nl",
    "nl-nl": "nl-NL",
    "nn-no": "nn-NO",
    "nn": "nn",
    "no": "no",
    "nso-za": "nso-ZA",
    "nso": "nso",
    "oc-fr": "oc-FR",
    "oc": "oc",
    "or-in": "or-IN",
    "or": "or",
    "pa-in": "pa-IN",
    "pa": "pa",
    "pl-pl": "pl-PL",
    "pl": "pl",
    "prs-af": "prs-AF",
    "prs": "prs",
    "ps-af": "ps-AF",
    "ps": "ps",
    "pt-br": "pt-BR",
    "pt": "pt",
    "pt-pt": "pt-PT",
    "qut-gt": "qut-GT",
    "qut": "qut",
    "quz-bo": "quz-BO",
    "quz": "quz",
    "quz-ec": "quz-EC",
    "quz-pe": "quz-PE",
    "rm-ch": "rm-CH",
    "rm": "rm",
    "ro-ro": "ro-RO",
    "ro": "ro",
    "ru-ru": "ru-RU",
    "ru": "ru",
    "rw-rw": "rw-RW",
    "rw": "rw",
    "sa-in": "sa-IN",
    "sa": "sa",
    "sah-ru": "sah-RU",
    "sah": "sah",
    "se-fi": "se-FI",
    "se": "se",
    "se-no": "se-NO",
    "se-se": "se-SE",
    "si-lk": "si-LK",
    "si": "si",
    "sk-sk": "sk-SK",
    "sk": "sk",
    "sl-si": "sl-SI",
    "sl": "sl",
    "sma-no": "sma-NO",
    "sma": "sma",
    "sma-se": "sma-SE",
    "smj-no": "smj-NO",
    "smj": "smj",
    "smj-se": "smj-SE",
    "smn-fi": "smn-FI",
    "smn": "smn",
    "sms-fi": "sms-FI",
    "sms": "sms",
    "sq-al": "sq-AL",
    "sq": "sq",
    "sr-cyrl-ba": "sr-Cyrl-BA",
    "sr": "sr",
    "sr-cyrl-cs": "sr-Cyrl-CS",
    "sr-cyrl-me": "sr-Cyrl-ME",
    "sr-cyrl-rs": "sr-Cyrl-RS",
    "sr-cyrl": "sr-Cyrl",
    "sr-latn-ba": "sr-Latn-BA",
    "sr-latn-cs": "sr-Latn-CS",
    "sr-latn-me": "sr-Latn-ME",
    "sr-latn-rs": "sr-Latn-RS",
    "sr-latn": "sr-Latn",
    "sv-fi": "sv-FI",
    "sv": "sv",
    "sv-se": "sv-SE",
    "sw-ke": "sw-KE",
    "sw": "sw",
    "syr-sy": "syr-SY",
    "syr": "syr",
    "ta-in": "ta-IN",
    "ta": "ta",
    "te-in": "te-IN",
    "te": "te",
    "tg-cyrl-tj": "tg-Cyrl-TJ",
    "tg": "tg",
    "tg-cyrl": "tg-Cyrl",
    "th-th": "th-TH",
    "th": "th",
    "tk-tm": "tk-TM",
    "tk": "tk",
    "tn-za": "tn-ZA",
    "tn": "tn",
    "tr-tr": "tr-TR",
    "tr": "tr",
    "tt-ru": "tt-RU",
    "tt": "tt",
    "tzm-latn-dz": "tzm-Latn-DZ",
    "tzm": "tzm",
    "tzm-latn": "tzm-Latn",
    "ug-cn": "ug-CN",
    "ug": "ug",
    "ua": "ua", //not iso639-2 but often used
    "uk-ua": "uk-UA",
    "uk": "uk",
    "ur-pk": "ur-PK",
    "ur": "ur",
    "uz-cyrl-uz": "uz-Cyrl-UZ",
    "uz": "uz",
    "uz-cyrl": "uz-Cyrl",
    "uz-latn-uz": "uz-Latn-UZ",
    "uz-latn": "uz-Latn",
    "vi-vn": "vi-VN",
    "vi": "vi",
    "wo-sn": "wo-SN",
    "wo": "wo",
    "xh-za": "xh-ZA",
    "xh": "xh",
    "yo-ng": "yo-NG",
    "yo": "yo",
    "zh-chs": "zh-CHS",
    "zh": "zh",
    "zh-cht": "zh-CHT",
    "zh-cn": "zh-CN",
    "zh-hk": "zh-HK",
    "zh-hans": "zh-Hans",
    "zh-hant": "zh-Hant",
    "zh-mo": "zh-MO",
    "zh-sg": "zh-SG",
    "zh-tw": "zh-TW",
    "zu-za": "zu-ZA",
    "zu": "zu"
};
