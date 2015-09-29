Package.describe({
    name: 'universe:i18n',
    version: '1.0.4',
    summary: 'React i18n (internationalization) package with YAML & JSON support',
    git: 'https://github.com/vazco/meteor-universe-i18n'
});

Package.registerBuildPlugin({
    name: 'UniverseI18n',
    sources: ['build-plugin.js'],
    npmDependencies: {
        'json-comments': '0.2.1',
        'yamljs': '0.2.3'
    }
});

Package.onUse(function (api) {
    api.versionsFrom('1.1.0.3');

    api.use([
        'universe:modules@0.4.2',
        'universe:utilities@1.0.0 || 2.0.0'
    ]);

    api.addFiles([
        'index.js',
        'index.import.js',
        'lib/locales.import.jsx',
        'lib/i18n.import.jsx'
    ]);
});


