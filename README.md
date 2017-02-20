<a href="http://unicms.io"><img src="http://unicms.io/banners/standalone.png" /></a>
# Universe i18n
Internationalization package that offers much better performance than others (as it depends, if used with React, on a simple event emitter rather than much heavier Tracker dependency).

The package supports:
- namespacing of translation strings
- **YAML** and **JSON** file formats
- both types of parameters (named and positional)
- typographic notation of numbers
- 353 locales (with basic informations: name, symbol of currency, rtl)
- regional dialects inheritance mechanism (e.g. 'en-us' inherits from translations assigned to 'en')
- react component `<T>ok</T>`
- ECMAScript 6 modules
- **incremental loading of translations** (Client does not need to download all translations at once)
- remote loading of translations from a different host
- dedicated translation strings editor (alpha version) [mac os](https://drive.google.com/open?id=0ByCHJxkqk5WjV3ZEcmRIVUdPcTQ), [win x64](https://drive.google.com/open?id=0ByCHJxkqk5WjcjNxdUFEbVZHSGs)

**Table of Contents**

- [Universe i18n](https://github.com/vazco/meteor-universe-i18n/#universe-i18n)
  - [Instalation](https://github.com/vazco/meteor-universe-i18n/#instalation)
  - [Usage](https://github.com/vazco/meteor-universe-i18n/#usage)
    - [Setting/getting locale](https://github.com/vazco/meteor-universe-i18n/#settinggetting-locale)
    - [Adding translations by methods](https://github.com/vazco/meteor-universe-i18n/#adding-translations-my-methods)
    - [Getting translations](https://github.com/vazco/meteor-universe-i18n/#getting-translations)
    - [Creating a React component](https://github.com/vazco/meteor-universe-i18n/#creating-react-component)
    - [Formatting numbers](https://github.com/vazco/meteor-universe-i18n/#formatting-numbers)
  - [Translations files](https://github.com/vazco/meteor-universe-i18n/#translations-files)
    - [Recognition locale of translation](https://github.com/vazco/meteor-universe-i18n/#recognition-locale-of-translation)
    - [Namespace](https://github.com/vazco/meteor-universe-i18n/#namespace)
      - [Translation in packages](https://github.com/vazco/meteor-universe-i18n/#translation-in-packages)
      - [Translation in application](https://github.com/vazco/meteor-universe-i18n/#translation-in-application)
  - [Incremental loading of translations](https://github.com/vazco/meteor-universe-i18n/#incremental-loading-of-translations)
  - [API](https://github.com/vazco/meteor-universe-i18n/#api)
  - [Blaze support](https://github.com/vazco/meteor-universe-i18n/#blaze-support)
  - [Supported locales](https://github.com/vazco/meteor-universe-i18n/#supported-locales)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->


## Instalation
```sh
$ meteor add universe:i18n
```

## Usage
The package is dedicated to work with React but you can use it without it as well.

```
import i18n from 'meteor/universe:i18n';
```

### Tutorials

- [Meteor Guide](https://guide.meteor.com/ui-ux.html#universe-i18n)
- [Internationalizing Meteor with Universe:i18n](http://www.sonicviz.com/wp/2016/10/23/internationalizing-meteor/)

### Setting/getting locale

```js
i18n.setLocale('en-US', params)
i18n.getLocale() //en-US
```

Params in setLocale are optional yet offer additional possibilities:
 - noDownload - disables downloading translation file on the client (client side)
 - silent - protects against broadcasting the refresh event (both sides)
 - async - downloads translation file in an async way (client side)
 - fresh - downloads fresh translations (ignores the browser cache)

If you want to use the browser's locale, you can do it as follows:

```js
// somewhere in the page layout (or possibly in the router?)
function getLang () {
    return (
        navigator.languages && navigator.languages[0] ||
        navigator.language ||
        navigator.browserLanguage ||
        navigator.userLanguage ||
        'en-US'
    );
}

i18n.setLocale(getLang());
```

Keep in mind though that it will work on the client side only. Therefore, for the server side, you will need to get it from the 'accept-language' header.

### Adding translations by methods

```js
import i18n from 'meteor/universe:i18n';

i18n.addTranslation('en-US', 'common', 'no', 'No');
i18n.addTranslation('en-US.common', 'ok', 'Ok');
i18n.addTranslation('en-US.common.ok', 'Ok');

i18n.addTranslations('en-US', {
    common: {
        hello: 'Hello {$name} {$0}!'
    }
});

i18n.addTranslations('en-US', 'common', {
    hello: 'Hello {$name} {$0}!'
});
```

### Getting translations
You can obtain translation strings by:
- creating an instance of the React component ( can be predefined for context )
*(More on that in the next section)*
- using i18n.getTranslation() or, quicker, calling i18n.__()

```js
i18n.__(key);
i18n.__(key, params);
i18n.__(namespace, key, parameters);
i18n.__(namespace, key, parameters);
i18n.__(key, key, key, key, parameters);
// same with "getTranslation", e.g.:
i18n.getTranslation(key, key, key, key, parameters);
// namespaced translations
var t = i18n.createTranslator(namespace);
t(key, parameters);
// different language translations
var t2 = i18n.createTranslator('', 'fr-fr');
t2(key, parameters);
```

If needed, parameters can be passed as the last one of the function arguments, as an array or an object since they can be named or positional (ie. indexed). Additionally, for positional parameters it is irrelevant whether they are passed as an array or an object with keys '0', '1', '2'... Besides, 'positional' properties of such an object can be mixed with named ones.

```yml
 _namespace: ''
 hello: Hello {$name}!
 lengthOfArr: length {$length}
 items: The first item is {$0} and the last one is {$2}!
```

```js
i18n.__('hello', {name: 'Ania'}); // output: Hello Ania!
i18n.__('lengthOfArr', {length:['a', 'b', 'c'].length}); // output: length 3
i18n.__('items', ['a', 'b', 'c']); // output: The first item is a and the last one is c!
```

### Creating a React component

```js
import i18n from 'meteor/universe:i18n';

// an instance of a translate component with the top-level context
const T = i18n.createComponent();

// later on...
<T>common.no</T>
<T>common.ok</T>
<T name="World" {...[69]}>common.hello</T>
```

```jsx
import i18n from 'meteor/universe:i18n';

// an instance of a translate component in the "common" namespace
const T = i18n.createComponent(i18n.createTranslator('common'));

// later on...
<T>ok</T>
// overriding locale
<T _locale='pl-PL'>hello</T>
// overriding the default DOM element 'span' with 'h1'
<T _tagType='h1'>hello</T>
// providing props to the element
<T _props={{ className: 'text-center', style: { color: '#f33' }}}>hello</T>
```

### Formatting numbers

```js
i18n.parseNumber('7013217.715'); // 7,013,217.715
i18n.parseNumber('16217 and 17217,715'); // 16,217 and 17,217.715
i18n.parseNumber('7013217.715', 'ru-RU'); // 7 013 217,715
```


## Translations files

Instead of setting translations directly through i18n.addTranslation(s), you can store them in YAML or JSON files, named **.i18n.yml**, **.i18n.json** accordingly. As locales are by default loaded lazily, the translation files, unless they are attached to the bundle, should be placed in the common space.

### Recognition locale of translation

Files can be named freely as long as they have their respective locale declared under the key **'_locale'**.

```yml
_locale: 'en-US',
title: Title
```

Otherwise, files should be named after their respective locales or placed in directories named accordingly.

```bash
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

#### Translation in packages

For example, translations files in packages are by default namespaced by their package name.

```json
// file en.json in the universe:profile package
{
    "userName": "User name"
}
```

```js
import i18n from 'meteor/universe:i18n';

i18n.__('universe:profile', 'userName') // output: User name

// in React:
const T = i18n.createComponent();
<T>universe:profile.userName</T>
// or:
const T2 = i18n.createComponent(i18n.createTranslator('universe:profile'));
<T2>userName</T2>
```

You can change a default namespace for a file by setting a prefix to this file under the key "_namespace".

```json
// file en.json in the universe:profile package
{
    "_namespace": "common",
    "userName": "User name"
}
```

And then:

```js
i18n.__('common', 'userName') // output: User name
i18n.__('common.userName') // output: User name

// in React:
const T = i18n.createComponent();
<T>common.userName</T>
```

*TIP:* You can also add translations from a package on the top-level by passing empty string '' in the key "_namespace".

#### Translation in application

Here your translations by default are not namespaced which means that your translations from an application space are top-level
and can override every other namespace.

For example:

```yml
# file en_us.yml in an application space (not from a package)
userName: User name
```

```js
i18n.__('userName') //output: User name
// in React:
const T = i18n.createComponent();
<T>userName</T>
```

If you want to add translations under a namespace, you should define it in the key '_namespace'.

```yml
_namespace: user.listing.item
userName: User name
```

```js
i18n.__('user.listing.item.userName'); // output: User name
i18n.__('user', 'listing', 'item.userName'); // output: User name
// in React:
const T = i18n.createComponent();
<T>user.listing.item.userName</T>
// or:
const T2 = i18n.createComponent('user.listing');
<T2>item.userName</T2>
```


## Listener on language change

```
// adds a listener on language change
i18n.onChangeLocale (function(newLocale){
    console.log(newLocale);
})

// removes a listener
i18n.offChangeLocale (fn)

// does something on the first language change and then stops the listener
i18n.onceChangeLocale (fn)
```


## Incremental loading of translations

Since version 1.3.0, the package, unless configured otherwise, adds only the default language (en-us) to the project bundle for the client side.

This means that the browser does not download unnecessary languages. If a user changes the current locale, translations for a new locale will be downloaded on demand.

If you want to add all or selected translations to the production bundle, you need to set the environment variable `UNIVERSE_I18N_LOCALES` accordingly:

- `UNIVERSE_I18N_LOCALES = all` for bundling all translations strings
- one or more locales as codes to attach them in the bundle (as a separator you should use a `,`)

e.g. `UNIVERSE_I18N_LOCALES = 'de-CH, pl'`

- [How to set an environment variable](http://www.schrodinger.com/kb/1842)
- Note: If you want to use this flag, it is very important to do this before Meteor prepares a bundle (after that, setting this variable will have no effect).

**Again how it works:**
If a user will change the current locale to the one unattached to the client bundle, translations for a new locale will be downloaded on demand. Therefore, whenever `i18n.setLocale('de-CH')` is called and the language is unattached to the client bundle, i18n will try to download it from the server (you can customize url of a host for getting translations, but the default is equal to what Meteor.absoluteUrl() returns).

Additionally `i18n.setLocale()` returns a promise, e.g:

```
i18n.setLocale('en-AU').then(function () {
    console.log('already is!');
});
```

You can also listen to this event:
```
i18n.onChangeLocale (function(newLocale){
    console.log(newLocale);
})
```

### Listing available languages

You can use `i18n.getLanguages` to list all languages with at least one translation:
```javascript
i18n.getLanguages() // ['en', 'de']
i18n.getLanguages('name') // ['English', 'German']
```

This method will return all translations that are available on the server as well as loaded on the client.

To build a language picker with all possible options you need to fetch data from the server, e.g.:
```javascript
Meteor.methods({
    getLanguages() {
        return i18n.getLanguages().map(code => ({
            code,
            name: i18n.getLanguageNativeName(code)
        }));
    }
});
```


## API

```js
// creates a React component
i18n.createComponent(translator, locale, reactjs, type);
//  @params:
//    translator (optional, the default is i18n.createTranslator()) - with this argument you can set a different function for translation or the namespace for the default translator.
//    locale (optional, the default is the current locale) - sets a language for the component (can be different than anywhere else on the site)
//    reactjs (optional, by default it tries to get React from a global variable) - you can pass a React object if it is not available in the global scope
//    type (optional, by default it uses <span> to render the content) - sets a DOM element that will be rendered, e.g. 'li', 'div' or 'h1'.

// creates a namespaced translator
i18n.createTranslator(namespace, locale);

// creates a reactive translator for autoruns
i18n.createReactiveTranslator(namespace, locale);
// TIP: keep in mind that a tracker dependency object is not light, yet in React this is not obligatory
// thus our React component can be reactive and much lighter in terms of performance

// adds a translation
i18n.addTranslation(locale, namespace, key, ..., translation);

// adds translations (same as addTranslation)
i18n.addTranslations(locale, namespace, translationsMap);

// gets a translation
i18n.getTranslation(namespace, key, ..., params);
i18n.__(namespace, key,..., params);

// get translations (locale is by default set to the current one)
i18n.getTranslations(namespace, locale);

// options
i18n.setOptions({
    // default locale
    defaultLocale: 'en-US'

    // opens string
    open: '{$',

    // closes string
    close: '}',

    // decides whether to show when there's no translation in the current and default language
    hideMissing: false

    // url to the host with translations (default: Meteor.absoluteUrl())
    // useful when you want to load translations from a different host
    hostUrl: 'http://current.host.url/',

    // (on the server side only) gives you the possibility to add/change response headers
    translationsHeaders = {'Cache-Control':'max-age=2628000'}
});

// formats numbers for locale (locale is by default set to the current one)
i18n.parseNumber(number, locale);

// changes locale
i18n.setLocale(locale, params);
// this function on the client side returns a promise (but only if parameter `noDownload !== true`)

// gets the current locale
i18n.getLocale();

// gets languages with at least one translation
i18n.getLanguages(type = 'code')
i18n.getLanguages() // ['de', 'en']
i18n.getLanguages('name') // ['German', 'English']
i18n.getLanguages('nativeName') // ['Deutsch', 'English']

// fetches translations file from the remote server (client/server)
i18n.loadLocale(locale, params)
// @params on the client { fresh = false, async = false, silent = false,
// host = i18n.options.hostUrl, pathOnHost = i18n.options.pathOnHost }
// @params on server { queryParams = {}, fresh = false, silent = false,
// host = i18n.options.hostUrl, pathOnHost = i18n.options.pathOnHost }
// on the server side, this method uses HTTP.get with query parameter `type=json` to fetch json data
// on the client site, it adds a new script with translations to the head node
// this function returns a promise

// executes function in the locale context,
i18n.runWithLocale(locale, func)
// it means that every default locale used inside a called function will be set to a passed locale
// keep in mind that locale must be loaded first (if it is not bundled)

// additional informations about locale (locale is by default set to the current one)

getCurrencySymbol (code) // or locale with country
returns currency symbol if known

i18n.getCurrencySymbol('en-US') // = $
i18n.getCurrencySymbol('USD') // = $
i18n.getCurrencyCodes('en-US') // = ["USD", "USN", "USS"]

getLanguageName (locale)
getLanguageNativeName (locale)
isRTL (locale)
getAllKeysForLocale(locale, exactlyThis = false)
```

## Blaze support

[universe:i18n-blaze](https://atmospherejs.com/universe/i18n-blaze)


## Supported locales
*(predefined for parseNumber, currency, names, native names)*
```
af, af-ZA, am, am-ET, ar, ar-AE, ar-BH, ar-DZ, ar-EG, ar-IQ, ar-JO, ar-KW, ar-LB, ar-LY, ar-MA, ar-OM, ar-QA, ar-SA, ar-SY, ar-TN, ar-YE, arn, arn-CL, as, as-IN, az, az-Cyrl, az-Cyrl-AZ, az-Latn, az-Latn-AZ, ba, ba-RU, be, be-BY, bg, bg-BG, bn, bn-BD, bn-IN, bo, bo-CN, br, br-FR, bs, bs-Cyrl, bs-Cyrl-BA, bs-Latn, bs-Latn-BA, ca, ca-ES, co, co-FR, cs, cs-CZ, cy, cy-GB, da, da-DK, de, de-AT, de-CH, de-DE, de-LI, de-LU, dsb, dsb-DE, dv, dv-MV, el, el-GR, en, en-029, en-AU, en-BZ, en-CA, en-GB, en-IE, en-IN, en-JM, en-MY, en-NZ, en-PH, en-SG, en-TT, en-US, en-ZA, en-ZW, es, es-AR, es-BO, es-CL, es-CO, es-CR, es-DO, es-EC, es-ES, es-GT, es-HN, es-MX, es-NI, es-PA, es-PE, es-PR, es-PY, es-SV, es-US, es-UY, es-VE, et, et-EE, eu, eu-ES, fa, fa-IR, fi, fi-FI, fil, fil-PH, fo, fo-FO, fr, fr-BE, fr-CA, fr-CH, fr-FR, fr-LU, fr-MC, fy, fy-NL, ga, ga-IE, gd, gd-GB, gl, gl-ES, gsw, gsw-FR, gu, gu-IN, ha, ha-Latn, ha-Latn-NG, he, he-IL, hi, hi-IN, hr, hr-BA, hr-HR, hsb, hsb-DE, hu, hu-HU, hy, hy-AM, id, id-ID, ig, ig-NG, ii, ii-CN, is, is-IS, it, it-CH, it-IT, iu, iu-Cans, iu-Cans-CA, iu-Latn, iu-Latn-CA, ja, ja-JP, ka, ka-GE, kk, kk-KZ, kl, kl-GL, km, km-KH, kn, kn-IN, ko, ko-KR, kok, kok-IN, ky, ky-KG, lb, lb-LU, lo, lo-LA, lt, lt-LT, lv, lv-LV, mi, mi-NZ, mk, mk-MK, ml, ml-IN, mn, mn-Cyrl, mn-MN, mn-Mong, mn-Mong-CN, moh, moh-CA, mr, mr-IN, ms, ms-BN, ms-MY, mt, mt-MT, nb, nb-NO, ne, ne-NP, nl, nl-BE, nl-NL, nn, nn-NO, no, nso, nso-ZA, oc, oc-FR, or, or-IN, pa, pa-IN, pl, pl-PL, prs, prs-AF, ps, ps-AF, pt, pt-BR, pt-PT, qut, qut-GT, quz, quz-BO, quz-EC, quz-PE, rm, rm-CH, ro, ro-RO, ru, ru-RU, rw, rw-RW, sa, sa-IN, sah, sah-RU, se, se-FI, se-NO, se-SE, si, si-LK, sk, sk-SK, sl, sl-SI, sma, sma-NO, sma-SE, smj, smj-NO, smj-SE, smn, smn-FI, sms, sms-FI, sq, sq-AL, sr, sr-Cyrl, sr-Cyrl-BA, sr-Cyrl-CS, sr-Cyrl-ME, sr-Cyrl-RS, sr-Latn, sr-Latn-BA, sr-Latn-CS, sr-Latn-ME, sr-Latn-RS, sv, sv-FI, sv-SE, sw, sw-KE, syr, syr-SY, ta, ta-IN, te, te-IN, tg, tg-Cyrl, tg-Cyrl-TJ, th, th-TH, tk, tk-TM, tn, tn-ZA, tr, tr-TR, tt, tt-RU, tzm, tzm-Latn, tzm-Latn-DZ, ug, ug-CN, uk, uk-UA, ur, ur-PK, uz, uz-Cyrl, uz-Cyrl-UZ, uz-Latn, uz-Latn-UZ, vi, vi-VN, wo, wo-SN, xh, xh-ZA, yo, yo-NG, zh, zh-CHS, zh-CHT, zh-CN, zh-Hans, zh-Hant, zh-HK, zh-MO, zh-SG, zh-TW, zu, zu-ZA
```

##  License MIT
