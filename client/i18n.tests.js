describe('universe-i18n - client', function () {
    it('should load translations incrementally', async function () {
        expect(i18n.isLoaded['it-IT']).to.not.be.true;
        await i18n.setLocale('it-IT');
        expect(i18n.isLoaded('it-IT')).to.be.true;
        expect(i18n.getLocale()).to.equal('it-IT');
        expect(i18n.getLanguages()).to.include(i18n.getLocale());
    });
})
