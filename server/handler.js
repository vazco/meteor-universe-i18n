const url = Npm.require('url');

WebApp.connectHandlers.use('/universe/locale/', function(req, res, next) {

    const {pathname, query} = url.parse(req.url, true);
    const {type, namespace, ispre=false} = query || {};

    let locale = pathname.match(/^\/?([a-z]{2}[a-z0-9\-_]*)/i);
    locale = locale && locale[1];
    if (!locale){
        return next();
    }

    const cache = _i18n.getCache(locale);
    if (!cache || !cache.updatedAt) {
        return next();
    }

    switch (type) {
        case 'json':
            res.writeHead(200, _.extend(
                {'Content-Type': 'application/json', 'Last-Modified': cache.updatedAt},
                _i18n.options.translationsHeaders
            ));
            return res.end(cache.getJSON(locale, namespace));
        case 'yml':
            res.writeHead(200, _.extend(
                {'Content-Type': 'text/yaml', 'Last-Modified': cache.updatedAt},
                _i18n.options.translationsHeaders
            ));
            return res.end(cache.getYML(locale, namespace));
        default:
            res.writeHead(200, _.extend(
                {'Content-Type': 'application/javascript', 'Last-Modified': cache.updatedAt},
                _i18n.options.translationsHeaders
            ));
            return res.end(cache.getJS(locale, namespace, ispre));
    }
});
