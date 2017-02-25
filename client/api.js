import i18n from '../lib/i18n';
import locales from '../lib/locales';

i18n.loadLocale = (localeName, options) => {
    const {fresh = false, async = false, silent = false,
        host = i18n.options.hostUrl, pathOnHost = i18n.options.pathOnHost} = options || {};

    localeName = locales[localeName.toLowerCase()]? locales[localeName.toLowerCase()][0] : localeName;

    let url = host  + pathOnHost + localeName;
    if (fresh) {
        url += '?ts='+(new Date().getTime());
    } else {
        url += '?ts='+ i18n._ts;
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
            const locale = i18n.getLocale();
            //If current locale is changed we must notify about that.
            if (locale.indexOf(localeName) === 0 || i18n.options.defaultLocale.indexOf(localeName) === 0) {
                i18n._emitChange();
            }
        });
    }
    return promise;
};

i18n.checkTranslationsAvailability = (locale, options) => {
    const {
        host = i18n.options.hostUrl,
        pathOnHost = i18n.options.pathOnHost,
        availabilityPath = i18n.options.availabilityPath
    } = options || {};

    const request = new XMLHttpRequest();
    const method = 'GET';
    const url = `${host}${pathOnHost}${availabilityPath}${locale}`;
    return new Promise(function(resolve, reject) {
        request.open(method, url, true);
        request.onreadystatechange = function () {
            if(request.readyState === XMLHttpRequest.DONE) {
                if (request.status === 200) {
                    resolve();
                } else {
                    reject(new Error(`Wrong locale: ${locale}, translation does not exists.`));
                }
            }
        };
        request.onerror = function() {
            reject(new Error(`Wrong locale: ${locale}, error occured while checking for translation.`));
        };
        request.ontimeout = function() {
            reject(new Error(`Wrong locale: ${locale}, checking for translation timed out.`));
        };
        request.send();
    });
};

// If translation file added manually before this package
if (typeof __uniI18nPre === 'object') {
    Object.keys(__uniI18nPre).map(i => {
        if(__uniI18nPre[i]){
            i18n.addTranslations(i, __uniI18nPre__[i]);
        }
    });
}

i18n.isLoaded = (locale = i18n.getLocale()) => {
    return i18n._isLoaded[locale];
};
