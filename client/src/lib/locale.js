/**
 * Get the locale string for date formatting based on current i18n language
 * @param {string} lang - Current language ('fr' or 'en')
 * @returns {string} BCP 47 locale string
 */
export function getDateLocale(lang) {
  return lang === 'fr' ? 'fr-FR' : 'en-US'
}
