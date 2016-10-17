var currencies = require('./currencies')
var accounting = require('accounting')
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

exports.defaultCurrency = {
  symbol: '',
  thousandsSeparator: ',',
  decimalSeparator: '.',
  symbolOnLeft: true,
  spaceBetweenAmountAndSymbol: false,
  decimalDigits: 2
}

exports.currencies = currencies

var formatMapping = [
  {
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: false,
    format: {
      pos: '%s%v',
      neg: '(%s%v)'
    }
  },
  {
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: true,
    format: {
      pos: '%s %v',
      neg: '(%s %v)'
    }
  },
  {
    symbolOnLeft: false,
    spaceBetweenAmountAndSymbol: false,
    format: {
      pos: '%v%s',
      neg: '(%v%s)'
    }
  },
  {
    symbolOnLeft: false,
    spaceBetweenAmountAndSymbol: true,
    format: {
      pos: '%v %s',
      neg: '(%v %s)'
    }
  }
]

exports.format = function (value, options) {
  var currency = findCurrency(options.code) || exports.defaultCurrency

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

    format: typeof options.format === 'string'
              ? options.format
              : format
  })
}

function findCurrency (currencyCode) {
  return currencies.find(function (c) { return c.code === currencyCode })
}

exports.findCurrency = findCurrency

function isUndefined (val) {
  return typeof val === 'undefined'
}
