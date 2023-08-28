export type JSON = boolean | null | number | string | JSON[] | JSONObject;
export type JSONObject = { [key: string]: JSON };

type UnknownRecord = Record<string, unknown>;

const getTranslationWithCount = (
  originalCount: number,
  index: number,
  translation: string,
) => {
  const options = translation.split(' | ');
  const pluralized =
    options[index >= options.length ? options.length - 1 : index];

  if (pluralized.includes('{count}')) {
    return pluralized.replace('{count}', `${originalCount}`);
  }
  return pluralized;
};

export function get(
  object: UnknownRecord,
  path: string,
  count?: number,
  pluralizationRules?: Record<string, (count: number) => number>,
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
    let index = count;
    if (pluralizationRules && pluralizationRules[locale]) {
      index = pluralizationRules[locale](count);
    }
    return getTranslationWithCount(count, index, translation as string);
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
