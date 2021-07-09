import { i18n as reference } from './common';

declare global {
  let i18n: typeof reference;
  let _i18n: typeof reference;
}

i18n = reference;
_i18n = reference;
