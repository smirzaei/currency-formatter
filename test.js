var chai = require('chai')
var assert = chai.assert
var currencyFormatter = require('./index')

describe('format', () => {
  context('Default Options', () => {
    context('Symbol on the left', () => {
      context('No Space', () => {
        it('Returns -$10.00 for -10', () => {
          var result = currencyFormatter.format(-10, { code: 'USD' })
          assert.equal(result, '-$10.00')
        })

        it('Returns $0.00 for 0', () => {
          var result = currencyFormatter.format(0, { code: 'USD' })
          assert.equal(result, '$0.00')
        })

        it('Returns $10.00 for 10', () => {
          var result = currencyFormatter.format(10, { code: 'USD' })
          assert.equal(result, '$10.00')
        })

        it('Returns $100.00 for 100', () => {
          var result = currencyFormatter.format(100, { code: 'USD' })
          assert.equal(result, '$100.00')
        })

        it('Returns $1,000.00 for 1000', () => {
          var result = currencyFormatter.format(1000, { code: 'USD' })
          assert.equal(result, '$1,000.00')
        })

        it('Returns $10,000.00 for 10000', () => {
          var result = currencyFormatter.format(10000, { code: 'USD' })
          assert.equal(result, '$10,000.00')
        })

        it('Returns $1,000,000.00 for 1000000', () => {
          var result = currencyFormatter.format(1000000, { code: 'USD' })
          assert.equal(result, '$1,000,000.00')
        })
      })

      context('With Space', () => {
        it('Returns -$ 10,00 for -10', () => {
          var result = currencyFormatter.format(-10, { code: 'ARS' })
          assert.equal(result, '-$ 10,00')
        })

        it('Returns $ 0,00 for 0', () => {
          var result = currencyFormatter.format(0, { code: 'ARS' })
          assert.equal(result, '$ 0,00')
        })

        it('Returns $ 10,00 for 10', () => {
          var result = currencyFormatter.format(10, { code: 'ARS' })
          assert.equal(result, '$ 10,00')
        })

        it('Returns $ 100,00 for 100', () => {
          var result = currencyFormatter.format(100, { code: 'ARS' })
          assert.equal(result, '$ 100,00')
        })

        it('Returns $ 1.000,00 for 1000', () => {
          var result = currencyFormatter.format(1000, { code: 'ARS' })
          assert.equal(result, '$ 1.000,00')
        })

        it('Returns $ 10.000,00 for 10000', () => {
          var result = currencyFormatter.format(10000, { code: 'ARS' })
          assert.equal(result, '$ 10.000,00')
        })

        it('Returns $ 1.000.000,00 for 1000000', () => {
          var result = currencyFormatter.format(1000000, { code: 'ARS' })
          assert.equal(result, '$ 1.000.000,00')
        })
      })
    })

    context('Symbol on the right', () => {
      context('No Space', () => {
        it('Returns -10.00Nfk for -10', () => {
          var result = currencyFormatter.format(-10, { code: 'ERN' })
          assert.equal(result, '-10.00Nfk')
        })

        it('Returns 0.00Nfk for 0', () => {
          var result = currencyFormatter.format(0, { code: 'ERN' })
          assert.equal(result, '0.00Nfk')
        })

        it('Returns 10.00Nfk for 10', () => {
          var result = currencyFormatter.format(10, { code: 'ERN' })
          assert.equal(result, '10.00Nfk')
        })

        it('Returns 100.00Nfk for 100', () => {
          var result = currencyFormatter.format(100, { code: 'ERN' })
          assert.equal(result, '100.00Nfk')
        })

        it('Returns 1,000.00Nfk for 1000', () => {
          var result = currencyFormatter.format(1000, { code: 'ERN' })
          assert.equal(result, '1,000.00Nfk')
        })

        it('Returns 10,000.00Nfk for 10000', () => {
          var result = currencyFormatter.format(10000, { code: 'ERN' })
          assert.equal(result, '10,000.00Nfk')
        })

        it('Returns 1,000,000.00Nfk for 1000000', () => {
          var result = currencyFormatter.format(1000000, { code: 'ERN' })
          assert.equal(result, '1,000,000.00Nfk')
        })
      })

      context('With Space', () => {
        it('Returns -10,00 € for -10', () => {
          var result = currencyFormatter.format(-10, { code: 'EUR' })
          assert.equal(result, '-10,00 €')
        })

        it('Returns 0,00 € for 0', () => {
          var result = currencyFormatter.format(0, { code: 'EUR' })
          assert.equal(result, '0,00 €')
        })

        it('Returns 10,00 € for 10', () => {
          var result = currencyFormatter.format(10, { code: 'EUR' })
          assert.equal(result, '10,00 €')
        })

        it('Returns 100,00 € for 100', () => {
          var result = currencyFormatter.format(100, { code: 'EUR' })
          assert.equal(result, '100,00 €')
        })

        it('Returns 1 000,00 € for 1000', () => {
          var result = currencyFormatter.format(1000, { code: 'EUR' })
          assert.equal(result, '1 000,00 €')
        })

        it('Returns 10 000,00 € for 10000', () => {
          var result = currencyFormatter.format(10000, { code: 'EUR' })
          assert.equal(result, '10 000,00 €')
        })

        it('Returns 1 000 000,00 € for 1000000', () => {
          var result = currencyFormatter.format(1000000, { code: 'EUR' })
          assert.equal(result, '1 000 000,00 €')
        })
      })
    })
  })

  context('With locale option', () => {
    it('Returns 1 234,56 € for fi', () => {
      var result = currencyFormatter.format(1234.56, {
        locale: 'fi'
      })

      assert.equal(result, '1 234,56 €')
    })

    it('Returns €1.234,56 for nl-NL', () => {
      var result = currencyFormatter.format(1234.56, {
        locale: 'nl-NL'
      })

      assert.equal(result, '€1.234,56')
    })

    it('Returns €1.234,56 for nl', () => {
      var result = currencyFormatter.format(1234.56, {
        locale: 'nl'
      })

      assert.equal(result, '€1.234,56')
    })

    it('Returns 1.000.000,00 € for de-DE', () => {
      var result = currencyFormatter.format(1000000, {
        locale: 'de-DE'
      })

      assert.equal(result, '1.000.000,00 €')
    })

    it('Allows for overriding with options', () => {
      var result = currencyFormatter.format(1234.56, {
        locale: 'nl-NL',
        decimal: '__'
      })

      assert.equal(result, '€1.234__56')
    });

    it('Allows for using locale settings with a custom currency', () => {
      var result = currencyFormatter.format(1234.56, {
        locale: 'nl-NL',
        code: 'USD'
      })

      assert.equal(result, '$1.234,56')
    });

    it('returns €1,000,000.00 for en-US locale', () => {
      var result = currencyFormatter.format(1000000, {
        locale: 'en-US',
        code: 'EUR'
      });

      assert.equal(result, '€1,000,000.00');
    })
  })

  context('Overriding Options', () => {
    it('Returns 1^000^000*000 ¯\\_(ツ)_/¯ for the given parameters', () => {
      var result = currencyFormatter.format(1000000, {
        code: 'USD',
        symbol: '¯\\_(ツ)_/¯',
        decimal: '*',
        thousand: '^',
        precision: 3,
        format: '%v %s'
      })

      assert.equal(result, '1^000^000*000 ¯\\_(ツ)_/¯')
    })

    it('Supports objects for format, to override the positive result', () => {
      var result = currencyFormatter.format(10, {
        code: 'USD',
        format: {
          pos: '%s  %v',
          neg: '-%s%v'
        }
      })

      assert.equal(result, '$  10.00')
    })

    it('Supports objects for format, to override the negative result', () => {
      var result = currencyFormatter.format(-10, {
        code: 'USD',
        format: {
          pos: '%s  %v',
          neg: '(%s%v)'
        }
      })

      assert.equal(result, '($10.00)')
    })

    it('Supports empty symbol', () => {
      var result = currencyFormatter.format(1000000, {
        code: 'USD',
        symbol: ''
      })

      assert.equal(result, '1,000,000.00')
    })

    it('Supports empty decimal', () => {
      var result = currencyFormatter.format(1000000, {
        code: 'USD',
        decimal: ''
      })

      assert.equal(result, '$1,000,00000')
    })

    it('Supports empty thousands separator', () => {
      var result = currencyFormatter.format(1000000, {
        code: 'USD',
        thousand: ''
      })

      assert.equal(result, '$1000000.00')
    })

    it('Supports 0 precision digits', () => {
      var result = currencyFormatter.format(1000000, {
        code: 'USD',
        precision: 0
      })

      assert.equal(result, '$1,000,000')
    })

    it('Supports empty format', () => {
      var result = currencyFormatter.format(1000000, {
        code: 'USD',
        format: ''
      })

      assert.equal(result, '$1,000,000.00')
    })
  })

  context('When the currency is not found', () => {
    it('Uses default values', () => {
      var result = currencyFormatter.format(1000000, {
        code: 'None existing currency'
      })

      assert.equal(result, '1,000,000.00')
    })
  })
})

describe('currencies', () => {
  it('should be exposed as public via require()', () => {
    assert(Array.isArray(require('./currencies')))
  })

  it('should be exposed as public via .currencies', () => {
    assert(Array.isArray(currencyFormatter.currencies))
  })
})

describe('findCurrency', () => {
  it('returns the expected currency for USD', () => {
    var expected = {
      code: 'USD',
      symbol: '$',
      thousandsSeparator: ',',
      decimalSeparator: '.',
      symbolOnLeft: true,
      spaceBetweenAmountAndSymbol: false,
      decimalDigits: 2
    }

    var result = currencyFormatter.findCurrency('USD')

    assert.deepEqual(result, expected)
  })

  it('returns the expected currency for EUR', () => {
    var expected = {
      code: 'EUR',
      symbol: '€',
      thousandsSeparator: ' ',
      decimalSeparator: ',',
      symbolOnLeft: false,
      spaceBetweenAmountAndSymbol: true,
      decimalDigits: 2
    }

    var result = currencyFormatter.findCurrency('EUR')

    assert.deepEqual(result, expected)
  })

  it('returns undefined when it can\'t find the currency', () => {
    var result = currencyFormatter.findCurrency('NON EXISTING')
    assert.isUndefined(result)
  })
})

describe('parseCurrency', () => {
  it('returns amount as float', () => {
    assert.deepEqual(currencyFormatter.unformat('1.000,99', { locale: 'de-DE' }), 1000.99)
    assert.deepEqual(currencyFormatter.unformat('10\'000 CHF', { code: 'CHF' }), 10000)
    assert.deepEqual(currencyFormatter.unformat('10.00 CHF', { code: 'CHF' }), 10)
    assert.deepEqual(currencyFormatter.unformat('10,00 CHF', { code: 'CHF' }), 1000)
    assert.deepEqual(currencyFormatter.unformat('10,00 CHF', { code: 'CHF', decimal: ',' }), 10)
  })
})
