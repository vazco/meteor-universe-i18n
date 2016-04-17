Package.describe({
    name: 'universe:i18n',
    version: '1.4.1',
    summary: 'Lightweight i18n, YAML & JSON translation files, React component, incremental & remote loading',
    git: 'https://github.com/vazco/meteor-universe-i18n'
});

var npmDependencies = {
    'strip-json-comments': '2.0.1',
    'yamljs': '0.2.7'
};

Package.registerBuildPlugin({
    name: 'UniverseI18n',
    use: ['ecmascript', 'caching-compiler@1.0.3', 'underscore'],
    sources: ['builder.js'],
    npmDependencies: npmDependencies
});

Npm.depends(npmDependencies);

Package.onUse(function (api) {
    api.versionsFrom('1.3');

    api.use([
        'http',
        'webapp',
        'tracker',
        'promise',
        'ecmascript',
        'underscore',
        'universe:utilities@2.3.2',
        'isobuild:compiler-plugin@1.0.0'
    ]);

    api.mainModule('lib/i18n.js');

    api.addFiles([
        'server/api.js',
        'server/handler.js'
    ], 'server');

    api.addFiles([
        'client/api.js'
    ], 'client');

    api.export(['_i18n', 'i18n']);
});


