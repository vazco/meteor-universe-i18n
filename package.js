Package.describe({
    name: 'universe:i18n',
    version: '0.1.0',
    summary: 'React i18n (internationalization) package for Universe',
    git: 'https://github.com/vazco/meteor-universe-i18n'
});

Package.onUse(function (api) {
    api.versionsFrom('1.1.0.3');

    api.use([
        'universe:modules@0.4.2',
        'universe:utilities@1.0.0'
    ]);

    api.addFiles([
        'index.js',
        'index.import.js',

        'i18n.import.js'
    ]);
});