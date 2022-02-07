<h1 align="center">
    <a href="https://github.com/vazco">vazco</a>/Universe i18n
</h1>

<p align="center">
    <img src="https://travis-ci.org/vazco/meteor-universe-i18n.svg?branch=master" alt="tests">
    <img src="https://img.shields.io/david/peer/vazco/eslint-config-vazco.svg" alt="peerDependencies">
    <img src="https://img.shields.io/david/dev/vazco/eslint-config-vazco.svg" alt="devDependencies">
 <a href="https://vazco.eu">
        <img src="https://img.shields.io/badge/vazco-package-blue.svg?logo=data%3Aimage%2Fpng%3Bbase64%2CiVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAYAAAAfSC3RAAAABmJLR0QA%2FwD%2FAP%2BgvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4QMfFAIRHb8WQgAAAY1JREFUKM%2BNkLFrGgEUxr87FMnpnXdIqxi1Q3VxachgSbcOgRBCTMbgH9CCW%2BjSUminSpEmBEIpHW7rkCmQSSjEKVOGEAK5bOFyk4c5TMRTyZ1fl5aK9ai%2F8b334%2Ft4QBBmLQmz9jpoLSKYPQCfYdaezi6atTKAMoAYgK1pJ8LkQPr5JspHsbO%2BFilAEADQArCA3Ftn%2FC40KebPO4Ln37peNNxrFxPSXTaW9cPiewDbgYkkXwBYB3B5dHES3W8cpM254ctOJhr3wsKqs7Zj%2FdOZZITkMf9yT%2FKq3e18eHf47fmTT5XE1H%2BQ3GAwDyQ%2FkkxMSvLvhP%2FxZVLc42zYJBf%2FSPMkW57nsd%2Fv03VdDgYDjkajIPkryVDIdd1Xtm0%2Fdhznptvtmr7vu5IkRRRFySiKko%2FH45BlebzgJoBdodls%2FjAM49SyrIau69etVmsIIFStVnPFYvFZoVBY1jRtJZlMpjRNm5MkCaIofhfq9XrMMIyeruuc9u1KpRIulUqqqqpLqqqW0%2Bl0OZVKyb8ANqUwunhV3dcAAAAASUVORK5CYII%3D&style=flat-square">
</a>
</p>

&nbsp;

<a href="http://vazco.eu"><img src="https://vazco.eu/universe-banner.png" /></a>

&nbsp;

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

- [Universe i18n](https://github.com/vazco/meteor-universe-i18n/#universe-i18n)
  - [Installation](https://github.com/vazco/meteor-universe-i18n/#installation)
    - [Typescript](https://github.com/vazco/meteor-universe-i18n/#typescript)
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
  - [Integration with React](https://github.com/vazco/meteor-universe-i18n/#react-integration)
    - [Creating a React component](https://github.com/vazco/meteor-universe-i18n/#creating-react-component)
  - [Integration with Blaze](https://github.com/vazco/meteor-universe-i18n/#blaze-integration)
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

## Usage

```
import i18n from 'meteor/universe:i18n';
```

### Other links:

- [mock universe i18n](https://github.com/logankoester/mock-meteor-universe-i18n)

### Setting/getting locale

```js
i18n.setLocale('en-US', params);
i18n.getLocale(); // en-US
```

Params in setLocale are optional yet offer additional possibilities:

- noDownload - disables downloading translation file on the client (client side)
- silent - protects against broadcasting the refresh event (both sides)
- async - downloads translation file in an async way (client side)
- fresh - downloads fresh translations (ignores the browser cache)
<!-- TODO host, pathOnHost, queryParams ??? -->

If you want to use the browser's locale, you can do it as follows:

```js
// somewhere in the page layout (or possibly in the router?)
function getLang() {
  return (
    (navigator.languages && navigator.languages[0]) ||
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
    hello: 'Hello {$name} {$0}!'
  }
});

i18n.addTranslations('en-US', 'Common', {
  hello: 'Hello {$name} {$0}!'
});
```

### Getting translations

You can obtain translation strings by using i18n.getTranslation() or, quicker, calling i18n.\_\_()

```js
i18n.__(key);
i18n.__(key, params);
i18n.__(Namespace, key, params);
i18n.__(Namespace, key, params);
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

Take in mind, that on client side strings are sanitized to PCDATA.
_TIP:_ To prevent sensitization you can pass `_purify={false}` on `<T>` component.

<!-- TODO remove? -->

## Translations files

Instead of setting translations directly through i18n.addTranslation(s), you can store them in YAML or JSON files, named **.i18n.yml**, **.i18n.json** accordingly. As locales are by default loaded lazily, the translation files, unless they are attached to the bundle, should be placed in the common space.

### Recognition locale of translation

Files are recognized by the `_locale` value in a translation file.

```yml
_locale: en-US
title: Title
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

```json
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

```json
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

// gets a translation in params (_locale, _purify)
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
// on the client site, it adds a new script with translations to the head node
// this function returns a promise

// executes function in the locale context,
i18n.runWithLocale(locale, func)
// it means that every default locale used inside a called function will be set to a passed locale
// keep in mind that locale must be loaded first (if it is not bundled)
```

## Integration with React

If you want to use this package with React, you need to create two functions `createTranslator` and `createComponent`. Example code is below.

```ts
import React from 'react';
import i18n from 'meteor/universe:i18n';

/**
 * @param namespace
 * @param options {_locale, _purify} TODO Change that
 */
export function createTranslator(namespace?, options = undefined) {
  if (typeof options === 'string' && options) {
    options = { _locale: options };
  }

  return (...args) => {
    let _namespace = namespace;
    if (typeof args[args.length - 1] === 'object') {
      _namespace = args[args.length - 1]._namespace || _namespace;
      args[args.length - 1] = { ...options, ...args[args.length - 1] };
    } else if (options) {
      args.push(options);
    }
    if (_namespace) {
      args.unshift(_namespace);
    }
    return i18n.getTranslation(...args);
  };
}

/**
 * @param translatorSeed the default is createTranslator() - with this argument you can set a different function for translation or the namespace for the default translator
 * @param locale the default is the current locale - sets a language for the component (can be different than anywhere else on the site)
 * @param type by default it uses <span> to render the content - sets a DOM element that will be rendered, e.g. 'li', 'div' or 'h1'
 */
export function createComponent(
  translatorSeed?: string | ((...args: unknown[]) => string),
  locale?: string,
  type?: React.ComponentType | string
) {
  const translator =
    typeof translatorSeed === 'string'
      ? createTranslator(translatorSeed, locale)
      : translatorSeed === undefined
      ? createTranslator()
      : translatorSeed;

  type Props = {
    _containerType?: React.ComponentType | string;
    _props?: {};
    _tagType?: React.ComponentType | string;
    _translateProps?: string[];
    children?: React.ReactNode;
  };

  return class T extends React.Component<Props> {
    static __ = translator;

    _invalidate = () => this.forceUpdate();

    render() {
      const {
        _containerType,
        _props = {},
        _tagType,
        _translateProps,
        children,
        ...params
      } = this.props;

      const tagType = _tagType || type || 'span';
      const items = React.Children.map(
        children,
        (item, index) => {
          if (typeof item === 'string' || typeof item === 'number') {
            return React.createElement(tagType, {
              ..._props,
              dangerouslySetInnerHTML: { __html: translator(item, params) },
              key: `_${index}`
            } as any);
          }

          if (Array.isArray(_translateProps)) {
            const newProps: Record<string, string> = {};
            _translateProps.forEach(propName => {
              const prop = (item as any).props[propName];
              if (prop && typeof prop === 'string') {
                newProps[propName] = translator(prop, params);
              }
            });

            return React.cloneElement(item as any, newProps);
          }

          return item;
        },
        this
      );

      if (items?.length === 1) {
        return items[0];
      }

      const containerType = _containerType || type || 'div';
      return React.createElement(containerType, { ..._props }, items);
    }

    componentDidMount() {
      i18n._events.on('changeLocale', this._invalidate);
    }

    componentWillUnmount() {
      i18n._events.removeListener('changeLocale', this._invalidate);
    }
  };
}
```

### Creating a React component

```js
// an instance of a translate component with the top-level context
const T = createComponent();

// later on...
<T>Common.no</T>
<T>Common.ok</T>
<T name="World">Common.hello</T>
// translate component
<T _translateProps={['title', 'children']}>
      <div title="Common.ok">Common.ok</div>
</T>
```

```js
// an instance of a translate component in the "Common" namespace
const T = createComponent(createTranslator('Common'));

// later on...
<T>ok</T>
// overriding locale
<T _locale='pl-PL'>hello</T>
// overriding the default DOM element 'span' with 'h1'
<T _tagType='h1'>hello</T>
// getting something from different namespace (e.g. Different.hello instead of Common.hello)
<T _namespace='Diffrent'>hello</T>
// providing props to the element
<T _props={{ className: 'text-center', style: { color: '#f33' }}}>hello</T>
```

## Integration with Blaze

[universe:i18n-blaze](https://atmospherejs.com/universe/i18n-blaze)

<!-- TODO Change -->

## Integration with SimpleSchema package

Add following-like code to main.js:

```js
const registerSchemaMessages = () => {
  SimpleSchema.messages({
    required: i18n.__('SimpleSchema.required')
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
meteor test-packages --driver-package cultofcoders:mocha universe:i18n
```

## License

<img src="https://vazco.eu/banner.png" align="right">

**Like every package maintained by [Vazco](https://vazco.eu/), Universe i18n is [MIT licensed](https://github.com/vazco/uniforms/blob/master/LICENSE).**
