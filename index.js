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
    symbol: options.symbol || currency.symbol,
    decimal: options.decimal || currency.decimalSeparator,
    thousand: options.thousand || currency.thousandsSeparator,
    precision: options.precision || currency.decimalDigits,
    format: options.format || format
  })
}

exports.findCurrency = function (currencyCode) {
  return find(currencies, function(c) { return c.code === currencyCode; });
}
