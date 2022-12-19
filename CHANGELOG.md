## [v2.0.0](https://github.com/vazco/meteor-universe-i18n/tree/v2.0.0) (2022-10-27)

- **Updated:** Integration examples ([\#169](https://github.com/vazco/meteor-universe-i18n/pull/169))
- **Added:** Detailed React, Blaze and Svelte integration examples ([\#164](https://github.com/vazco/meteor-universe-i18n/pull/164))

## [v2.0.0-rc.2](https://github.com/vazco/meteor-universe-i18n/tree/v2.0.0-rc.2) (2022-08-19)

- **Added:** Generated `.d.ts` files ([\#157](https://github.com/vazco/meteor-universe-i18n/pull/157))

## [v2.0.0-rc.1](https://github.com/vazco/meteor-universe-i18n/tree/v2.0.0-rc.1) (2022-07-19)

- **Added:** Support for the `zodern:types` package. ([\#159](https://github.com/vazco/meteor-universe-i18n/pull/159))
- **Added:** Migration to v2 guide

## [v2.0.0-rc.0](https://github.com/vazco/meteor-universe-i18n/tree/v2.0.0-rc.0) (2022-04-28)

Implemented [Roadmap v2](https://github.com/vazco/meteor-universe-i18n/issues/144). ([\#152](https://github.com/vazco/meteor-universe-i18n/pull/152))

- **Breaking:** Removed locales and currency data.
- **Breaking:** Removed `parseNumber`, `getLanguages`, `getCurrencyCodes`, `getCurrencySymbol`, `getLanguageName`, `getLanguageNativeName` and `isRTL` functions.
- **Breaking:** Removed `_purify` option.
- **Breaking:** Removed `createTranslator` and `createReactiveTranslator` functions.
- **Breaking:** Removed React integration - `createComponent` and `getRefreshMixin` functions.
- **Changed:** Extracted string interpolation into a separate, replacable function.
- **Added:** CI workflow for tests
- **Changed:** Removed old documentation and added React and Blaze integration examples
