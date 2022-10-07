import { i18n } from 'meteor/universe:i18n';
import { Tracker } from 'meteor/tracker';
import { ReactiveVar } from 'meteor/reactive-var';

import { Translations } from '../imports/api/TranslationsCollection';
import { locale as storeLocale } from './reactivei18n';

export const reactiveLocale = new ReactiveVar('en');

let latestTranslations = new Map([]);
Tracker.autorun(async () => {
  let locale = reactiveLocale.get();

  const translationTimestamp = Translations.find({ _id: locale }).fetch()[0]
    ?.updatedAt;

  if (!latestTranslations.get(locale)) {
    latestTranslations.set(locale, '');
  }

  // Loading translation when timestamp in database indicates changes in translations
  if (
    translationTimestamp !== undefined &&
    +translationTimestamp !== +latestTranslations.get(locale)
  ) {
    // Updating client's timestamp
    latestTranslations.set(locale, translationTimestamp);
    // Loading updated translations
    await i18n.loadLocale(locale, { fresh: true });
  }

  // Updating i18n locale to match reactiveLocale
  storeLocale.set(locale);
});
