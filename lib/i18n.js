const _events = new UniUtils.Emitter();
const i18n = {
    _defaultLocale: 'en-US',
    setLocale (locale) {
        locale = locale.toLowerCase();
        locale = locale.replace('_', '-');
        if (!locales[locale]) {
            console.error('Wrong locale:', locale, '[Should be xx-yy or xx]');
            return;
        }
        i18n._locale = locales[locale][0];
        _events.emit('changeLocale', i18n._locale);
        // Only if is active
        i18n._deps && i18n._deps.changed();
    },
    getLocale () {
        return i18n._locale || i18n._defaultLocale;
    },
    createComponent (translator = i18n.createTranslator()) {
        if(typeof translator === 'string') {
            translator = i18n.createTranslator(translator);
        }
        return React.createClass({
            displayName: 'T',
            propTypes: {
                children: React.PropTypes.string
            },
            getInitialState() {
              return {systemlocale: '_'};
            },
            render () {
                let {children, ...params} = this.props;
                return React.createElement('span', { dangerouslySetInnerHTML: {
                    __html: translator(children, params)
                }, key: this.state.systemlocale });
            },
            statics: {
                __(translationStr, props) {
                    return translator(translationStr, props)
                }
            },
            _invalidate (locale) {
                this.setState({systemlocale: locale});
            },
            componentWillMount () {
                _events.on('changeLocale', this._invalidate);
            },
            componentWillUnmount () {
                _events.off('changeLocale', this._invalidate);
            }
        });
    },

    createTranslator (namespace, locale) {
        if (typeof locale === 'string' && !locale) {
            locale = undefined;
        }
        return (...args) => {
                if (typeof args[args.length - 1] === 'object') {
                    let params = args[args.length - 1];
                    params._locale = params._locale || locale;
                } else if(locale) {
                    args.push({_locale: locale});
                }
            return i18n.getTranslation(namespace, ...args);
        }
    },

    _translations: {},

    options: {
        open: '{$',
        close: '}'
    },
    //For blaze and autoruns
    createReactiveTranslator (namespace, locale) {
        const translator = i18n.createTranslator(namespace, locale);
        if(!i18n._deps) {
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
        //backwards compatibility
        const firstDot = namespace.indexOf('.');
        let lang = namespace.slice(0, firstDot);
        lang = lang.toLowerCase().replace('_', '-');
        if (locales[lang]) {
            lang = locales[lang][0];
            namespace = lang + namespace.slice(firstDot);
        }
        translation = UniUtils.deepExtend(UniUtils.get(i18n._translations, namespace) || {}, translation);
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
        sep = sep[4];
        return number.replace(/(\d+)[\.,]*(\d*)/gim, function (match, num, dec) {
                return format(+num, sep.charAt(0)) + (dec ? sep.charAt(1) + dec : '');
            }) || '0';
    },
    _locales: locales,
    getCurrencySymbol (locale = i18n.getLocale()) {
        locale = locale.toLowerCase().replace('_', '-');
        return locales[locale] && locales[locale][6];
    },
    getLanguageName (locale = i18n.getLocale()) {
        locale = locale.toLowerCase().replace('_', '-');
        return locales[locale] && locales[locale][1];
    },
    getLanguageNativeName (locale = i18n.getLocale()) {
        locale = locale.toLowerCase().replace('_', '-');
        return locales[locale] && locales[locale][2];
    },
    isRTL (locale = i18n.getLocale()) {
        locale = locale.toLowerCase().replace('_', '-');
        return locales[locale] && locales[locale][3];
    },
    onChangeLocale (fn) {
        if(typeof fn !== 'function'){
            return console.error('Handler must be function');
        }
        _events.on('changeLocale', fn);
    },
    onceChangeLocale (fn) {
        if(typeof fn !== 'function'){
            return console.error('Handler must be function');
        }
        _events.once('changeLocale', fn);
    },
    offChangeLocale (fn) {
        _events.off('changeLocale', fn);
    }
};
i18n.__ = i18n.getTranslation;
i18n.addTranslations = i18n.addTranslation;

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
//Exports
if(typeof System !== 'undefined'){
    System.set(System.normalizeSync('{universe:i18n}'), System.newModule({ i18n, default: i18n }));
}
_i18n = i18n;
