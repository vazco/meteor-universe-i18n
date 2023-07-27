export type JSON = boolean | null | number | string | JSON[] | JSONObject;
export type JSONObject = { [key: string]: JSON };

type UnknownRecord = Record<string, unknown>;

export function get(object: UnknownRecord, path: string, count?: number) {
  const keys = path.split('.');
  const last = keys.pop()!;

  let key: string | undefined;
  while ((key = keys.shift())) {
    if (typeof object !== 'object' || object === null) {
      break;
    }

    object = object[key] as UnknownRecord;
  }

  const translation = object?.[last];

  if (count !== undefined) {
    const tmp = (translation as string).split(' | ');
    const counted = tmp[count > tmp.length - 1 ? tmp.length - 1 : count];

    if (counted.includes('{count}')) {
      return counted.replace('{count}', `${count}`);
    }
    return counted;
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
