Package.describe({
    name: 'universe:i18n',
    version: '1.3.4',
    summary: 'Lightweight i18n, YAML & JSON translation files, React component, incremental & remote loading',
    git: 'https://github.com/vazco/meteor-universe-i18n'
});

var npmDependencies = {
    'strip-json-comments': '2.0.0',
    'yamljs': '0.2.4'
};

Package.registerBuildPlugin({
    name: 'UniverseI18n',
    use: ['ecmascript@0.1.6', 'caching-compiler@1.0.0', 'underscore@1.0.4'],
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
        'ecmascript',
        'underscore',
        'universe:utilities@2.1.0',
        'isobuild:compiler-plugin@1.0.0'
    ]);

    api.use('universe:modules@0.6.8', {weak:true});
    api.use('react-runtime@0.13.3_6||0.14.1', {weak:true});
    api.use('react@0.13.3_6||0.14.1', {weak:true});

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


