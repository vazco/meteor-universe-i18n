import {UniUtils} from '{universe:utilities}!vars';
import locales from './locales';

export const i18n = {
    _defaultLocale: 'en-us',
    _locale: this._defaultLocale,
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
    createComponent (translator) {
        translator = translator || i18n.createTranslator();
        return React.createClass({
            render () {
                return (
                    <span dangerouslySetInnerHTML={{
                        __html: translator(this.props.children, this.props)
                    }}/>
                );
            }
        });
    },

    createTranslator (prefix) {
        return (key, params) => i18n.getTranslation(prefix, key, params);
    },

    _translations: {},

    options: {
        open: '{$',
        close: '}'
    },
    getTranslation (/*prefix, key, params*/) {
        const open  = i18n.options.open;
        const close = i18n.options.close;
        const args = Array.from(arguments);
        const keysArr = [];
        args.forEach((prop) => {
            if(typeof prop === 'string'){
                keysArr.push(prop);
            }
        });
        const key = keysArr.join('.');
        let token = i18n.getLocale() + '.' + key;
        let string = UniUtils.get(i18n._translations, token);
        if (!string) {
            token = i18n._defaultLocale + '.' + key;
            string = UniUtils.get(i18n._translations, token, key);
        }
        if (typeof args[args.length -1] === 'object') {
            Object.keys(args[args.length -1]).forEach(param => {
                string = string.replace(open + param + close, params[param]);
            });
        }

        return string;
    },
    __: this.getTranslation,
    getTranslations (prefix, locale) {
        if (locale) {
            prefix = locale + '.' + prefix;
        }
        return UniUtils.get(i18n._translations, prefix, {});
    },
    addTranslation (/*locale, prefix, key, translation*/) {
        const args = Array.from(arguments);
        const translation = args.pop();
        UniUtils.set(i18n._translations, args.join('.'), translation);
    },
    addTranslations: this.addTranslation,
    /**
    * parseNumber('7013217.715'); // 7,013,217.715
    * parseNumber('16217 and 17217,715'); // 16,217 and 17,217.715
    * parseNumber('7013217.715', 'ru-ru'); // 7 013 217,715
    */
    parseNumber (number, locale) {
        number = '' + number;
        locale = locale || i18n.getLocale();
        let sep = locales[locale];
        if (!sep) return number;
        return number.replace(/(\d+)[\.,]*(\d*)/gim, function(match, num, dec) {
            return format(+num, sep.charAt(0)) + (dec ? sep.charAt(1) + dec : '');
      }) || '0';
    }
}

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

export default i18n;
