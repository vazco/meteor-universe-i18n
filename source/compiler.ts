import YAML from 'js-yaml';
import { CachingCompiler } from 'meteor/caching-compiler';
import path from 'path';
import stripJsonComments from 'strip-json-comments';

import { i18n } from './common';
import { isJSONObject, set } from './utils';
import type { JSON } from './utils';

declare class Compiler {}
declare class Plugin {
  static registerCompiler(
    options: { extensions: string[] },
    getInstance: () => Compiler,
  ): void;
}

Plugin.registerCompiler(
  { extensions: ['i18n.json', 'i18n.yml'] },
  () => new UniverseI18nCompiler(),
);

interface FileData {
  data: string;
}

interface FileInfo {
  path: string;
  sourcePath: string;
}

declare class InputFile {
  addJavaScript(info: FileData & FileInfo): void;
  addJavaScript(info: FileInfo, finalize: () => Promise<FileData | null>): void;
  error(error: { message: string }): void;
  getArch(): string;
  getContentsAsString(): string;
  getPackageName(): string | undefined;
  getPathInPackage(): string;
  getSourceHash(): string;
}

type CompileResult = { data: string };

class UniverseI18nCompiler extends CachingCompiler {
  constructor() {
    super({
      compilerName: 'universe:i18n',
      defaultCacheSize: 8 * 1024 * 1024,
    });
  }

  addCompileResult(file: InputFile, compileResult: CompileResult) {
    file.addJavaScript({ ...this.getFileInfo(file), ...compileResult });
  }

  compileOneFile(file: InputFile): CompileResult | null {
    const sourcePath = file.getPathInPackage();
    const source = file.getContentsAsString();
    if (!source) {
      return null;
    }

    const metadata = analyzePath(sourcePath);
    const content = read(source, metadata.type);
    if (content.error) {
      file.error({ message: `Parsing Error: ${content.error.message}` });
      return null;
    }

    const options = {
      locale: extractString(content.data, '_locale'),
      namespace: extractString(content.data, '_namespace'),
      splitKey: extractString(content.data, '_splitKey'),
    };

    const packageName = file.getPackageName();
    const locale = i18n.normalize(options.locale ?? metadata.locale ?? '');
    if (!locale) {
      const packageLocation = packageName ? ` in package "${packageName}"` : '';
      const location = `"${sourcePath}"${packageLocation}`;
      file.error({ message: `Cannot find locale for file ${location}.` });
      return null;
    }

    if (options.splitKey) {
      splitKeys(content.data, options.splitKey);
    }

    return {
      data: [
        "Package['universe:i18n'].i18n.addTranslations(",
        `'${locale}',`,
        `'${options.namespace ?? packageName ?? ''}',`,
        JSON.stringify(content.data),
        ');',
        `Package['universe:i18n'].i18n._ts = Math.max(Package['universe:i18n'].i18n._ts, ${Date.now()});`
      ].join(''),
    };
  }

  compileOneFileLater(
    file: InputFile,
    getCompileResult: () => Promise<CompileResult | null>,
  ) {
    file.addJavaScript(this.getFileInfo(file), getCompileResult);
  }

  compileResultSize(compileResult: CompileResult) {
    return compileResult.data.length;
  }

  getCacheKey(file: InputFile) {
    return `${file.getArch()}#${file.getSourceHash()}`;
  }

  getFileInfo(file: InputFile): FileInfo {
    const sourcePath = file.getPathInPackage();
    const path = `${sourcePath}.js`;
    return { path, sourcePath };
  }
}

function analyzePath(sourcePath: string) {
  const type = path.extname(sourcePath);
  const parts = sourcePath.replace(`.i18n.${type}`, '').split(/[-./\\_]/g);
  for (let length = parts.length; length; --length) {
    const locale = i18n.normalize(parts.slice(-length).join('-'));
    if (locale) {
      return { locale, type };
    }
  }

  return { locale: undefined, type };
}

function extractString(data: JSON, key: string) {
  if (!isJSONObject(data) || !(key in data)) {
    return undefined;
  }

  const value = data[key];
  delete data[key];
  return typeof value === 'string' ? value : undefined;
}

function read(source: string, type: string) {
  try {
    return { data: readUnsafe(source, type), error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

function readUnsafe(source: string, type: string): JSON {
  switch (type) {
    case '.json':
      return JSON.parse(stripJsonComments(source));
    case '.yml':
      return YAML.load(source, {
        schema: YAML.FAILSAFE_SCHEMA,
        onWarning: console.warn.bind(console),
      });
    default:
      throw new Error(`Unknown i18n file type "${type}".`);
  }
}

function splitKeys(data: JSON, splitKey: string) {
  if (isJSONObject(data)) {
    for (const [key, value] of Object.entries(data)) {
      if (key.includes(splitKey)) {
        const path = key.split(splitKey);
        if (path.every(prop => prop.length)) {
          delete data[key];
          set(data, path.join(''), value);
        }
      }

      splitKeys(value, splitKey);
    }
  }
}
