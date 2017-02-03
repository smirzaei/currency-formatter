# Currency Formatter

[![Build Status](https://travis-ci.org/smirzaei/currency-formatter.svg)](https://travis-ci.org/smirzaei/currency-formatter)

A simple Javascript utility that helps you to display currency properly

Install
=

```bash
npm install currency-formatter --save
```

Basic Usage
=

By specifying the currency code

```js
var currencyFormatter = require('currency-formatter');

currencyFormatter.format(1000000, { code: 'USD' });
// => '$1,000,000.00'

currencyFormatter.format(1000000, { code: 'GBP' });
// => '£1,000,000.00'

currencyFormatter.format(1000000, { code: 'EUR' });
// => '1 000 000,00 €'
```

Or by specifying the locale
```js
var currencyFormatter = require('currency-formatter');

currencyFormatter.format(1000000, { locale: 'en-US' });
// => '$1,000,000.00'

currencyFormatter.format(1000000, { locale: 'en-GB' });
// => '£1,000,000.00'

currencyFormatter.format(1000000, { locale: 'GB' });
// => '£1,000,000.00'

currencyFormatter.format(1000000, { locale: 'de-DE' });
// => '1 000 000,00 €'

currencyFormatter.format(1000000, { locale: 'nl-NL' });
// => '€1.000.000,00'
```

You can also get the currency information.

```JAVASCRIPT
var currencyFormatter = require('currency-formatter');

currencyFormatter.findCurrency('USD');
// returns:
// {
//   code: 'USD',
//   symbol: '$',
//   thousandsSeparator: ',',
//   decimalSeparator: '.',
//   symbolOnLeft: true,
//   spaceBetweenAmountAndSymbol: false,
//   decimalDigits: 2
// }

```

Advanced Usage
=
Currency Formatter uses [accounting](https://github.com/openexchangerates/accounting.js) library under the hood, and you can use its options to override the default behavior.

```JAVASCRIPT
var currencyFormatter = require('currency-formatter');
currencyFormatter.format(1000000, {
  symbol: '@',
  decimal: '*',
  thousand: '^',
  precision: 1,
  format: '%v %s' // %s is the symbol and %v is the value
});

// => '1^000^000*0 @'

// Different formatting for positive and negative values
currencyFormatter.format(-10, {
  format: {
    pos: '%s%v' // %s is the symbol and %v is the value
    neg: '(%s%v)',
    zero: '%s%v'
  }
});

// => ($10)
```

You could also get a list of all the currencies here using one of the following:

```js
var currencies = require('currency-formatter/currencies');
// OR
var currencyFormatter = require('currency-formatter');
var currencies = currencyFormatter.currencies;
```

Or the currencies in hashmap shape:

```js
var currencies = require('currency-formatter/currencies.json');
// Result:
// {
//  "USD": {
//    "code": "USD",
//    "symbol": "$",
//    "thousandsSeparator": ",",
//    "decimalSeparator": ".",
//    "symbolOnLeft": true,
//    "spaceBetweenAmountAndSymbol": false,
//    "decimalDigits": 2
//  },
//  ...more currencies
// }
```

License
=
[MIT](https://github.com/smirzaei/currency-formatter/blob/master/LICENSE)
