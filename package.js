Package.describe({
    name: 'universe:i18n',
    version: '1.1.0-rc3',
    summary: 'React i18n (internationalization) package with YAML & JSON support',
    git: 'https://github.com/vazco/meteor-universe-i18n'
});

Package.registerBuildPlugin({
    name: 'UniverseI18n',
    sources: ['build-plugin.js'],
    npmDependencies: {
        'strip-json-comments': '1.0.4',
        'yamljs': '0.2.3'
    }
});

Package.onUse(function (api) {
    api.versionsFrom('1.2.0.2');

    api.use([
        'universe:modules',
        'universe:utilities@2.0.4'
    ]);

    api.addFiles([
        'index.import.js',
        'lib/locales.import.jsx',
        'lib/i18n.import.jsx'
    ]);
});


