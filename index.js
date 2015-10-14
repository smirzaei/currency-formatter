var data = require('./data');
var accounting = require('accounting');

var FormatCurrency = function() {

}

FormatCurrency.prototype.format = function (value, options) {
  var currency = data.find(c => c.code === options.code);

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
    symbol: currency.symbol,
    decimal: currency.decimalSeparator,
		thousand: currency.thousandsSeparator,
		precision: currency.decimalDigits,
    format: format
  })
}

module.exports = new FormatCurrency();
