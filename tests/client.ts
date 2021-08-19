import { i18n } from 'meteor/universe:i18n';

describe('universe-i18n - client', () => {
  it('should load translations incrementally', async () => {
    expect(i18n.isLoaded('it-IT')).to.not.be.true;
    await i18n.setLocale('it-IT');
    expect(i18n.isLoaded('it-IT')).to.be.true;
    expect(i18n.getLocale()).to.equal('it-IT');
  });

  it('should list only available languages', async () => {
    expect(i18n.isLoaded('zh-CN')).to.not.be.true;
    await i18n.setLocale('zh-CN');
    expect(i18n.isLoaded('zh-CN')).to.be.true;
    expect(i18n.getLanguages()).to.not.include(i18n.getLocale());
  });
});
