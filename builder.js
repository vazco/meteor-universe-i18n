import  stripJsonComments from 'strip-json-comments';
import {CachingCompiler} from 'meteor/caching-compiler';
import Utils from './lib/utilities';
import YAML from 'js-yaml';

class UniverseI18nBuilder extends CachingCompiler {
    constructor () {
        super({
            compilerName: 'Universe I18n',
            defaultCacheSize: 1024 * 1024 * 10
        });
    }

    getCacheKey (file) {
        return file.getSourceHash() + file.getArch();
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
    "am-et": "am-ET",
    "ar-ae": "ar-AE",
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
    "as-in": "as-IN",
    "az-cyrl": "az-Cyrl",
    "az-cyrl-az": "az-Cyrl-AZ",
    "az-latn": "az-Latn",
    "az-latn-az": "az-Latn-AZ",
    "ba-ru": "ba-RU",
    "be-by": "be-BY",
    "bg-bg": "bg-BG",
    "bn-bd": "bn-BD",
    "bn-in": "bn-IN",
    "bo-cn": "bo-CN",
    "br-fr": "br-FR",
    "bs-cyrl": "bs-Cyrl",
    "bs-cyrl-ba": "bs-Cyrl-BA",
    "bs-latn": "bs-Latn",
    "bs-latn-ba": "bs-Latn-BA",
    "ca-es": "ca-ES",
    "co-fr": "co-FR",
    "cs-cz": "cs-CZ",
    "cy-gb": "cy-GB",
    "da-dk": "da-DK",
    "de-at": "de-AT",
    "de-ch": "de-CH",
    "de-de": "de-DE",
    "de-li": "de-LI",
    "de-lu": "de-LU",
    "dsb-de": "dsb-DE",
    "dv-mv": "dv-MV",
    "el-gr": "el-GR",
    "en-029": "en-029",
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
    "eu-es": "eu-ES",
    "fa-ir": "fa-IR",
    "fi-fi": "fi-FI",
    "fil-ph": "fil-PH",
    "fo-fo": "fo-FO",
    "fr-be": "fr-BE",
    "fr-ca": "fr-CA",
    "fr-ch": "fr-CH",
    "fr-fr": "fr-FR",
    "fr-lu": "fr-LU",
    "fr-mc": "fr-MC",
    "fy-nl": "fy-NL",
    "ga-ie": "ga-IE",
    "gd-gb": "gd-GB",
    "gl-es": "gl-ES",
    "gsw-fr": "gsw-FR",
    "gu-in": "gu-IN",
    "ha-latn": "ha-Latn",
    "ha-latn-ng": "ha-Latn-NG",
    "he-il": "he-IL",
    "hi-in": "hi-IN",
    "hr-ba": "hr-BA",
    "hr-hr": "hr-HR",
    "hsb-de": "hsb-DE",
    "hu-hu": "hu-HU",
    "hy-am": "hy-AM",
    "id-id": "id-ID",
    "ig-ng": "ig-NG",
    "ii-cn": "ii-CN",
    "is-is": "is-IS",
    "it-ch": "it-CH",
    "it-it": "it-IT",
    "iu-cans": "iu-Cans",
    "iu-cans-ca": "iu-Cans-CA",
    "iu-latn": "iu-Latn",
    "iu-latn-ca": "iu-Latn-CA",
    "ja-jp": "ja-JP",
    "ka-ge": "ka-GE",
    "kk-kz": "kk-KZ",
    "kl-gl": "kl-GL",
    "km-kh": "km-KH",
    "kn-in": "kn-IN",
    "ko-kr": "ko-KR",
    "kok-in": "kok-IN",
    "ky-kg": "ky-KG",
    "lb-lu": "lb-LU",
    "lo-la": "lo-LA",
    "lt-lt": "lt-LT",
    "lv-lv": "lv-LV",
    "mi-nz": "mi-NZ",
    "mk-mk": "mk-MK",
    "ml-in": "ml-IN",
    "mn-cyrl": "mn-Cyrl",
    "mn-mn": "mn-MN",
    "mn-mong": "mn-Mong",
    "mn-mong-cn": "mn-Mong-CN",
    "moh-ca": "moh-CA",
    "mr-in": "mr-IN",
    "ms-bn": "ms-BN",
    "ms-my": "ms-MY",
    "mt-mt": "mt-MT",
    "nb-no": "nb-NO",
    "ne-np": "ne-NP",
    "nl-be": "nl-BE",
    "nl-nl": "nl-NL",
    "nn-no": "nn-NO",
    "nso-za": "nso-ZA",
    "oc-fr": "oc-FR",
    "or-in": "or-IN",
    "pa-in": "pa-IN",
    "pl-pl": "pl-PL",
    "prs-af": "prs-AF",
    "ps-af": "ps-AF",
    "pt-br": "pt-BR",
    "pt-pt": "pt-PT",
    "qut-gt": "qut-GT",
    "quz-bo": "quz-BO",
    "quz-ec": "quz-EC",
    "quz-pe": "quz-PE",
    "rm-ch": "rm-CH",
    "ro-ro": "ro-RO",
    "ru-ru": "ru-RU",
    "rw-rw": "rw-RW",
    "sa-in": "sa-IN",
    "sah-ru": "sah-RU",
    "se-fi": "se-FI",
    "se-no": "se-NO",
    "se-se": "se-SE",
    "si-lk": "si-LK",
    "sk-sk": "sk-SK",
    "sl-si": "sl-SI",
    "sma-no": "sma-NO",
    "sma-se": "sma-SE",
    "smj-no": "smj-NO",
    "smj-se": "smj-SE",
    "smn-fi": "smn-FI",
    "sms-fi": "sms-FI",
    "sq-al": "sq-AL",
    "sr-cyrl": "sr-Cyrl",
    "sr-cyrl-ba": "sr-Cyrl-BA",
    "sr-cyrl-cs": "sr-Cyrl-CS",
    "sr-cyrl-me": "sr-Cyrl-ME",
    "sr-cyrl-rs": "sr-Cyrl-RS",
    "sr-latn": "sr-Latn",
    "sr-latn-ba": "sr-Latn-BA",
    "sr-latn-cs": "sr-Latn-CS",
    "sr-latn-me": "sr-Latn-ME",
    "sr-latn-rs": "sr-Latn-RS",
    "sv-fi": "sv-FI",
    "sv-se": "sv-SE",
    "sw-ke": "sw-KE",
    "syr-sy": "syr-SY",
    "ta-in": "ta-IN",
    "te-in": "te-IN",
    "tg-cyrl": "tg-Cyrl",
    "tg-cyrl-tj": "tg-Cyrl-TJ",
    "th-th": "th-TH",
    "tk-tm": "tk-TM",
    "tn-za": "tn-ZA",
    "tr-tr": "tr-TR",
    "tt-ru": "tt-RU",
    "tzm-latn": "tzm-Latn",
    "tzm-latn-dz": "tzm-Latn-DZ",
    "ug-cn": "ug-CN",
    "uk-ua": "uk-UA",
    "ur-pk": "ur-PK",
    "uz-cyrl": "uz-Cyrl",
    "uz-cyrl-uz": "uz-Cyrl-UZ",
    "uz-latn": "uz-Latn",
    "uz-latn-uz": "uz-Latn-UZ",
    "vi-vn": "vi-VN",
    "wo-sn": "wo-SN",
    "xh-za": "xh-ZA",
    "yo-ng": "yo-NG",
    "zh-chs": "zh-CHS",
    "zh-cht": "zh-CHT",
    "zh-cn": "zh-CN",
    "zh-hans": "zh-Hans",
    "zh-hant": "zh-Hant",
    "zh-hk": "zh-HK",
    "zh-mo": "zh-MO",
    "zh-sg": "zh-SG",
    "zh-tw": "zh-TW",
    "zu-za": "zu-ZA",
    "af": "af",
    "am": "am",
    "ar": "ar",
    "arn": "arn",
    "as": "as",
    "az": "az",
    "ba": "ba",
    "be": "be",
    "bg": "bg",
    "bn": "bn",
    "bo": "bo",
    "br": "br",
    "bs": "bs",
    "ca": "ca",
    "co": "co",
    "cs": "cs",
    "cy": "cy",
    "da": "da",
    "de": "de",
    "dsb": "dsb",
    "dv": "dv",
    "el": "el",
    "en": "en",
    "es": "es",
    "et": "et",
    "eu": "eu",
    "fa": "fa",
    "fi": "fi",
    "fil": "fil",
    "fo": "fo",
    "fr": "fr",
    "fy": "fy",
    "ga": "ga",
    "gd": "gd",
    "gl": "gl",
    "gsw": "gsw",
    "gu": "gu",
    "ha": "ha",
    "he": "he",
    "hi": "hi",
    "hr": "hr",
    "hsb": "hsb",
    "hu": "hu",
    "hy": "hy",
    "id": "id",
    "ig": "ig",
    "ii": "ii",
    "is": "is",
    "it": "it",
    "iu": "iu",
    "ja": "ja",
    "ka": "ka",
    "kk": "kk",
    "kl": "kl",
    "km": "km",
    "kn": "kn",
    "ko": "ko",
    "kok": "kok",
    "ky": "ky",
    "lb": "lb",
    "lo": "lo",
    "lt": "lt",
    "lv": "lv",
    "mi": "mi",
    "mk": "mk",
    "ml": "ml",
    "mn": "mn",
    "moh": "moh",
    "mr": "mr",
    "ms": "ms",
    "mt": "mt",
    "nb": "nb",
    "ne": "ne",
    "nl": "nl",
    "nn": "nn",
    "no": "no",
    "nso": "nso",
    "oc": "oc",
    "or": "or",
    "pa": "pa",
    "pl": "pl",
    "prs": "prs",
    "ps": "ps",
    "pt": "pt",
    "qut": "qut",
    "quz": "quz",
    "rm": "rm",
    "ro": "ro",
    "ru": "ru",
    "rw": "rw",
    "sa": "sa",
    "sah": "sah",
    "se": "se",
    "si": "si",
    "sk": "sk",
    "sl": "sl",
    "sma": "sma",
    "smj": "smj",
    "smn": "smn",
    "sms": "sms",
    "sq": "sq",
    "sr": "sr",
    "sv": "sv",
    "sw": "sw",
    "syr": "syr",
    "ta": "ta",
    "te": "te",
    "tg": "tg",
    "th": "th",
    "tk": "tk",
    "tn": "tn",
    "tr": "tr",
    "tt": "tt",
    "tzm": "tzm",
    "ua": "ua", //not iso639-2 but often used
    "ug": "ug",
    "uk": "uk",
    "ur": "ur",
    "uz": "uz",
    "vi": "vi",
    "wo": "wo",
    "xh": "xh",
    "yo": "yo",
    "zh": "zh",
    "zu": "zu"
};
