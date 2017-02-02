var accounting = require('accounting')
var assign = require('object-assign')
var localeCurrency = require('locale-currency')
var currencies = require('./currencies.json')
var localeFormats = require('./localeFormats.json')

/*
  This polyfill intends to emulate the Array.prototy.find() method
  for browsers who don't support it yet.
*/
if (!Array.prototype.find) {
  Array.prototype.find = function(predicate) {
    if (this === null) {
      throw new TypeError('Array.prototype.find called on null or undefined');
    }
    if (typeof predicate !== 'function') {
      throw new TypeError('predicate must be a function');
    }
    var list = Object(this);
    var length = list.length >>> 0;
    var thisArg = arguments[1];
    var value;

    for (var i = 0; i < length; i++) {
      value = list[i];
      if (predicate.call(thisArg, value, i, list)) {
        return value;
      }
    }
    return undefined;
  };
}

var defaultCurrency = {
  symbol: '',
  thousandsSeparator: ',',
  decimalSeparator: '.',
  symbolOnLeft: true,
  spaceBetweenAmountAndSymbol: false,
  decimalDigits: 2
}

var defaultLocaleFormat = {}

var formatMapping = [
  {
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: false,
    format: {
      pos: '%s%v',
      neg: '-%s%v',
      zero: '%s%v'
    }
  },
  {
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: true,
    format: {
      pos: '%s %v',
      neg: '-%s %v',
      zero: '%s %v'
    }
  },
  {
    symbolOnLeft: false,
    spaceBetweenAmountAndSymbol: false,
    format: {
      pos: '%v%s',
      neg: '-%v%s',
      zero: '%v%s'
    }
  },
  {
    symbolOnLeft: false,
    spaceBetweenAmountAndSymbol: true,
    format: {
      pos: '%v %s',
      neg: '-%v %s',
      zero: '%v %s'
    }
  }
]

function format(value, options) {
  var code = options.code || (options.locale && localeCurrency.getCurrency(options.locale))
  var localeFormat = localeFormats[options.locale] || defaultLocaleFormat
  var currency = assign({}, defaultCurrency, findCurrency(code), localeFormat)
  
  var symbolOnLeft = currency.symbolOnLeft
  var spaceBetweenAmountAndSymbol = currency.spaceBetweenAmountAndSymbol

  var format = formatMapping.find(function(f) {
    return f.symbolOnLeft == symbolOnLeft && f.spaceBetweenAmountAndSymbol == spaceBetweenAmountAndSymbol
  }).format

  return accounting.formatMoney(value, {
    symbol: isUndefined(options.symbol)
              ? currency.symbol
              : options.symbol,

    decimal: isUndefined(options.decimal)
              ? currency.decimalSeparator
              : options.decimal,

    thousand: isUndefined(options.thousand)
              ? currency.thousandsSeparator
              : options.thousand,

    precision: typeof options.precision === 'number'
              ? options.precision
              : currency.decimalDigits,

    format: ['string', 'object'].indexOf(typeof options.format) > -1
              ? options.format
              : format
  })
}

function findCurrency (currencyCode) {
  return currencies[currencyCode]
}

function isUndefined (val) {
  return typeof val === 'undefined'
}

module.exports = {
  defaultCurrency: defaultCurrency,
  get currencies() {
    // In favor of backwards compatibility, the currencies map is converted to an array here
    return Object.keys(currencies).map(function(key) {
      return currencies[key]
    })
  },
  findCurrency: findCurrency,
  format: format
}