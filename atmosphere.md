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

Internationalization package that offers much better performance than others (as it depends, if used with React, on a simple event emitter rather than much heavier Tracker dependency).

The package supports:
- namespacing of translation strings
- **YAML** and **JSON** file formats
- both types of parameters (named and positional)
- typographic notation of numbers
- 353 locales (with basic informations: name, symbol of currency, rtl)
- regional dialects inheritance mechanism (e.g. 'en-us' inherits from translations assigned to 'en')
- react component `<T>ok</T>` or `<T _translateProps={['title']}><div title="ok">here</div></T>`
- ECMAScript 6 modules
- **incremental loading of translations** (Client does not need to download all translations at once)
- remote loading of translations from a different host
- dedicated translation strings editor (alpha version) [mac os](https://drive.google.com/file/d/0ByCHJxkqk5WjUlJjTjJqVlAtSzg/view?usp=sharing), [win x64](https://drive.google.com/file/d/0ByCHJxkqk5WjX2VXMjZQUU9PU28/view?usp=sharing)

**Table of Contents**

- [Universe i18n](https://github.com/vazco/meteor-universe-i18n/#universe-i18n)
  - [Installation](https://github.com/vazco/meteor-universe-i18n/#installation)
    - [Typescript](https://github.com/vazco/meteor-universe-i18n/#typescript)
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
  - [Integration with SimpleSchema](https://github.com/vazco/meteor-universe-i18n/blob/master/README.md#integration-with-simpleschema-package)
  - [Supported locales](https://github.com/vazco/meteor-universe-i18n/#supported-locales)

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
The package is dedicated to work with React but you can use it without it as well.

```
import i18n from 'meteor/universe:i18n';
```

### Tutorials

- [Meteor Guide](https://guide.meteor.com/ui-ux.html#universe-i18n)
- [Internationalizing Meteor with Universe:i18n](http://sonicviz.com/2016/10/23/internationalizing-meteor/)

### Other links:
- [mock universe i18n](https://github.com/logankoester/mock-meteor-universe-i18n)


## License

<img src="https://vazco.eu/banner.png" align="right">

**Like every package maintained by [Vazco](https://vazco.eu/), Universe i18n is [MIT licensed](https://github.com/vazco/uniforms/blob/master/LICENSE).**
