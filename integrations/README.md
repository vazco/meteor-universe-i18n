# Integrations examples

This directory contains examples of integrating `universe:i18n` package with different frameworks (React,Blaze and Svelte). Each subdirectory contains files necessary for creating reactive integration, exemplary usage of this integration and related locale definitions.

## React

There are few different ways to integrate `universe:i18n` package with a React application. Example presented in `react` subdirectory is the most "React-way" solution facilitating React Context.

## Blaze

Blaze integration is similar to one of the React integration solutions and facilitates <code>ReactiveVar</code>.

## Svelte

The example of the Svelte integration is more complex and showcases storing and modifying locales in the database. The database part of the integration can be omitted, in which case only `reactivei18n` file is important.
