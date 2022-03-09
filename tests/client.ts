// @ts-ignore
import { i18n } from 'meteor/universe:i18n';

const expect = chai.expect;

describe('universe-i18n - client', () => {
  it('should load translations incrementally', async () => {
    const locale = 'it-IT';
    expect(i18n.isLoaded(locale)).to.not.be.true;
    await i18n.setLocale(locale);
    expect(i18n.isLoaded(locale)).to.be.true;
    expect(i18n.getLocale()).to.equal(locale);
  });

  it('should list only available languages', async () => {
    const locale = 'zh-CN';
    expect(i18n.isLoaded(locale)).to.not.be.true;
    await i18n.setLocale(locale);
    expect(i18n.isLoaded(locale)).to.be.true;
    expect(i18n.getLocale()).to.equal(locale);
  });
});
