Package.describe({
    name: 'universe:i18n',
    version: '1.3.5',
    summary: 'Lightweight i18n, YAML & JSON translation files, React component, incremental & remote loading',
    git: 'https://github.com/vazco/meteor-universe-i18n'
});

var npmDependencies = {
    'strip-json-comments': '2.0.0',
    'yamljs': '0.2.4'
};

Package.registerBuildPlugin({
    name: 'UniverseI18n',
    use: ['ecmascript@0.4.0-modules.8', 'caching-compiler@1.0.0', 'underscore@1.0.4'],
    sources: ['builder.js'],
    npmDependencies: npmDependencies
});

Npm.depends(npmDependencies);

Package.onUse(function (api) {
    api.versionsFrom('1.2.1');

    api.use([
        'http',
        'webapp',
        'tracker',
        'promise',
        'underscore',
        'modules@0.5.0-modules.8',
        'ecmascript@0.4.0-modules.8',
        'universe:utilities@2.1.0',
        'isobuild:compiler-plugin@1.0.0'
    ]);

    api.addFiles([
        'lib/locales.js',
        'lib/i18n.js'
    ]);

    api.addFiles([
        'server/api.js',
        'server/handler.js'
    ], 'server');

    api.addFiles([
        'client/api.js'
    ], 'client');

    api.export('_i18n');
});


