_i18n.loadLocale = (localeName, options) => {
    const {fresh = false, async = false} = options || {};
    let locale = localeName.toLowerCase();
    localeName = locales[locale][0] || localeName;
    let url = '/universe/locale/'+localeName;
    if (fresh) {
        url += '?ts='+(new Date().getTime());
    }
    return new Promise(function(resolve, reject) {
        let script = document.querySelector(`script[src="${url}"]`);
        if (script) {
            return resolve(script);
        }
        script = document.createElement('script');
        script.type = 'text/javascript';
        if (async) {
            script.async = async;
        }
        script.src = url;
        script.addEventListener('load', function() {
            resolve(script);
        }, false);

        script.addEventListener('error', function() {
            reject(script);
        }, false);
        const head = (document.head || document.getElementsByTagName('head')[0]);
        head.appendChild(script);
    }).then(() => {
        const locale = _i18n.getLocale();
        //If current locale is changed we must notify about that.
        if (locale.indexOf(localeName) === 0 || _i18n._defaultLocale.indexOf(localeName) === 0) {
            _i18n._emitChange();
        }
    });
};
// If translation file added manually before this package
if (typeof __uniI18nPre === 'object') {
    Object.keys(__uniI18nPre).map(i => {
        if(__uniI18nPre[i]){
            _i18n.addTranslations(i, __uniI18nPre__[i]);
        }
    });
}
_i18n.loadLocale(_i18n.getLocale());