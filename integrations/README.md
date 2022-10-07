# Integrations examples

This directory contains examples of integrating `universe:i18n` package with different frameworks (React,Blaze and Svelte). Each subdirectory contains files necessary for creating reactive integration, exemplary usage of this integration and related locale definitions.

## React

There are few different ways to integrate `universe:i18n` package with a React application. Example presented in `react` subdirectory is the most "React-way" solution facilitating React Context.

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
import { ReactiveVar } from 'meteor/reactive-var';
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

## Blaze

Blaze integration is similar to one of the React integration solutions and facilitates <code>ReactiveVar</code>.

## Svelte

The example of the Svelte integration is more complex and showcases storing and modifying locales in the database. The database part of the integration can be omitted, in which case only `reactivei18n` file is important.
