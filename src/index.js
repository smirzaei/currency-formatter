// TODO: set default locale
// TODO: set default currency
// TODO: #31
// TODO: WAY more tests
// TODO: Dynamic loading of currencies (another file perhaps?)

const formatMapping = {
  'symbolOnLeft': {
    'spaceBetweenAmountAndSymbol': {
      '1': '%s %v',
      '-1': '-%s %v',
      '0': '%s %v',
      '-0': '%s %v',
    },
    'noSpaceBetweenAmountAndSymbol': {
      '1': '%s%v',
      '-1': '-%s%v',
      '0': '%s%v',
      '-0': '%s%v',
    }
  },
  'symbolOnRight': {
    'spaceBetweenAmountAndSymbol': {
      '1': '%v %s',
      '-1': '%v -%s',
      '0': '%v %s',
      '-0': '%v %s',
    },
    'noSpaceBetweenAmountAndSymbol': {
      '1': '%v%s',
      '-1': '%v-%s',
      '0': '%v%s',
      '-0': '%v%s',
    }
  }
}

const defaultCurrency = {}
const defaultLocale = { localeCode: 'en-US' }

export function format(value, ...options) {
  const defaultOption = Object.assign({}, defaultCurrency, defaultLocale)
  const formatOption = options.reduce((p, c) => Object.assign(p, c), defaultOption)
  const spaceBetweenAmountAndSymbol = formatOption.spaceBetweenAmountAndSymbol
    ? 'spaceBetweenAmountAndSymbol'
    : 'noSpaceBetweenAmountAndSymbol'

  const symbolOnLeft = formatOption.symbolOnLeft
    ? 'symbolOnLeft'
    : 'symbolOnRight'

  const number = new Intl.NumberFormat(formatOption.localeCode, {
    minimumFractionDigits: formatOption.decimalDigits,
    maximumFractionDigits: formatOption.decimalDigits
  }).format(value)

  const formatPatternMapping = formatMapping[symbolOnLeft][spaceBetweenAmountAndSymbol]
  const formatPattern = formatPatternMapping[Math.sign(value).toString()]


  // Is string replace a good idea?
  return formatPattern.replace('%v', number).replace('%s', formatOption.symbol)
}
