import i18n from '../lib/i18n';
import locales from '../lib/locales';
import {Meteor} from 'meteor/meteor';

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

const w=this||window;

// If translation file added manually before this package
if (typeof w.__uniI18nPre === 'object') {
    Object.keys(w.__uniI18nPre).map(i => {
        if (w.__uniI18nPre[i]) {
            i18n.addTranslations(i, w.__uniI18nPre[i]);
        }
    });
}

i18n.isLoaded = (locale = i18n.getLocale()) => {
    return i18n._isLoaded[locale];
};

Meteor.connection._stream.on('reset', () => {
    if (i18n.options.sameLocaleOnServerConnection && i18n._locale) {
        Meteor.call('universe.i18n.setServerLocaleForConnection', i18n._locale);
    }
});
