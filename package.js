Package.describe({
  name: 'universe:i18n',
  version: '2.1.0',
  summary:
    'Lightweight i18n, YAML & JSON translation files, string interpolation, incremental & remote loading',
  git: 'https://github.com/vazco/meteor-universe-i18n.git',
  documentation: './ATMOSPHERE.md',
});

const npmDependencies = {
  'js-yaml': '4.1.0',
  'strip-json-comments': '3.1.1',
  '@babel/runtime': '7.20.7',
};

Npm.depends(npmDependencies);
Package.registerBuildPlugin({
  name: 'universe:i18n',
  use: ['caching-compiler@1.2.2 || 2.0.0-beta300.6 || 2.0.0', 'tracker', 'typescript'],
  sources: [
    'source/common.ts',
    'source/compiler.ts',
    'source/utils.ts',
    'source/code-generators.ts',
  ],
  npmDependencies,
});

Package.onUse(function (api) {
  api.versionsFrom(['2.3', '3.0-beta.6']);
  api.use([
    'check',
    'ddp',
    'fetch@0.1.1',
    'isobuild:compiler-plugin@1.0.0',
    'promise',
    'tracker',
    'typescript',
    'webapp',
    'zodern:types@1.0.0',
  ]);

  api.mainModule('source/client.ts', 'client');
  api.mainModule('source/server.ts', 'server');
  api.export(['i18n', '_i18n']);
});

Package.onTest(function (api) {
  api.use([
    'meteortesting:mocha@3.0.3-alpha300.11',
    'typescript',
    'universe:i18n',
  ]);

  api.addFiles([
    'tests/data/de/ch.i18n.yml',
    'tests/data/en_gb.i18n.json',
    'tests/data/es-es.i18n.json',
    'tests/data/fr.i18n.yml',
    'tests/data/it-it.i18n.yml',
    'tests/data/nest/el/y.i18n.yml',
    'tests/data/pl-pl/x.i18n.yml',
    'tests/data/z.i18n.yml',
  ]);
  api.addFiles(['tests/client.ts', 'tests/common.ts'], 'client');
  api.addFiles(['tests/server.ts', 'tests/common.ts'], 'server');
});
