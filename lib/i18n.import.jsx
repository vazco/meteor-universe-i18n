import {UniUtils} from '{universe:utilities}!vars';

export const i18n = {
    _defaultLocale: 'en_us',
    _locale: this._defaultLocale,
    setLocale (locale) {
        //TODO: validation here
        i18n._locale = locale.toLocaleLowerCase();
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
    addTranslations: this.addTranslation
}

export default i18n;
