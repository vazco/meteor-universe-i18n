System.config({
    packages: {
        '{universe:i18n}': {
            main: 'index',
            format: 'register',
            map: {
                '.': System.normalizeSync('{universe:i18n}')
            }
        }
    }
});