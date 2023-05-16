export function getAddCachedTranslationsJS(
  locale: string,
  data: string,
  namespace?: string,
) {
  return `(Package['universe:i18n'].i18n).addTranslations('${locale}', ${
    namespace ? `'${namespace}', ` : ''
  }${data}),Package['universe:i18n'].i18n._ts = Math.max(Package['universe:i18n'].i18n._ts, ${Date.now()});`;
}
