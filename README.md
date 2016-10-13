# Currency Formatter

[![Build Status](https://travis-ci.org/smirzaei/currency-formatter.svg)](https://travis-ci.org/smirzaei/currency-formatter)

A simple Javascript utility that helps you to display currency properly

Reason for Fork
=
This particular [commit on the original repo](7ea07c35c0a578b90a352e3ca50ae6e6a29f8b4b) causes problems
for our repo.

From @naganowl,
Root cause is a combo of that and using of in CoffeeScript is bad because it turns into an in in Javascript which loops over keys you don't own. We have a lot of CoffeeScript doing this when it should be using in which turns into a basic for loop
It's not a problem with the library as much as it's a problem with our problematic CoffeeScript

Install
=

`npm install currency-formatter --save`

Basic Usage
=

```JAVASCRIPT
var currencyFormatter = require('currency-formatter');

currencyFormatter.format(1000000, { code: 'USD' });
// => '$1,000,000.00'

currencyFormatter.format(1000000, { code: 'GBP' });
// => '£1,000,000.00'

currencyFormatter.format(1000000, { code: 'EUR' });
// => '1 000 000,00 €'
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
```

You could also get a list of all the currencies here using one of the following:

```js
var currencies = require('currency-formatter/currencies');
// OR
var currencyFormatter = require('currency-formatter');
var currencies = currencyFormatter.currencies;
```

License
=
[MIT](https://github.com/smirzaei/currency-formatter/blob/master/LICENSE)
