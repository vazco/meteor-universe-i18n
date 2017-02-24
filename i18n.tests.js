import {after, describe, expect, it} from 'meteor/universe:e2e';

describe('universe-i18n', function () {
  it('should be able to set locale', function () {
    expect(i18n.setLocale('de-DE')).to.be.ok;
    expect(i18n.getLocale()).to.equal('de-DE');
    expect(i18n.setLocale('pl-PL')).to.be.ok;
    expect(i18n.getLocale()).to.not.equal('de-DE');
    expect(i18n.getLocale()).to.equal('pl-PL');
  })

  it('should be able to set translations by methods', function () {
    expect(i18n.addTranslation('en-US', 'common', 'yes', 'Yes')).to.be.ok;
    expect(i18n.__('common.yes')).to.equal('Yes');

    // expect(i18n.addTranslation('en-US.common', 'no', 'No')).to.be.ok;
    // expect(i18n.__('common.no')).to.equal('No');

    // expect(i18n.addTranslation('en-US.common.ok', 'Ok')).to.be.ok;
    // expect(i18n.__('common.ok')).to.equal('Ok');

    const params = {
        common: {
            hello: 'Hello {$name}'
        }
    };
    expect(i18n.addTranslations('en-US', params)).to.be.ok;
    expect(i18n.__('common', 'hello', {name: 'World'})).to.equal('Hello World');
  })
})
