export type JSON = boolean | null | number | string | JSON[] | JSONObject;
export type JSONObject = { [key: string]: JSON };

type UnknownRecord = Record<string, unknown>;

const getTranslationWithCount = (
  originalCount: number,
  newCount: number,
  translation: string,
) => {
  const tmp = translation.split(' | ');
  const counted = tmp[newCount > tmp.length - 1 ? tmp.length - 1 : newCount];

  if (counted.includes('{count}')) {
    return counted.replace('{count}', `${originalCount}`);
  }
  return counted;
};

export function get(
  object: UnknownRecord,
  path: string,
  pluralizationRules?: Record<string, (count: number) => number>,
  count?: number,
) {
  const keys = path.split('.');
  const last = keys.pop()!;
  const locale = keys[0];

  let key: string | undefined;
  while ((key = keys.shift())) {
    if (typeof object !== 'object' || object === null) {
      break;
    }

    object = object[key] as UnknownRecord;
  }

  const translation = object?.[last];

  if (count !== undefined) {
    let newCount = count;
    if (locale && pluralizationRules && pluralizationRules[locale]) {
      newCount = pluralizationRules[locale](count);
    }
    return getTranslationWithCount(count, newCount, translation as string);
  }

  return translation;
}

export function isJSONObject(value: JSON | unknown): value is JSONObject {
  return !!value && typeof value === 'object';
}

export function set(object: UnknownRecord, path: string, value: unknown) {
  const keys = path.split('.');
  const last = keys.pop()!;

  let key: string | undefined;
  while ((key = keys.shift())) {
    if (object[key] === undefined) {
      object[key] = {};
    }

    object = object[key] as UnknownRecord;
  }

  object[last] = value;
}
