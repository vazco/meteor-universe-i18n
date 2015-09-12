import {UniUtils} from '{universe:utilities}!vars';
import locales from './locales';

export const i18n = {
    _defaultLocale: 'en_us',
    setLocale (locale) {
        locale = locale.toLocaleLowerCase();
        if (!locales[locale]) {
            console.error('Missing locale:', locale);
            return;
        }
        i18n._locale = locale;
    },
    getLocale () {
        return i18n._locale || i18n._defaultLocale;
    },
    createComponent (translator = i18n.createTranslator()) {
        return React.createClass({
            displayName: 'T',
            render () {
                return (
                    <span dangerouslySetInnerHTML={{
                        __html: translator(this.props.children, this.props)
                    }}/>
                );
            }
        });
    },

    createTranslator (namespace, locale) {
        if(typeof locale === 'string' && !locale) {
            locale = undefined;
        }
        return (...args) => {
            if(locale){
                if(typeof args[args.length -1] === 'object'){
                    let params = args[args.length -1];
                    params._locale = params._locale || locale;
                } else {
                    args.push({_locale: locale});
                }
            }
            return i18n.getTranslation(namespace, ...args);
        }
    },

    _translations: {},

    options: {
        open: '{$',
        close: '}'
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
            token = currentLang.replace(/_[a-z][a-z]$/, '') + '.' + key;
            string = UniUtils.get(i18n._translations, token);

            if (!string) {
                token = i18n._defaultLocale + '.' + key;
                string = UniUtils.get(i18n._translations, token);

                if (!string) {
                    token = i18n._defaultLocale.replace(/_[a-z]{2}$/, '') + '.' + key;
                    string = UniUtils.get(i18n._translations, token, key);
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
    addTranslation (/*locale, namespace, key, translation*/) {
        const args = [].slice.call(arguments);
        let translation = args.pop();
        let namespace = args.join('.');
        namespace = namespace.replace(/\.\.|\.$/, '');
        translation = merge(UniUtils.get(i18n._translations, namespace) || {}, translation);
        UniUtils.set(i18n._translations, namespace, translation);
    },
    /**
     * parseNumber('7013217.715'); // 7,013,217.715
     * parseNumber('16217 and 17217,715'); // 16,217 and 17,217.715
     * parseNumber('7013217.715', 'ru-ru'); // 7 013 217,715
     */
        parseNumber (number, locale = i18n.getLocale()) {
        number = '' + number;
        let sep = locales[locale];
        if (!sep) return number;
        return number.replace(/(\d+)[\.,]*(\d*)/gim, function (match, num, dec) {
                return format(+num, sep.charAt(0)) + (dec ? sep.charAt(1) + dec : '');
            }) || '0';
    }
};

i18n.__ = i18n.getTranslation;
i18n.addTranslations = i18n.addTranslation;

function format (int, sep) {
    var str = '';
    var n;

    while (int) {
        n = int % 1e3;
        int = parseInt(int / 1e3);
        if (int === 0) return n + str;
        str = sep + (n < 10 ? '00' : (n < 100 ? '0' : '')) + n + str;
    }
}

function merge (...args) {
    let i, j, obj, src, key, keys, len;
    let target = args[0];
    const length = args.length;

    for (i = 1; i < length; ++i) {
        obj = args[i];
        if ((obj === null || typeof obj !== 'object') && typeof obj !== 'function') {
            continue;
        }

        keys = Object.keys(obj);
        len = keys.length;

        for (j = 0; j < len; j++) {
            key = keys[j];
            src = obj[key];
            if (src !== null && typeof src === 'object') {
                if (target[key] === null || typeof target[key] !== 'object') {
                    target[key] = Array.isArray(src) ? [] : {};
                }

                merge([target[key], src], true);
            } else {
                target[key] = src;
            }
        }
    }

    return target;
}

export default i18n;
