// TODO: #31
// TODO: Dynamic loading of currencies

const formatMapping = {
  'symbolOnLeft': {
    'spaceBetweenAmountAndSymbol': { // Beware, spaces in template literals are non-breaking
      '1': (v, s) => `${s} ${v}`,
      '-1': (v, s) => `-${s} ${v}`,
      '0': (v, s) => `${s} ${v}`,
      '-0': (v, s) => `${s} ${v}`,
    },
    'noSpaceBetweenAmountAndSymbol': {
      '1': (v, s) => `${s}${v}`,
      '-1': (v, s) => `-${s}${v}`,
      '0': (v, s) => `${s}${v}`,
      '-0': (v, s) => `${s}${v}`,
    }
  },
  'symbolOnRight': {
    'spaceBetweenAmountAndSymbol': { // Beware, spaces in template literals are non-breaking
      '1': (v, s) => `${v} ${s}`,
      '-1': (v, s) => `-${v} ${s}`,
      '0': (v, s) => `${v} ${s}`,
      '-0': (v, s) => `${v} ${s}`,
    },
    'noSpaceBetweenAmountAndSymbol': {
      '1': (v, s) => `${v}${s}`,
      '-1': (v, s) => `-${v}${s}`,
      '0': (v, s) => `${v}${s}`,
      '-0': (v, s) => `${v}${s}`,
    }
  }
}

let defaultCurrency = {}
export function setCurrency(currency) {
  defaultCurrency = currency
}

let defaultLocale = {}
export function setLocale(locale) {
  defaultLocale = locale
}

export function format(value, ...options) {
  const defaultOption = Object.assign({}, defaultCurrency, defaultLocale)
  const formatOption = Object.assign(defaultOption, ...options)
  const spaceBetweenAmountAndSymbol = formatOption.spaceBetweenAmountAndSymbol
    ? 'spaceBetweenAmountAndSymbol'
    : 'noSpaceBetweenAmountAndSymbol'

  const symbolOnLeft = formatOption.symbolOnLeft
    ? 'symbolOnLeft'
    : 'symbolOnRight'

  const formattedValue = new Intl.NumberFormat(formatOption.localeCode, {
    minimumFractionDigits: formatOption.decimalDigits,
    maximumFractionDigits: formatOption.decimalDigits
  }).format(Math.abs(value))

  const formatPatternMapping = formatMapping[symbolOnLeft][spaceBetweenAmountAndSymbol]
  const formatPattern = formatPatternMapping[Math.sign(value).toString()]

  return formatPattern(formattedValue, formatOption.symbol)
}
