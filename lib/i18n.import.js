import {UniUtils} from '{universe:utilities}!vars';

export const i18n = {
    createComponent (translator) {
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

    translations: {},

    options: {
        open: '{$',
        close: '}'
    },

    getTranslation (prefix, key, params) {
        const open  = i18n.options.open;
        const close = i18n.options.close;

        key = prefix + '.' + key;

        let string = UniUtils.get(i18n.translations, key, key);

        Object.keys(params).forEach(param => {
            string = string.replace(open + param + close, params[param]);
        });

        return string;
    },

    getTranslations (prefix) {
        return UniUtils.get(i18n.translations, prefix, {});
    },

    addTranslation (prefix, key, translation) {
        UniUtils.set(i18n.translations, prefix + '.' + key, translation);
    },

    addTranslations (prefix, map) {
        Object.keys(map).forEach(key => {
            const value = map[key];

            if (typeof value === 'string') {
                i18n.addTranslation(prefix, key, value);
            } else {
                i18n.addTranslations(prefix + '.' + key, value);
            }
        });
    }
}

export default i18n;