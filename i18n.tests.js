describe('universe-i18n', function () {
  it('should be able to set locale', function () {
    expect(i18n.setLocale('de-DE')).to.be.ok;
    expect(i18n.getLocale()).to.equal('de-DE');
    expect(i18n.setLocale('pl-PL')).to.be.ok;
    expect(i18n.getLocale()).to.equal('pl-PL').and.not.equal('de-DE');
  });

  it('should be able to set/get translations', function () {
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
    expect(i18n.getTranslation('common', 'hello', {name: 'World'})).to.equal('Hello World');

    expect(i18n.addTranslation('en-US', 'common', 'firstAndThird', 'First: {$0}, Third: {$2}')).to.be.ok;
    expect(i18n.__('common', 'firstAndThird', ['a', 'b', 'c'])).to.equal('First: a, Third: c');
  });

  it('should listen on locale change', function (done) {
    const callback = sinon.spy();

    expect(i18n.onChangeLocale(callback)).to.equal(undefined);

    expect(i18n.setLocale('pl-PL')).to.be.ok;

    expect(callback.calledOnce).to.be.true;
    expect(callback.calledWith('pl-PL')).to.be.true;
  });
})
