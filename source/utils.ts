export type JSON = boolean | null | number | string | JSON[] | JSONObject;
export type JSONObject = { [key: string]: JSON };

type UnknownRecord = Record<string, unknown>;

export function get(object: UnknownRecord, path: string) {
  const keys = path.split('.');
  const last = keys.pop()!;

  let key: string | undefined;
  while ((key = keys.shift())) {
    if (typeof object !== 'object' || object === null) {
      break;
    }

    object = object[key] as UnknownRecord;
  }

  return object?.[last];
}

export function isJSONObject(value: JSON): value is JSONObject {
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
