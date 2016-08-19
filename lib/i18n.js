import {UniUtils} from 'meteor/universe:utilities';
import {LOCALES, CURRENCIES, SYMBOLS} from './locales';

const contextualLocale = new Meteor.EnvironmentVariable();
if (Meteor.isServer) {
    // Meteor context must always run within a Fiber.
    var Fiber = Npm.require('fibers');
    const _get = contextualLocale.get.bind(contextualLocale);
    contextualLocale.get = () => {
        if (Fiber.current) {
            return _get();
        }
    }
}

const _events = new UniUtils.Emitter();
export const i18n = {
    _defaultLocale: 'en-US',
    _isLoaded: {},
    normalize (locale) {
        locale = locale.toLowerCase();
        locale = locale.replace('_', '-');
        return LOCALES[locale] && LOCALES[locale][0];
    },
    setLocale (locale, options = {}) {
        locale = locale || '';
        i18n._locale = i18n.normalize(locale);
        if (!i18n._locale) {
            console.error('Wrong locale:', locale, '[Should be xx-yy or xx]');
            return Promise.reject(new Error('Wrong locale: ' + locale + ' [Should be xx-yy or xx]'));
        }
        const {noDownload = false, silent = false} = options;
        if (Meteor.isClient && !noDownload) {
            let promise;
            i18n._isLoaded[i18n._locale] = false;
            options.silent = true;
            if (i18n._locale.indexOf('-') !== -1) {
                promise = i18n.loadLocale(i18n._locale.replace(/\-.*$/, ''), options)
                    .then(() => i18n.loadLocale(i18n._locale, options));
            } else {
                promise = i18n.loadLocale(i18n._locale, options);
            }
            if (!silent) {
                promise = promise.then(() => {
                    i18n._emitChange();
                });
            }
            return promise.catch(console.error.bind(console))
              .then(() => i18n._isLoaded[i18n._locale] = true);
        }
        if (!silent) {
          i18n._emitChange();
        }
        return Promise.resolve();
    },
    /**
     * @param {string} locale
     * @param {function} func that will be launched in locale context
     */
    runWithLocale (locale, func) {
        locale = i18n.normalize(locale);
        return contextualLocale.withValue(locale, func);
    },
    _emitChange (locale = i18n._locale) {
        _events.emit('changeLocale', locale);
        // Only if is active
        i18n._deps && i18n._deps.changed();
    },
    getLocale () {
        return contextualLocale.get() || i18n._locale || i18n._defaultLocale;
    },
    createComponent (translator = i18n.createTranslator(), locale, reactjs, type) {
        if (typeof translator === 'string') {
            translator = i18n.createTranslator(translator, locale);
        }
        if (!reactjs) {
            if (typeof React !== 'undefined') {
                reactjs = React;
            } else if (Package['react-runtime']) {
                reactjs = Package['react-runtime'].React;
            } else {
                try {
                    reactjs = require('react');
                } catch (e) {
                }
            }
            if (!reactjs) {
                console.error('React is not detected!');
            }
        }

        class T extends reactjs.Component {
            constructor(props) {
                super(props);
                this.state = {systemlocale: '_'};
                this._invalidate = (locale) => {
                    this.setState({systemlocale: locale});
                }
            };

            render() {
                const {children, tagType, props= {}, ...params} = this.props;
                return reactjs.createElement(tagType || type || 'span', {
                    ...props,
                    dangerouslySetInnerHTML: {
                        __html: translator(children, params)
                    }, key: this.state.systemlocale
                });
            }

            componentWillMount() {
                _events.on('changeLocale', this._invalidate);
            }

            componentWillUnmount() {
                _events.off('changeLocale', this._invalidate);
            }
        }

        T.propTypes = {
            children: reactjs.PropTypes.string
        };

        T.__ = (translationStr, props) => {
            return translator(translationStr, props)
        };

        return T;
    },

    createTranslator (namespace, locale) {
        if (typeof locale === 'string' && !locale) {
            locale = undefined;
        }
        return (...args) => {
            if (typeof args[args.length - 1] === 'object') {
                let params = args[args.length - 1];
                params._locale = params._locale || locale;
            } else if (locale) {
                args.push({_locale: locale});
            }
            return i18n.getTranslation(namespace, ...args);
        }
    },

    _translations: {},

    setOptions (options) {
        i18n.options = {...i18n.options, ...options};
    },

    //For blaze and autoruns
    createReactiveTranslator (namespace, locale) {
        const translator = i18n.createTranslator(namespace, locale);
        if (!i18n._deps) {
            i18n._deps = new Tracker.Dependency();
        }
        return (...args) => {
            i18n._deps.depend();
            return translator(...args);
        };
    },
    getTranslation (/*namespace, key, params*/) {
        const open = i18n.options.open;
        const close = i18n.options.close;
        const args = [].slice.call(arguments);
        const keysArr = [];
        args.forEach((prop) => {
            if (typeof prop === 'string') {
                keysArr.push(prop);
            }
        });
        const key = keysArr.join('.');
        let params = {};
        if (typeof args[args.length - 1] === 'object') {
            params = args[args.length - 1];
        }
        const currentLang = params._locale || i18n.getLocale();
        let token = currentLang + '.' + key;
        let string = UniUtils.get(i18n._translations, token);
        if (!string) {
            token = currentLang.replace(/-.+$/, '') + '.' + key;
            string = UniUtils.get(i18n._translations, token);

            if (!string) {
                token = i18n._defaultLocale + '.' + key;
                string = UniUtils.get(i18n._translations, token);

                if (!string) {
                    token = i18n._defaultLocale.replace(/-.+$/, '') + '.' + key;
                    string = UniUtils.get(i18n._translations, token, i18n.options.hideMissing ? '' : key);
                }
            }
        }

        Object.keys(params).forEach(param => {
            string = string.replace(open + param + close, params[param]);
        });

        return string;
    },

    getTranslations (namespace, locale = i18n.getLocale()) {
        if (locale) {
            namespace = locale + '.' + namespace;
        }
        return UniUtils.get(i18n._translations, namespace, {});
    },
    addTranslation (locale, ...args) {
        let translation = args.pop();
        let namespace = args.length && args.join('.');
        namespace = namespace && namespace.replace(/(\.\.)|(\.$)/, '');
        locale = locale.toLowerCase().replace('_', '-');
        if (LOCALES[locale]) {
            locale = LOCALES[locale][0];
        }
        namespace = _.compact([locale, namespace]).join('.');
        if (typeof translation !== 'string') {
            translation = UniUtils.deepExtend(
                UniUtils.get(i18n._translations, namespace) || {},
                translation
            );
        }

        return UniUtils.set(i18n._translations, namespace, translation);
    },
    /**
     * parseNumber('7013217.715'); // 7,013,217.715
     * parseNumber('16217 and 17217,715'); // 16,217 and 17,217.715
     * parseNumber('7013217.715', 'ru-ru'); // 7 013 217,715
     */
    parseNumber (number, locale = i18n.getLocale()) {
        number = '' + number;
        locale = locale || '';
        let sep = LOCALES[locale.toLowerCase()];
        if (!sep) return number;
        sep = sep[4];
        return number.replace(/(\d+)[\.,]*(\d*)/gim, function (match, num, dec) {
                return format(+num, sep.charAt(0)) + (dec ? sep.charAt(1) + dec : '');
            }) || '0';
    },
    _locales: LOCALES,
    /**
     * Return array with used languages
     * @param {string} [type='code'] - what type of data should be returned, language code by default.
     * @return {string[]}
     */
    getLanguages (type = 'code') {
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
    getCurrencyCodes (locale = i18n.getLocale()) {
        const countryCode = locale.substr(locale.lastIndexOf('-')+1).toUpperCase();
        return CURRENCIES[countryCode];
    },
    getCurrencySymbol (localeOrCurrCode = i18n.getLocale()) {
        let code = i18n.getCurrencyCodes(localeOrCurrCode);
        code = (code && code[0]) || localeOrCurrCode;
        return SYMBOLS[code];
    },
    getLanguageName (locale = i18n.getLocale()) {
        locale = locale.toLowerCase().replace('_', '-');
        return LOCALES[locale] && LOCALES[locale][1];
    },
    getLanguageNativeName (locale = i18n.getLocale()) {
        locale = locale.toLowerCase().replace('_', '-');
        return LOCALES[locale] && LOCALES[locale][2];
    },
    isRTL (locale = i18n.getLocale()) {
        locale = locale.toLowerCase().replace('_', '-');
        return LOCALES[locale] && LOCALES[locale][3];
    },
    onChangeLocale (fn) {
        if (typeof fn !== 'function') {
            return console.error('Handler must be function');
        }
        _events.on('changeLocale', fn);
    },
    onceChangeLocale (fn) {
        if (typeof fn !== 'function') {
            return console.error('Handler must be function');
        }
        _events.once('changeLocale', fn);
    },
    offChangeLocale (fn) {
        _events.off('changeLocale', fn);
    },
    getAllKeysForLocale (locale = i18n.getLocale(), exactlyThis = false) {
        let iterator = new UniUtils.RecursiveIterator(i18n._translations[locale]);
        const keys = Object.create(null);
        for (let {node, path} of iterator) {
            if (iterator.isLeaf(node)) {
                keys[path.join('.')] = true;
            }
        }
        const indx = locale.indexOf('-');
        if (!exactlyThis && indx >= 2) {
            locale = locale.substr(0, indx);
            iterator = new UniUtils.RecursiveIterator(i18n._translations[locale]);
            for ({node, path} of iterator) {
                if (iterator.isLeaf(node)) {
                    keys[path.join('.')] = true;
                }
            }
        }
        return Object.keys(keys);
    }
};
i18n._ts = 0;
i18n.__ = i18n.getTranslation;
i18n.addTranslations = i18n.addTranslation;
i18n.getRefreshMixin = () => {
    return {
        _localeChanged (locale) {
            this.setState({locale});
        },
        componentWillMount () {
            i18n.onChangeLocale(this._localeChanged);
        },
        componentWillUnmount () {
            i18n.offChangeLocale(this._localeChanged);
        }
    };
};

i18n.setOptions({
    open: '{$',
    close: '}',
    pathOnHost: 'universe/locale/',
    hideMissing: false,
    hostUrl: Meteor.absoluteUrl()
});

function format(int, sep) {
    var str = '';
    var n;

    while (int) {
        n = int % 1e3;
        int = parseInt(int / 1e3);
        if (int === 0) return n + str;
        str = sep + (n < 10 ? '00' : (n < 100 ? '0' : '')) + n + str;
    }
}
_i18n = i18n;
export default i18n;
