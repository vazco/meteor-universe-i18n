<img src="http://uniproject.vazco.eu/black_logo.png" />
# Universe i18n
Internationalization package with support:
- namespacing of translations strings
- file format YAML and JSON supports
- named and positional parameters
- locale like typographic number, 
regional dialects e.g. 'en_us' inherits from translations assigned to 'en'
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

### Setting/Getting locale

```js
i18n.setLocale('en_us')
i18n.getLocale() //en_us
```

### Adding Translations by methods

```js
import i18n from '{universe:i18n}';

i18n.addTranslation('en_us', 'common', 'no', 'No');
i18n.addTranslation('en_us.common', 'ok', 'Ok');
i18n.addTranslation('en_us.common.ok', 'Ok');

i18n.addTranslations('en_us', {
    common: {
        hello: 'Hello {$name} {$0}!'
    }
});

i18n.addTranslations('en_us', 'common', {
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
<T>no</T>
<T>ok</T>
<T name="World" {...[69]}>.hello</T>
```

### Formatting numbers

```js
i18n.parseNumber('7013217.715'); // 7,013,217.715
i18n.parseNumber('16217 and 17217,715'); // 16,217 and 17,217.715
i18n.parseNumber('7013217.715', 'ru_ru'); // 7 013 217,715
```

## Translations files

Instead of setting translations directly by i18n.addTranslation(s).
You can store translations in files YAML or JSON, according with following file extensions: **.i18n.yml**, **.i18n.json**.

### Recognition locale of translation
Name of file can be any but only if in file has the locale declared under key **'_locale'**

```yml
_locale: 'en_us',
title: Title
```

Other ways file should have name of his locale or be in directory under this name:
 
```bash
en.yml
en.json
en_us.yml
en-us.yml
en/us.yml
en_us/someName.yml
someDir/en_us/someName.yml
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
i18n.createTranslator(namespace);

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

```

## Locales list 
*( predefined for parseNumber, can be more )*
```
ar, ar_ae, ar_bh, ar_eg, ar_jo, ar_kw, ar_lb, ar_qa, ar_sa,
az_az,
be, be_by,
bg, bg_bg,
bn, bn_bd,
bs, bs_ba, 
ca, ca_es, 
cs, cs_cz, 
cy, cy_gb, 
da, da_dk, 
de, de_at, de_ch, de_de, de_lu, 
el, el_gr, 
en, en_au, en_bb, en_bm, en_ca, en_gb, en_gh, en_id, en_ie, en_in, en_my, en_ng, en_nz, en_ph, en_pk, en_sg, en_us, en_za, 
es, es_ar, es_bo, es_cl, es_co, es_cr, es_do, es_ec, es_es, es_gt, es_hn, es_mx, es_pa, es_pe, es_pr, es_py, es_sv, es_uy, es_ve, 
et, et_ee, 
eu, eu_es, 
fi, fi_fi, 
fr, fr_be, fr_ca, fr_ch, fr_fr, fr_lu, fr_mc, 
ga, ga_ie, 
hi, hi_in, 
hr, hr_hr, 
hu, hu_hu, 
hy, hy_am, 
in, in_id, 
is, is_is, 
it, it_ch, it_it, 
iw, iw_il, 
ja, ja_jp, 
ka, ka_ge, 
kk, kk_kz, 
km, km_kh, 
ko, ko_kr, 
ky, ky_kg, 
lb, lb_lu, 
lt, lt_lt, 
lv, lv_lv, 
mk, mk_mk, 
ms, ms_bn, ms_my, 
mt, mt_mt, 
nl, nl_be, nl_nl, nl_sr, 
no, no_no, 
pl, pl_pl, 
pt, pt_ao, pt_br, pt_pt, 
rm, rm_ch, 
ro, ro_md, ro_ro, 
ru, ru_ru, 
sh, sh_ba, sh_cs, sh_me, 
sk, sk_sk, 
sl, sl_si, 
sq, sq_al, 
sr, sr_ba, sr_cs, 
sv, sv_se, 
tg, tg_tj, 
th, th_th, 
tl, tl_ph, 
tr, tr_tr, 
uk, uk_ua, 
ur, ur_pk, 
vi, vi_vn, 
zh, zh_cn, zh_hk, zh_mo, zh_sg, zh_tw   
```
