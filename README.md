# Currency Formatter

[![Build Status](https://travis-ci.org/smirzaei/currency-formatter.svg)](https://travis-ci.org/smirzaei/currency-formatter)

A simple Javascript utility that helps you to display currency properly

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

License
=
[MIT](https://github.com/smirzaei/currency-formatter/blob/master/LICENSE)
