var currencies = require('./currencies');
var accounting = require('accounting');
var find = require('lodash.find');

exports.defaultCurrency = {
  symbol: '',
  thousandsSeparator: ',',
  decimalSeparator: '.',
  symbolOnLeft: true,
  spaceBetweenAmountAndSymbol: false,
  decimalDigits: 2
}

exports.currencies = currencies;

exports.format = function (value, options) {
  var currency = find(currencies, function(c) { return c.code === options.code; }) || exports.defaultCurrency;

  var symbolOnLeft = currency.symbolOnLeft;
  var spaceBetweenAmountAndSymbol = currency.spaceBetweenAmountAndSymbol;

  var format = "";
  if (symbolOnLeft) {
    format = spaceBetweenAmountAndSymbol
              ? "%s %v"
              : "%s%v"
  } else {
    format = spaceBetweenAmountAndSymbol
              ? "%v %s"
              : "%v%s"
  }

  return accounting.formatMoney(value, {
    symbol: isUndefined(options.symbol)
              ? currency.symbol
              : options.symbol,

    decimal:  isUndefined(options.decimal)
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

exports.findCurrency = function (currencyCode) {
  return find(currencies, function(c) { return c.code === currencyCode; });
}

function isUndefined (val) {
  return typeof val === 'undefined'
}
