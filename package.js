Package.describe({
    name: 'universe:i18n',
    version: '1.16.1',
    summary: 'Lightweight i18n, YAML & JSON translation files, React component, incremental & remote loading',
    git: 'https://github.com/vazco/meteor-universe-i18n'
});

var npmDependencies = {
    'strip-json-comments': '2.0.1',
    'js-yaml': '3.12.0'
};

Package.registerBuildPlugin({
    name: 'UniverseI18n',
    use: ['ecmascript', 'caching-compiler@1.1.9', 'underscore'],
    sources: ['builder.js', 'lib/utilities.js'],
    npmDependencies: npmDependencies
});

Npm.depends(npmDependencies);

Package.onUse(function (api) {
    api.versionsFrom('1.5');

    api.use([
        'ddp',
        'http',
        'check',
        'webapp',
        'tracker',
        'promise',
        'ecmascript',
        'underscore',
        'isobuild:compiler-plugin@1.0.0'
    ]);

    api.mainModule('lib/i18n.js');

    api.addFiles([
        'server/api.js',
        'server/syncServerWithClient.js',
        'server/handler.js'
    ], 'server');

    api.addFiles([
        'client/api.js'
    ], 'client');

    api.export(['_i18n', 'i18n']);
});


Package.onTest(function(api) {
    api.use([
        'ecmascript',
        'lmieulet:meteor-coverage@1.1.4',
        'practicalmeteor:chai',
        'practicalmeteor:mocha',
        'practicalmeteor:sinon'
    ]);
    api.use('universe:i18n');

    api.addFiles(['tests/i18n.tests.js', 'tests/es-es.i18n.json', 'tests/fr-fr.i18n.yml', 'tests/it-it.i18n.yml']);
    api.addFiles(['tests/i18n.tests.client.js'], 'client');
    api.addFiles(['tests/i18n.tests.server.js'], 'server');
});
