var data = require('./data');
var accounting = require('accounting');

var CurrencyFormatter = function() {
  this.defaultCurrency = {
    symbol: '',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: false,
    decimalDigits: 2
  }
}

CurrencyFormatter.prototype.format = function (value, options) {
  var currency = data.find(c => c.code === options.code) || this.defaultCurrency;

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

module.exports = new CurrencyFormatter();
