_i18n.loadLocale = (localeName, options) => {
    const {fresh = false, async = false, silent = false,
        host = _i18n.options.hostUrl, pathOnHost = _i18n.options.pathOnHost} = options || {};

    localeName = locales[localeName.toLowerCase()]? locales[localeName.toLowerCase()][0] : localeName;

    let url = host  + pathOnHost + localeName;

    if (fresh) {
        url += '?ts='+(new Date().getTime());
    }

    const promise = new Promise(function(resolve, reject) {
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
    });
    if (!silent) {
        promise.then(() => {
            const locale = _i18n.getLocale();
            //If current locale is changed we must notify about that.
            if (locale.indexOf(localeName) === 0 || _i18n._defaultLocale.indexOf(localeName) === 0) {
                _i18n._emitChange();
            }
        });
    }
    return promise;
};

// If translation file added manually before this package
if (typeof __uniI18nPre === 'object') {
    Object.keys(__uniI18nPre).map(i => {
        if(__uniI18nPre[i]){
            _i18n.addTranslations(i, __uniI18nPre__[i]);
        }
    });
}

_i18n.isLoaded = (locale = _i18n.getLocale()) => {
    return _i18n._isLoaded[locale];
};