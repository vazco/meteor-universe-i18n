import { Meteor } from 'meteor/meteor';
import { i18n } from '../source/server';
import assert from 'assert';

// Node emits each deprecation warning only once per process, so collect them
// from the moment the tests load.
const warnings: Error[] = [];
process.on('warning', warning => warnings.push(warning));

const fetchLocale = (path: string) =>
  fetch(Meteor.absoluteUrl(`universe/locale/${path}`));

describe('universe-i18n - server', () => {
  it('should return object from getCache', () => {
    assert.equal(typeof i18n.getCache(), 'object');
    assert.equal(typeof i18n.getCache('en-US'), 'object');
    assert.equal(typeof i18n.getCache('it-IT'), 'object');
  });

  it('should be able to call getYML', () => {
    const cache = i18n.getCache('it-IT');
    assert.equal(typeof cache, 'object');
    assert.equal(typeof cache.getYML('it-IT'), 'string');
    assert.equal(typeof cache.getYML('it-IT', 'common'), 'string');
  });

  it('should be able to call getJSON', () => {
    const cache = i18n.getCache('es-ES');
    assert.equal(typeof cache, 'object');
    assert.equal(typeof cache.getYML('es-ES'), 'string');
    assert.equal(typeof cache.getYML('es-ES', 'common'), 'string');
  });

  describe('locale handler', () => {
    it('should serve translations as JSON', async () => {
      const response = await fetchLocale('es-ES?type=json');
      assert.equal(response.status, 200);
      assert.match(response.headers.get('content-type')!, /^application\/json/);
      assert.deepEqual(await response.json(), {
        common: { name: 'json-es-es' },
      });
    });

    it('should serve a namespace', async () => {
      const response = await fetchLocale('it-IT?type=json&namespace=common');
      assert.equal(response.status, 200);
      assert.deepEqual(await response.json(), {
        _namespace: 'common',
        name: 'yml-it-it',
      });
    });

    it('should serve YAML as an attachment', async () => {
      const response = await fetchLocale('fr?type=yml&attachment=true');
      assert.equal(response.status, 200);
      assert.match(response.headers.get('content-type')!, /^text\/yaml/);
      assert.equal(
        response.headers.get('content-disposition'),
        'attachment; filename="fr.i18n.yml"',
      );
      assert.match(await response.text(), /name: yml-fr/);
    });

    it('should serve JavaScript by default', async () => {
      const response = await fetchLocale('fr');
      assert.equal(response.status, 200);
      assert.match(
        response.headers.get('content-type')!,
        /^application\/javascript/,
      );
      assert.match(await response.text(), /addTranslations\('fr', /);
    });

    it('should reject an unknown type', async () => {
      const response = await fetchLocale('fr?type=xml');
      assert.equal(response.status, 415);
    });

    it('should not use the deprecated url.parse()', async () => {
      await fetchLocale('fr?type=json');
      const deprecated = warnings.filter(warning =>
        /url\.parse\(\)/.test(warning.message),
      );
      assert.deepEqual(
        deprecated.map(warning => warning.message),
        [],
      );
    });
  });
});
