import { i18n } from 'meteor/universe:i18n';

describe('universe-i18n', () => {
  it('should support YAML files', async () => {
    await i18n.setLocale('fr-FR');
    expect(i18n.__('common.name')).to.equal('yml-fr');
  });

  it('should support JSON files', async () => {
    await i18n.setLocale('es-ES');
    expect(i18n.__('common.name')).to.equal('json-es');
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

  it('should be able to parse numbers', async () => {
    await i18n.setLocale('en-US');
    expect(i18n.parseNumber('7013217.715')).to.equal('7,013,217.715');
    expect(i18n.setLocale('pl-PL')).to.be.ok;
    expect(i18n.parseNumber('16217 and 17217,715', 'en-US')).to.equal(
      '16,217 and 17,217.715',
    );
    expect(i18n.parseNumber('7013217.715', 'ru-RU')).to.equal('7 013 217,715');
  });

  it('should be able to get currency symbol and currency codes', () => {
    expect(i18n.getCurrencySymbol('en-US')).to.equal('$');
    expect(i18n.getCurrencySymbol('USD')).to.equal('$');
    expect(i18n.getCurrencyCodes('en-US')).to.deep.equal(['USD', 'USN', 'USS']);

    expect(i18n.getCurrencySymbol('pl-PL')).to.equal('zł');
    expect(i18n.getCurrencySymbol('PLN')).to.equal('zł');
    expect(i18n.getCurrencyCodes('pl-PL')).to.deep.equal(['PLN']);
  });

  it('should be able to listen on locale change', async () => {
    const callback = sinon.spy();

    expect(i18n.onceChangeLocale(callback)).to.equal(undefined);

    await i18n.setLocale('pl-PL');

    expect(callback).to.have.been.calledOnce;
    expect(callback).to.have.been.calledWith('pl-PL');
  });

  it('should include current language in available languages', async () => {
    await i18n.setLocale('en-US');
    expect(i18n.getLanguages()).to.include(i18n.getLocale());
  });

  it('should be able to create translators', async () => {
    const frenchTranslator = i18n.createTranslator('', 'fr-FR');
    await i18n.setLocale('es-ES');
    expect(i18n.__('common.name')).to.equal('json-es');
    expect(frenchTranslator('common.name')).to.equal('yml-fr');
  });

  it('should be able to create reactive translators', async () => {
    const frenchReactiveTranslator = i18n.createReactiveTranslator('', 'fr-FR');
    await i18n.setLocale('es-ES');
    expect(i18n.__('common.name')).to.equal('json-es');
    expect(frenchReactiveTranslator('common.name')).to.equal('yml-fr');
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

  it('should be able to create translation components', async () => {
    const frenchTranslator = i18n.createTranslator('', 'fr-FR');
    await i18n.setLocale('es-ES');
    const Component = i18n.createComponent(frenchTranslator, 'fr-FR', {
      Component: Object,
      createElement: () => {},
      PropTypes: { string: String },
    });

    expect(Component).to.be.a('Function');
    expect(Component.__('common.name')).to.equal('yml-fr');
  });
});
