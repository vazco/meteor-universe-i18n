Package.describe({
  name: 'universe:i18n',
  documentation: './atmosphere.md',
  version: '1.32.1',
  summary:
    'Lightweight i18n, YAML & JSON translation files, React component, incremental & remote loading',
  git: 'https://github.com/vazco/meteor-universe-i18n',
});

const npmDependencies = {
  'js-yaml': '4.1.0',
  'strip-json-comments': '3.1.1',
};

Npm.depends(npmDependencies);
Package.registerBuildPlugin({
  name: 'universe:i18n',
  use: ['caching-compiler@1.2.2', 'tracker', 'typescript'],
  sources: [
    'source/common.ts',
    'source/compiler.ts',
    'source/locales.ts',
    'source/utils.ts',
  ],
  npmDependencies,
});

Package.onUse(function (api) {
  api.versionsFrom('2.0');
  api.use([
    'check',
    'ddp',
    'fetch@0.1.1',
    'isobuild:compiler-plugin@1.0.0',
    'promise',
    'tracker',
    'typescript',
    'webapp',
  ]);

  api.mainModule('source/client.ts', 'client');
  api.mainModule('source/server.ts', 'server');
  api.export(['i18n', '_i18n']);
});

Package.onTest(function (api) {
  api.use([
    'lmieulet:meteor-coverage@1.1.4',
    'meteortesting:mocha',
    'practicalmeteor:chai',
    'practicalmeteor:sinon',
    'typescript',
    'universe:i18n',
  ]);

  api.addFiles([
    'tests/common.ts',
    'tests/data/es-es.i18n.json',
    'tests/data/fr-fr.i18n.yml',
    'tests/data/it-it.i18n.yml',
  ]);
  api.addFiles(['tests/client.ts'], 'client');
  api.addFiles(['tests/server.ts'], 'server');
});
