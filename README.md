<img src="http://uniproject.vazco.eu/black_logo.png" />
# Universe i18n
Internationalization package with support:
- namespacing of translations strings
- file format YAML and JSON supports
- named and positional parameters
- locale like typographic number, 
- 353 locales (with basic informations: name, symbol of currency, rtl)
- regional dialects e.g. 'en-us' inherits from translations assigned to 'en'
- universe:modules (es6/modules)
- react component `<T>ok</T>`

**Table of Contents**

- [Universe i18n](#universe-i18n)
  - [Instalation](#instalation)
  - [Usage](#usage)
    - [Setting/Getting locale](#settinggetting-locale)
    - [Adding Translations my methods](#adding-translations-my-methods)
    - [Getting translations](#getting-translations)
    - [Creating react component](#creating-react-component)
    - [Formatting numbers](#formatting-numbers)
  - [Translations files](#translations-files)
    - [Recognition locale of translation](#recognition-locale-of-translation)
    - [Namespace](#namespace)
      - [Translation in packages](#translation-in-packages)
      - [Translation in application](#translation-in-application)
  - [API](#api)
  - [Locales list](#locales-list)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->



## Instalation
```sh
$ meteor add universe:i18n
```

## Usage
This plugin is dedicated to work with react and universe:modules, but you can use it without react or universe:modules.
### Using with universe:modules (ecmascript 2015 modules)

```
import i18n from '{universe:i18n}';
```

### Importing by SystemJs Api (universe:modules)

```
System.import('{universe:i18n}').then(/*something to do*/)
```

### Using as a global (pure meteor)

Package from version 1.1.5 exports global under name `_i18n`

### Setting/Getting locale

```js
i18n.setLocale('en-US')
i18n.getLocale() //en-US
```

Example for those, who want to set locale as in browser:

```js
// somewhere in page layout ( or in router?)
function getLang() {
    if (navigator.languages != undefined)  {
        return navigator.languages[0];
    }
    return navigator.language || navigator.browserLanguage;
}

i18n.setLocale(getLang());
```

But this will be work only on client side.
For server side you should read it from header 'accept-language'

### Adding Translations by methods

```js
import i18n from '{universe:i18n}';

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
You can translate translation string on few way:
- you can create instance of react component ( can be predefined for context )
*about react component in next section*
- you can use 2 methods (i18n.getTranslation() or quicker call i18n.__())

```js
i18n.__(key);
i18n.__(key, params);
i18n.__(namespace, key, parameters);
i18n.__(namespace, key, parameters);
i18n.__(key, key, key, key, parameters);
//same with "getTranslation" e.g.:
i18n.getTranslation(key, key, key, key, parameters);
// namespaced translations
var t = i18n.createTranslator(namespace);
t(key, parameters);
// different language translations
var t2 = i18n.createTranslator('', 'fr-fr');
t2(key, parameters);
```

If needed, parameters can be passed as last of function argument, as a object or array.
Parameters can be named or positional (indexed).
For positional parameters isn't important if passed was array or object with keys 0,1,2... 
Or if they are mixed with named parameters.

```yml
 _namespace: ''
 hello: Hello {$name}!
 lengthOfArr: length {$length}
 items: First item {$0} and last is {$2}!
```

```js
i18n.__('hello', {name: 'Ania'}); //output: Hello Ania!
i18n.__('lengthOfArr', {length:['a', 'b', 'c'].length}); //output: length 3
i18n.__('items', ['a', 'b', 'c']); //output: First item a and last is c!
```

### Creating react component

```js
import i18n from '{universe:i18n}';

//instance of translate component with top-level context
const T = i18n.createComponent();

// Later...
<T>common.no</T>
<T>common.ok</T>
<T name="World" {...[69]}>common.hello</T>
```

```jsx
import i18n from '{universe:i18n}';
//instance of translate component in "common" namespace
const T = i18n.createComponent(i18n.createTranslator('common'));

// Later...
<T>ok</T>
// this time with override locale  
<T _locale='pl-PL'>hello</T>
```

### Formatting numbers

```js
i18n.parseNumber('7013217.715'); // 7,013,217.715
i18n.parseNumber('16217 and 17217,715'); // 16,217 and 17,217.715
i18n.parseNumber('7013217.715', 'ru-RU'); // 7 013 217,715
```

## Translations files

Instead of setting translations directly by i18n.addTranslation(s).
You can store translations in files YAML or JSON, according with following file extensions: **.i18n.yml**, **.i18n.json**.

### Recognition locale of translation
Name of file can be any but only if in file has the locale declared under key **'_locale'**

```yml
_locale: 'en-US',
title: Title
```

Other ways file should have name of his locale or be in directory under this name:
 
```bash
en.yml
en.json
en_us.yml
en-us.yml
en/us.yml
en-US/someName.yml
someDir/en-us/someName.yml
```
### Namespace

Translations in translation file can be namespaced depend where are.
Namespace can be set up only for whole file, but file can add deeper embedded structure.

#### Translation in packages

For example, translations files in packages are namespaced as a default by package name. 

```json
//file en.json in package universe:profile
{
    "userName": "User name"
}
```

```js
import i18n from '{universe:i18n}';

i18n.__('universe:profile', 'userName') //output: User name

// in react:
const T = i18n.createComponent();
<T>universe:profile.userName</T>
// or
const T2 = i18n.createComponent(i18n.createTranslator('universe:profile'));
<T2>userName</T2>
```

You can change default namespace for file by setting prefix to file under key "_namespace"

```json
//file en.json in package universe:profile
{
    "_namespace": "common",
    "userName": "User name"
}
```

And now:

```js
i18n.__('common', 'userName') //output: User name
i18n.__('common.userName') //output: User name

// in react:
const T = i18n.createComponent();
<T>common.userName</T>
```

*TIP:* You can also add translations from package on the top-level by passing empty string '' in key "_namespace"

#### Translation in application

Here your translations by default aren't namespaced.
It mean that your translation from application space are on top-level
and they can override every namespace.

for example:

```yml
# file en_us.yml in application space (not from package)
userName: User name
```

```js
i18n.__('userName') //output: User name
// in react:
const T = i18n.createComponent();
<T>userName</T>
```

If you want add translation under namespace, you should define it in key '_namespace'

```yml
_namespace: user.listing.item
userName: User name
```

```js
i18n.__('user.listing.item.userName'); //output: User name
i18n.__('user', 'listing', 'item.userName'); //output: User name
// in react:
const T = i18n.createComponent();
<T>user.listing.item.userName</T>
// or
const T2 = i18n.createComponent(i18n.createTranslator('user.listing'));
<T2>item.userName</T2>
```

## API
```js
// create React component
i18n.createComponent(translator);

// create namespaced translator
i18n.createTranslator(namespace, locale);

// add translation
i18n.addTranslation(namespace, key, ..., translation);

// add translations (same as addTranslation)
i18n.addTranslations(namespace, translationsMap);

// get translation
i18n.getTranslation(namespace, key, ..., params);
i18n.__(namespace, key,..., params);

// get translations ( default locale is current )
i18n.getTranslations(namespace, locale);

// options
i18n.options = {
    // opening string
    open: '{$',

    // closing string
    close: '}'
};

// formatting numbers for locale ( default locale is current )
i18n.parseNumber(number, locale);

// Setting locale
i18n.setLocale(locale);
// Getting locale
i18n.getLocale();

// Additional informations about locale ( default locale is current )

getCurrencySymbol (locale)
getLanguageName (locale)
getLanguageNativeName (locale)
isRTL (locale)
```

## Locales list (353 locales suported)
*( predefined for parseNumber, currency, names, native names)*
```

```
