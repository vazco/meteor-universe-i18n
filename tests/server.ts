import { i18n } from 'meteor/universe:i18n';

describe('universe-i18n - server', () => {
  it('should return object from getCache', () => {
    expect(i18n.getCache()).to.be.an('object');
    expect(i18n.getCache('en-US')).to.be.an('object');
    expect(i18n.getCache('it-IT')).to.be.an('object');
  });

  it('should be able to call getYML', () => {
    const cache = i18n.getCache('it-IT');
    expect(cache).to.be.an('object');
    expect(cache.getYML('it-IT')).to.be.a('string');
    expect(cache.getYML('it-IT', 'common')).to.be.a('string');
  });

  it('should be able to call getJSON', () => {
    const cache = i18n.getCache('es-ES');
    expect(cache).to.be.an('object');
    expect(cache.getYML('es-ES')).to.be.a('string');
    expect(cache.getYML('es-ES', 'common')).to.be.a('string');
  });
});
