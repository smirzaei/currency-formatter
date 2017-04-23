// TODO: set default locale
// TODO: set default currency
// TODO: #31
// TODO: WAY more tests
// TODO: Dynamic loading of currencies (another file perhaps?)

import accounting from 'accounting'

const formatMapping = {
  'symbolOnLeft': {
    'spaceBetweenAmountAndSymbol': {
      pos: '%s %v',
      neg: '-%s %v',
      zero: '%s %v'
    },
    'noSpaceBetweenAmountAndSymbol': {
      pos: '%s%v',
      neg: '-%s%v',
      zero: '%s%v'
    }
  },
  'symbolOnRight': {
    'spaceBetweenAmountAndSymbol': {
      pos: '%v %s',
      neg: '-%v %s',
      zero: '%v %s'
    },
    'noSpaceBetweenAmountAndSymbol': {
      pos: '%v%s',
      neg: '-%v%s',
      zero: '%v%s'
    }
  }
}

const defaultCurrency = {}
const defaultLocale = {}

export function format(value, ...options) {
  const defaultOption = Object.assign({}, defaultCurrency, defaultLocale)
  const formatOption = options.reduce((p, c) => Object.assign(p, c), defaultOption)
  const spaceBetweenAmountAndSymbol = formatOption.spaceBetweenAmountAndSymbol
    ? 'spaceBetweenAmountAndSymbol'
    : 'noSpaceBetweenAmountAndSymbol'

  const symbolOnLeft = formatOption.symbolOnLeft
    ? 'symbolOnLeft'
    : 'symbolOnRight'

  const format = formatMapping[symbolOnLeft][spaceBetweenAmountAndSymbol]
  return accounting.formatMoney(value, {
    symbol: formatOption.symbol,
    decimal: formatOption.decimalSeparator,
    thousand: formatOption.thousandsSeparator,
    precision: formatOption.decimalDigits,
    format
  })
}
