import i18n from '../lib/i18n';

const url = Npm.require('url');

WebApp.connectHandlers.use('/universe/locale/', function(req, res, next) {

    const {pathname, query} = url.parse(req.url, true);
    const {type, namespace, preload=false, attachment=false, diff=false} = query || {};
    if (type && !['yml', 'json', 'js'].includes(type)) {
        res.writeHead(415);
        return res.end();
    }
    let locale = pathname.match(/^\/?([a-z]{2}[a-z0-9\-_]*)/i);
    locale = locale && locale[1];
    if (!locale) {
        return next();
    }

    const cache = i18n.getCache(locale);
    if (!cache || !cache.updatedAt) {
        res.writeHead(501);
        return res.end();
    }
    const headerPart = {'Last-Modified': cache.updatedAt};
    if (attachment) {
        headerPart['Content-Disposition'] = `attachment; filename="${locale}.i18n.${type||'js'}"`;
    }
    switch (type) {
        case 'json':
            res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8',
              ...i18n.options.translationsHeaders, ...headerPart});
            return res.end(cache.getJSON(locale, namespace, diff));
        case 'yml':
            res.writeHead(200, {'Content-Type': 'text/yaml; charset=utf-8',
              ...i18n.options.translationsHeaders, ...headerPart});
            return res.end(cache.getYML(locale, namespace, diff));
        default:
            res.writeHead(200, {'Content-Type': 'application/javascript; charset=utf-8',
              ...i18n.options.translationsHeaders, ...headerPart});
            return res.end(cache.getJS(locale, namespace, preload));
    }
});
