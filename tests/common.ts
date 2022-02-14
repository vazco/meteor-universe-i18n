import { i18n } from 'meteor/universe:i18n';

describe('universe-i18n', () => {
  it('should support YAML files', async () => {
    await i18n.setLocale('fr-FR');
    expect(i18n.__('common.name')).to.equal('yml-fr');
  });

  it('should support JSON files', async () => {
    await i18n.setLocale('es-ES');
    expect(i18n.__('common.name')).to.equal('json-es-es');
  });

  it('should support all kinds of translations files', async () => {
    const cases = [
      ['de-CH', 'yml-de-ch'],
      ['el', 'yml-el'],
      ['en-GB', 'json-en-gb'],
      ['es-ES', 'json-es-es'],
      ['fr', 'yml-fr'],
      ['it-IT', 'yml-it-it'],
      ['pl-PL', 'yml-pl-pl'],
      ['tr', 'yml-tr'],
    ];

    for (const [locale, name] of cases) {
      await i18n.setLocale(locale);
      expect(i18n.__('common.name')).to.equal(name);
    }
  });

  it('should be able to set locale', async () => {
    await i18n.setLocale('de-DE');
    expect(i18n.getLocale()).to.equal('de-DE');
    expect(i18n.setLocale('pl-PL')).to.be.ok;
    expect(i18n.getLocale()).to.equal('pl-PL');
  });

  it('should be able to set/get translations', async () => {
    await i18n.setLocale('en-US');
    expect(i18n.addTranslation('en-US', 'common', 'yes', 'Yes')).to.be.ok;
    expect(i18n.__('common.yes')).to.equal('Yes');

    expect(i18n.addTranslation('en-US', 'common.no', 'No')).to.be.ok;
    expect(i18n.__('common.no')).to.equal('No');

    expect(i18n.addTranslation('en-US', 'common.ok', 'Ok')).to.be.ok;
    expect(i18n.__('common.ok')).to.equal('Ok');

    const params = {
      common: {
        hello: 'Hello {$name}',
      },
    };
    expect(i18n.addTranslations('en-US', params)).to.be.ok;
    expect(i18n.getTranslation('common', 'hello', { name: 'World' })).to.equal(
      'Hello World',
    );

    expect(
      i18n.addTranslation(
        'en-US',
        'common',
        'firstAndThird',
        'First: {$0}, Third: {$2}',
      ),
    ).to.be.ok;
    expect(i18n.__('common', 'firstAndThird', ['a', 'b', 'c'])).to.equal(
      'First: a, Third: c',
    );
  });

  it('should be able to listen on locale change', async () => {
    const callback = sinon.spy();

    expect(i18n.onceChangeLocale(callback)).to.equal(undefined);

    await i18n.setLocale('pl-PL');

    expect(callback).to.have.been.calledOnce;
    expect(callback).to.have.been.calledWith('pl-PL');
  });

  it('should be able to set options', async () => {
    await i18n.setLocale('en-US');
    i18n.setOptions({ open: '{{', close: '}}' });

    const params = {
      common: {
        hello: 'Hello {{name}}',
      },
    };
    expect(i18n.addTranslations('en-US', params)).to.be.ok;
    expect(i18n.getTranslation('common', 'hello', { name: 'World' })).to.equal(
      'Hello World',
    );
    i18n.setOptions({ open: '{$', close: '}' });
  });
});
