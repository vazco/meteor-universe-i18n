import { i18n } from 'meteor/universe:i18n';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './en.i18n.yml';
import './main.html';

const localeReactive = new ReactiveVar<string>(i18n.getLocale());
i18n.onChangeLocale(localeReactive.set);

Template.registerHelper('__', function (key: string, ...args: unknown[]) {
  localeReactive.get();
  return i18n.getTranslation(key, ...args);
});
