export type JSON = boolean | null | number | string | JSON[] | JSONObject;
export type JSONObject = { [key: string]: JSON };

export function get(object: unknown, path: string) {
  const keys = path.split('.');
  const last = keys.pop()!;

  let root = object as Record<string, unknown>;
  let key: string | undefined;
  while ((key = keys.shift())) {
    if (typeof root !== 'object' || root === null) {
      break;
    }

    root = root[key] as Record<string, unknown>;
  }

  return root?.[last];
}

export function isJSONObject(value: JSON): value is JSONObject {
  return !!value && typeof value === 'object';
}

export function set(object: unknown, path: string, value: unknown) {
  const keys = path.split('.');
  const last = keys.pop()!;

  let root = object as Record<string, unknown>;
  let key: string | undefined;
  while ((key = keys.shift())) {
    if (root[key] === undefined) {
      root[key] = {};
    }

    root = root[key] as Record<string, unknown>;
  }

  root[last] = value;
}
