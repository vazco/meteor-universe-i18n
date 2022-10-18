<script>
  import { Meteor } from 'meteor/meteor';
  import { t, locale } from './reactivei18n';
  import { reactiveLocale } from './client';

  const setLanguage = language => {
    // Changing locale should be done via the reactiveLocale to trigger database timestamp check
    reactiveLocale.set(language);
  };

  let localeToUpdate = '';
  let keyToUpdate = '';
  let valueToUpdate = '';
</script>

<div class="container">
  <button on:click={() => setLanguage('en')}>EN</button>
  <button on:click={() => setLanguage('es')}>ESP</button>

  <div>
    Locale: {$locale}
    <br />
    hi: {$t('hi')}
    <br />
    ok: {$t('ok')}
    <br />
    apple: {$t('apple')}
  </div>
  <br />

  <!-- Example of updating locale in the DB from client level-->
  Locale to update:
  <input placeholder="e.g. es" bind:value={localeToUpdate} /><br />
  Key to update:
  <input placeholder="e.g. apple" bind:value={keyToUpdate} /><br />
  New value:
  <input placeholder="e.g. Green apple" bind:value={valueToUpdate} /><br />
  <button
    on:click={() => {
      const newTranslation = {};
      newTranslation[keyToUpdate] = valueToUpdate;

      Meteor.call('translations.updateTranslation', {
        translationId: localeToUpdate,
        newTranslation: newTranslation,
      });
    }}>Update</button
  >
</div>
