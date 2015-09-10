<img src="http://uniproject.vazco.eu/black_logo.png" />
# Universe i18n

### Instalation
```sh
$ meteor add universe:i18n
```

### Usage
```js
import i18n from '{universe:i18n}';

i18n.addTranslation('en', 'common.no', 'No');
i18n.addTranslation('en.common', 'ok', 'Ok');

i18n.addTranslations('en', {
    common: {
        hello: 'Hello {$name} {$0}!'
    }
});

const T = i18n.createComponent(i18n.createTranslator('en'));

// Later...
<T>common.no</T>
<T>common.ok</T>
<T name="World" {...[1]}>common.hello</T>
```

### API
```js
// create React component
i18n.createComponent(translator);

// create prefixed translator
i18n.createTranslator(prefix);

// add translation
i18n.addTranslation(prefix, key, translation);

// add translations
i18n.addTranslations(prefix, translationsMap);

// get translation
i18n.getTranslation(prefix, key, params);

// get translations
i18n.getTranslations(prefix);

// options
i18n.options = {
    // opening string
    open: '{$',

    // closing string
    close: '}'
};
```