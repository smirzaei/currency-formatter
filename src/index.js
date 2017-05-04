// TODO: #31

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

export function format(value, ...options) {
  const formatOption = options.reduce((p, c) => Object.assign(p, c), {})
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
