import { Tracker } from 'meteor/tracker';
import { Translations } from '../imports/api/TranslationsCollection';
import { i18n } from 'meteor/universe:i18n';
import { locale as storeLocale } from '../imports/utils/i18n';
import { ReactiveVar } from 'meteor/reactive-var';

export const reactiveLocale = new ReactiveVar('en');

let latestTranslations = new Map([]);
Tracker.autorun(async () => {
  let locale = reactiveLocale.get();

  const translationTimestamp = Translations.find({ _id: locale }).fetch()[0]
    ?.updatedAt;

  if (!latestTranslations.get(locale)) {
    latestTranslations.set(locale, '');
  }

  if (
    translationTimestamp !== undefined &&
    +translationTimestamp !== +latestTranslations.get(locale)
  ) {
    latestTranslations.set(locale, translationTimestamp);
    await i18n.loadLocale(locale, { fresh: true });
  }

  storeLocale.set(locale);
});
