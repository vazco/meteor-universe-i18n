Package.describe({
    name: 'universe:i18n',
    version: '1.1.5',
    summary: 'React i18n (internationalization) package with YAML & JSON support',
    git: 'https://github.com/vazco/meteor-universe-i18n'
});

Package.registerBuildPlugin({
    name: 'UniverseI18n',
    use: ['ecmascript@0.1.5', 'caching-compiler@1.0.0'],
    sources: ['builder.js'],
    npmDependencies: {
        'strip-json-comments': '1.0.4',
        'yamljs': '0.2.3'
    }
});

Package.onUse(function (api) {
    api.versionsFrom('1.2.0.2');

    api.use([
        'jsx',
        'universe:modules@0.5.0',
        'universe:utilities@2.0.5',
        'isobuild:compiler-plugin@1.0.0'
    ]);

    api.addFiles([
        'lib/locales.js',
        'lib/i18n.jsx',
        'index.import.js'
    ]);

    api.export('_i18n');
});


