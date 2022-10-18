<h1 align="center">
    <a href="https://github.com/vazco">vazco</a>/universe:i18n
</h1>

<p align="center">
    <img alt="GitHub Workflow Status" src="https://img.shields.io/github/workflow/status/vazco/meteor-universe-i18n/CI">
    <img alt="GitHub" src="https://img.shields.io/github/license/vazco/meteor-universe-i18n">
 <a href="https://vazco.eu">
        <img src="https://img.shields.io/badge/vazco-package-blue.svg?logo=data%3Aimage%2Fpng%3Bbase64%2CiVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAYAAAAfSC3RAAAABmJLR0QA%2FwD%2FAP%2BgvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4QMfFAIRHb8WQgAAAY1JREFUKM%2BNkLFrGgEUxr87FMnpnXdIqxi1Q3VxachgSbcOgRBCTMbgH9CCW%2BjSUminSpEmBEIpHW7rkCmQSSjEKVOGEAK5bOFyk4c5TMRTyZ1fl5aK9ai%2F8b334%2Ft4QBBmLQmz9jpoLSKYPQCfYdaezi6atTKAMoAYgK1pJ8LkQPr5JspHsbO%2BFilAEADQArCA3Ftn%2FC40KebPO4Ln37peNNxrFxPSXTaW9cPiewDbgYkkXwBYB3B5dHES3W8cpM254ctOJhr3wsKqs7Zj%2FdOZZITkMf9yT%2FKq3e18eHf47fmTT5XE1H%2BQ3GAwDyQ%2FkkxMSvLvhP%2FxZVLc42zYJBf%2FSPMkW57nsd%2Fv03VdDgYDjkajIPkryVDIdd1Xtm0%2Fdhznptvtmr7vu5IkRRRFySiKko%2FH45BlebzgJoBdodls%2FjAM49SyrIau69etVmsIIFStVnPFYvFZoVBY1jRtJZlMpjRNm5MkCaIofhfq9XrMMIyeruuc9u1KpRIulUqqqqpLqqqW0%2Bl0OZVKyb8ANqUwunhV3dcAAAAASUVORK5CYII%3D&style=flat-square">
</a>
</p>

<br />

Internationalization package that offers much better performance than others.

The package supports:

- namespacing of translation strings
- **YAML** file formats
- string interpolation
- both types of parameters (named and positional)
- typographic notation of numbers
- regional dialects inheritance mechanism (e.g. 'en-US' inherits from translations assigned to 'en')
- ECMAScript 6 modules
- **supports dynamic imports** (Client does not need to download all translations at once)
- remote loading of translations from a different host

**Table of Contents**

- [Installation](https://github.com/vazco/meteor-universe-i18n/#installation)
  - [Typescript](https://github.com/vazco/meteor-universe-i18n/#typescript)
- [Migration to v2](https://github.com/vazco/meteor-universe-i18n/#migration-to-v2)
- [Usage](https://github.com/vazco/meteor-universe-i18n/#usage)
  - [Setting/getting locale](https://github.com/vazco/meteor-universe-i18n/#settinggetting-locale)
  - [Adding translations by methods](https://github.com/vazco/meteor-universe-i18n/#adding-translations-by-methods)
  - [Getting translations](https://github.com/vazco/meteor-universe-i18n/#getting-translations)
- [Translations files](https://github.com/vazco/meteor-universe-i18n/#translations-files)
  - [Recognition locale of translation](https://github.com/vazco/meteor-universe-i18n/#recognition-locale-of-translation)
  - [Namespace](https://github.com/vazco/meteor-universe-i18n/#namespace)
    - [Translation in packages](https://github.com/vazco/meteor-universe-i18n/#translation-in-packages)
    - [Translation in application](https://github.com/vazco/meteor-universe-i18n/#translation-in-application)
- [API](https://github.com/vazco/meteor-universe-i18n/#api)
- [Integrations](https://github.com/vazco/meteor-universe-i18n/#integrations)
  - [Integration with React](https://github.com/vazco/meteor-universe-i18n/#integration-with-react)
  - [Integration with Blaze](https://github.com/vazco/meteor-universe-i18n/#integration-with-blaze)
  - [Integration with SimpleSchema](https://github.com/vazco/meteor-universe-i18n/blob/master/README.md#integration-with-simpleschema-package)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Installation

```sh
$ meteor add universe:i18n
```

### Typescript

```sh
$ meteor npm install --save @types/meteor-universe-i18n
```

## Migration to v2

- Locales and currency data have been removed. That means, the following functions are no longer available: `parseNumber`, `getLanguages`, `getCurrencyCodes`, `getCurrencySymbol`, `getLanguageName`, `getLanguageNativeName` and `isRTL`. If your app needs them, check if the [Intl API](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl) suits your needs. If not, copy the values you need from [v1 source](https://github.com/vazco/meteor-universe-i18n/tree/v1.32.5)
- The `_purify` option has been removed, as it wasn't working on the server anyway. For detailed explanation and an alternative, see [this comment](https://github.com/vazco/meteor-universe-i18n/issues/144#issuecomment-1006522371)
- Both `createTranslator` and `createReactiveTranslator` have been removed. If your project is using them, simply create your own helpers on top of `getTranslation`
- The built-in React integration is no longer there, i.e., both `createComponent` and `getRefreshMixin` functions have been removed. Refer to the [Integration with React](#integration-with-react) section for details.
- The Blaze integration package ([universe-i18n-blaze](https://github.com/vazco/universe-i18n-blaze)) is deprecated. Refer to the [Integration with Blaze](#integration-with-blaze) section for details.

If you want to read more about v2, check out the [roadmap](https://github.com/vazco/meteor-universe-i18n/issues/144) as well as the [main pull request](https://github.com/vazco/meteor-universe-i18n/pull/152).

## Usage

```js
import i18n from 'meteor/universe:i18n';
```

### Setting/getting locale

```js
i18n.setLocale('en-US', params);
i18n.getLocale(); // en-US
```

Params in setLocale are optional yet offer additional possibilities:

- `noDownload` - disables downloading translation file on the client (client side)
- `silent` - protects against broadcasting the refresh event (both sides)
- `async` - downloads translation file in an async way (client side)
- `fresh` - downloads fresh translations (ignores the browser cache)
<!-- TODO host, pathOnHost, queryParams ??? -->

If you want to use the browser's locale, you can do it as follows:

```js
// somewhere in the page layout (or possibly in the router?)
function getLang() {
  return (
    navigator.languages?.[0] ||
    navigator.language ||
    navigator.browserLanguage ||
    navigator.userLanguage ||
    'en-US'
  );
}

i18n.setLocale(getLang());
```

Keep in mind though that it will work on the client side and in server methods called from client (on the same connection).
In other places where connection is not detected, you must provide it self.
By the way, It's good option is also use 'accept-language' header to recognize client's locale on server side.

### Adding translations by methods

```js
import i18n from 'meteor/universe:i18n';
import './en.i18n.yml';
import './en-US.i18n.yml';

i18n.addTranslation('en-US', 'Common', 'no', 'No');
i18n.addTranslation('en-US', 'Common.ok', 'Ok');

i18n.addTranslations('en-US', {
  Common: {
    hello: 'Hello {$name} {$0}!',
  },
});

i18n.addTranslations('en-US', 'Common', {
  hello: 'Hello {$name} {$0}!',
});
```

### Getting translations

You can obtain translation strings by using i18n.getTranslation() or, quicker, calling i18n.\_\_()

```js
i18n.__(key);
i18n.__(key, params);
i18n.__(namespace, key, params);
i18n.__(key, key, key, key, params);

// same with "getTranslation", e.g.:
i18n.getTranslation(key, key, key, key, params);
```

### String Interpolation

If needed, parameters can be passed as the last one of the function arguments, as an array or an object since they can be named or positional (ie. indexed). Additionally, for positional parameters it is irrelevant whether they are passed as an array or an object with keys '0', '1', '2'... Besides, 'positional' properties of such an object can be mixed with named ones.

```yml
_namespace: ''
hello: Hello {$name}!
lengthOfArr: length {$length}
items: The first item is {$0} and the last one is {$2}!
```

```js
i18n.__('hello', { name: 'Ania' }); // output: Hello Ania!
i18n.__('lengthOfArr', { length: ['a', 'b', 'c'].length }); // output: length 3
i18n.__('items', ['a', 'b', 'c']); // output: The first item is a and the last one is c!
```

## Translations files

Instead of setting translations directly through i18n.addTranslation(s), you can store them in YAML or JSON files, named **.i18n.yml**, **.i18n.json** accordingly. As locales are by default loaded lazily, the translation files, unless they are attached to the bundle, should be placed in the common space.

### Recognition locale of translation

Files can be named freely as long as they have their respective locale declared under the key '\_locale'.

```yml
_locale: en-US
title: Title
```

Otherwise, files should be named after their respective locales or placed in directories named accordingly. The only requirement

```
en.i18n.yml
en.i18n.json
en_us.i18n.yml
en-us.i18n.yml
en/us.i18n.yml
en-US/someName.i18n.yml
someDir/en-us/someName.i18n.yml
```

### Namespace

Translations in a translation file can be namespaced (depending on where they are located). A namespace can be set up only for a whole file, yet a file as such can add more deeply embedded structures.

_Tip:_ A good practise is using PascalCase for naming of namespaces and for leafs use camelCase. This helps protect against conflicts namespace with string.

#### Splitting keys in file

Comma-separated or `x`-separated keys in file e.g.:

```yml
_splitKey: '.'
Chapter.title: Title
Chapter.xxx: XXX
```

or

```yml
_splitKey: ':'
Chapter:title: Title
Chapter:xxx: XXX
```

Will be loaded as following structure:

```yml
Chapter:
  title: Title
  xxx: XXX
```

#### Translation in packages

For example, translations files in packages are by default namespaced by their package name.

```js
// file en.json in the universe:profile package
{
  "_locale": "en",
  "userName": "User name"
}
```

```js
i18n.__('universe:profile', 'userName'); // output: User name
```

You can change a default namespace for a file by setting a prefix to this file under the key "\_namespace".

```js
// file en.json in the universe:profile package
{
  "_locale": "en-US",
  "_namespace": "Common",
  "userName": "User name"
}
```

And then:

```js
i18n.__('Common', 'userName'); // output: User name
i18n.__('Common.userName'); // output: User name
```

_TIP:_ You can also add translations from a package on the top-level by passing empty string `""` in the key "\_namespace".

#### Translation in application

Here your translations by default are not namespaced which means that your translations from an application space are top-level
and can override every other namespace.

For example:

```yml
# file en_us.yml in an application space (not from a package)
_locale: en-US
userName: user name
```

```js
i18n.__('userName'); // output: User name
```

If you want to add translations under a namespace, you should define it in the key '\_namespace'.

```yml
_locale: en-US
_namespace: User.Listing.Item
userName: User name
```

```js
i18n.__('User.Listing.Item.userName'); // output: User name
i18n.__('User', 'Listing', 'Item.userName'); // output: User name
```

## Listener on language change

```js
// adds a listener on language change
i18n.onChangeLocale(function (newLocale) {
  console.log(newLocale);
});

// removes a listener
i18n.offChangeLocale(fn);

// does something on the first language change and then stops the listener
i18n.onceChangeLocale(fn);
```

## API

```js
// adds a translation
i18n.addTranslation(locale, namespace, key, ..., translation);

// adds translations (same as addTranslation)
i18n.addTranslations(locale, namespace, translationsMap);

// gets a translation in params (_locale)
i18n.getTranslation(namespace, key, ..., params);
i18n.__(namespace, key,..., params);

// get translations (locale is by default set to the current one)
i18n.getTranslations(namespace, locale);

// options
i18n.setOptions({
    // default locale
    defaultLocale: 'en-US',

    // opens string
    open: '{$',

    // closes string
    close: '}',

    // decides whether to show when there's no translation in the current and default language
    hideMissing: false,

    // url to the host with translations (default: Meteor.absoluteUrl())
    // useful when you want to load translations from a different host
    hostUrl: 'http://current.host.url/',

    // (on the server side only) gives you the possibility to add/change response headers
    translationsHeaders = {'Cache-Control':'max-age=2628000'},

    // synchronizes server connection with locale on client. (method invoked by client will be with client side locale)
    sameLocaleOnServerConnection: true
});

// supports dynamic imports
import('../fr.i18n.yml');

// changes locale
i18n.setLocale(locale, params);
// this function on the client side returns a promise (but only if parameter `noDownload !== true`)
// Called from client, it sets locale for connection on server side.
// It mean that method invoked by client will be with client side locale.
// You can turn off this synchronization by setting the global option `sameLocaleOnServerConnection: false`

// Setting locale for connection (if `connectionId` is not provided system will try detect current connection id)
i18n.setLocaleOnConnection(locale, connectionId=);
// this function sets locale in all places, where connection can be detected (like meteor methods)

// gets the current locale
i18n.getLocale();

// fetches translations file from the remote server (client/server)
i18n.loadLocale(locale, params)
// @params on the client { fresh = false, async = false, silent = false,
// host = i18n.options.hostUrl, pathOnHost = i18n.options.pathOnHost }
// @params on server { queryParams = {}, fresh = false, silent = false,
// host = i18n.options.hostUrl, pathOnHost = i18n.options.pathOnHost }
// on the server side, this method uses HTTP.get with query parameter `type=json` to fetch json data
// on the client side, it adds a new script with translations to the head node
// this function returns a promise

// executes function in the locale context,
i18n.runWithLocale(locale, func)
// it means that every default locale used inside a called function will be set to a passed locale
// keep in mind that locale must be loaded first (if it is not bundled)
```

## Integrations

This section showcases some of the ways of integrating `universe:i18n` with different frameworks. More detailed examples can be found in the `integrations` directory.

### Integration with React

There are few different ways to integrate this package with a React application. Here is the most "React-way" solution facilitating `React Context`:

```tsx
// imports/i18n/i18n.tsx
import { i18n } from 'meteor/universe:i18n';
import React, {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

const localeContext = createContext(i18n.getLocale());

export type LocaleProviderProps = { children: ReactNode };

export function LocaleProvider({ children }: LocaleProviderProps) {
  const [locale, setLocale] = useState(i18n.getLocale());
  useEffect(() => {
    i18n.onChangeLocale(setLocale);
    return () => {
      i18n.offChangeLocale(setLocale);
    };
  }, [setLocale]);

  return (
    <localeContext.Provider value={locale}>{children}</localeContext.Provider>
  );
}

export function useLocale() {
  return useContext(localeContext);
}

export function useTranslator(prefix = '') {
  const locale = useLocale();
  return useCallback(
    (key: string, ...args: unknown[]) =>
      i18n.getTranslation(prefix, key, ...args),
    [locale],
  );
}
```

Created above `useTranslator` hook can be used in the following way:

```tsx
// imports/ui/App.tsx
import React from 'react';
import { LocaleProvider, useTranslator } from '/imports/i18n/i18n';

const Component = () => {
  const t = useTranslator();
  return (
    <div>
      <h1>{t('hello')}</h1>
    </div>
  );
};

export const App = () => (
  <LocaleProvider>
    <Component />
  </LocaleProvider>
);
```

Here are other options for React integration:

<details>
<summary>
The most straight-forward approach. Gets transaltion every time language is changed.
</summary>
<br>

```ts
import { i18n } from 'meteor/universe:i18n';
import { useEffect, useState } from 'react';

export function useTranslation(key: string, ...args: unknown[]) {
  const setLocale = useState(i18n.getLocale())[1];
  useEffect(() => {
    i18n.onChangeLocale(setLocale);
    return () => {
      i18n.offChangeLocale(setLocale);
    };
  }, [setLocale]);
  return i18n.getTranslation(key, ...args);
}
```

</details>

<details>
<summary>
Improved version of the solution above. Gets translation every time acctual translation changes, instead of reacting on language changes. Usefull when different languages has same translations.
</summary>
<br>

```ts
import { i18n } from 'meteor/universe:i18n';
import { useEffect, useState } from 'react';

export function useTranslation(key: string, ...args: unknown[]) {
  const getTranslation = () => i18n.getTranslation(key, ...args);
  const [translation, setTranslation] = useState(getTranslation());
  useEffect(() => {
    const update = () => setTranslation(getTranslation());
    i18n.onChangeLocale(update);
    return () => {
      i18n.offChangeLocale(update);
    };
  }, []);
  return translation;
}
```

</details>

<details>
<summary>
The meteor-way solution that facilitates <code>ReactiveVar</code> and <code>useTracker</code>. The advantage of this approach is creating only one listener instead of creating a listener on every locale change.
</summary>
<br>

```ts
import { i18n } from 'meteor/universe:i18n';
// https://docs.meteor.com/api/reactive-var.html
import { ReactiveVar } from 'meteor/reactive-var';
// https://blog.meteor.com/introducing-usetracker-react-hooks-for-meteor-cb00c16d6222
import { useTracker } from 'meteor/react-meteor-data';

const localeReactive = new ReactiveVar<string>(i18n.getLocale());
i18n.onChangeLocale(localeReactive.set);

export function getTranslationReactive(key: string, ...args: unknown[]) {
  localeReactive.get();
  return i18n.getTranslation(key, ...args);
}

export function useTranslation(key: string, ...args: unknown[]) {
  return useTracker(() => getTranslationReactive(key, ...args), []);
}
```

</details>

### Integration with Blaze

```ts
import { i18n } from 'meteor/universe:i18n';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

const localeReactive = new ReactiveVar<string>(i18n.getLocale());
i18n.onChangeLocale(localeReactive.set);

Template.registerHelper('__', function (key: string, ...args: unknown[]) {
  localeReactive.get();
  return i18n.getTranslation(key, ...args);
});
```

### Integration with SimpleSchema package

Add following-like code to main.js:

```js
const registerSchemaMessages = () => {
  SimpleSchema.messages({
    required: i18n.__('SimpleSchema.required'),
  });
};

i18n.onChangeLocale(registerSchemaMessages);
registerSchemaMessages();
```

Put the default error messages somewhere in your project on both sides e.g.:

```yml
_locale: en
_namespace: SimpleSchema

required: '[label] is required'
minString: '[label] must be at least [min] characters'
maxString: '[label] cannot exceed [max] characters'
minNumber: '[label] must be at least [min]'
maxNumber: '[label] cannot exceed [max]'
minNumberExclusive: '[label] must be greater than [min]'
maxNumberExclusive: '[label] must be less than [max]'
minDate: '[label] must be on or after [min]'
maxDate: '[label] cannot be after [max]'
badDate: '[label] is not a valid date'
minCount: 'You must specify at least [minCount] values'
maxCount: 'You cannot specify more than [maxCount] values'
noDecimal: '[label] must be an integer'
notAllowed: '[value] is not an allowed value'
expectedString: '[label] must be a string'
expectedNumber: '[label] must be a number'
expectedBoolean: '[label] must be a boolean'
expectedArray: '[label] must be an array'
expectedObject: '[label] must be an object'
expectedConstructor: '[label] must be a [type]'
RegEx:
  msg: '[label] failed regular expression validation'
  Email: '[label] must be a valid e-mail address'
  WeakEmail: '[label] must be a valid e-mail address'
  Domain: '[label] must be a valid domain'
  WeakDomain: '[label] must be a valid domain'
  IP: '[label] must be a valid IPv4 or IPv6 address'
  IPv4: '[label] must be a valid IPv4 address'
  IPv6: '[label] must be a valid IPv6 address'
  Url: '[label] must be a valid URL'
  Id: '[label] must be a valid alphanumeric ID'
keyNotInSchema: '[key] is not allowed by the schema'
```

## Running Tests

```bash
meteor test-packages --driver-package meteortesting:mocha universe:i18n
```

## License

<img src="https://vazco.eu/banner.png" align="right">

**Like every package maintained by [Vazco](https://vazco.eu/), universe:i18n is [MIT licensed](https://github.com/vazco/meteor-universe-i18n/blob/master/LICENSE).**
