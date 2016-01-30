const url = Npm.require('url');

WebApp.connectHandlers.use('/universe/locale/', function(req, res, next) {

    const {pathname, query} = url.parse(req.url, true);
    const {type, namespace, preload=false, attachment=false} = query || {};
    if (type && !_.contains(['yml', 'json', 'js'], type)) {
        res.writeHead(415);
        return res.end();
    }
    let locale = pathname.match(/^\/?([a-z]{2}[a-z0-9\-_]*)/i);
    locale = locale && locale[1];
    if (!locale){
        return next();
    }

    const cache = _i18n.getCache(locale);
    if (!cache || !cache.updatedAt) {
        res.writeHead(501);
        return res.end();
    }
    let headerPart = {'Last-Modified': cache.updatedAt};
    if(attachment){
        headerPart['Content-Disposition'] = `attachment; filename="${locale}.i18n.${type||'js'}"`;
    }
    switch (type) {
        case 'json':
            res.writeHead(200, _.extend(
                {'Content-Type': 'application/json; charset=utf-8'},
                _i18n.options.translationsHeaders, headerPart
            ));
            return res.end(cache.getJSON(locale, namespace));
        case 'yml':
            res.writeHead(200, _.extend(
                {'Content-Type': 'text/yaml; charset=utf-8'},
                _i18n.options.translationsHeaders, headerPart
            ));
            return res.end(cache.getYML(locale, namespace));
        default:
            res.writeHead(200, _.extend(
                {'Content-Type': 'application/javascript; charset=utf-8'},
                _i18n.options.translationsHeaders, headerPart
            ));
            return res.end(cache.getJS(locale, namespace, preload));
    }
});
