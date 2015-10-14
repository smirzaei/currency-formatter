var chai = require('chai');
var assert = chai.assert;
var formatCurrency = require('./index');

describe("format", () => {
  context("Default Options", () => {
    context("Symbol on the left", () => {
      context("No Space", () => {
        it("Returns $10.00 for 10", () => {
          var result = formatCurrency.format(10, { code: 'USD' });
          assert.equal(result, '$10.00');
        })

        it("Returns $100.00 for 100", () => {
          var result = formatCurrency.format(100, { code: 'USD' });
          assert.equal(result, '$100.00');
        })

        it("Returns $1,000.00 for 1000", () => {
          var result = formatCurrency.format(1000, { code: 'USD' });
          assert.equal(result, '$1,000.00');
        })

        it("Returns $10,000.00 for 10000", () => {
          var result = formatCurrency.format(10000, { code: 'USD' });
          assert.equal(result, '$10,000.00');
        })

        it("Returns $1,000,000.00 for 1000000", () => {
          var result = formatCurrency.format(1000000, { code: 'USD' });
          assert.equal(result, '$1,000,000.00');
        })
      })

      context("With Space", () => {
        it("Returns $ 10,00 for 10", () => {
          var result = formatCurrency.format(10, { code: 'ARS' });
          assert.equal(result, '$ 10,00');
        })

        it("Returns $ 100,00 for 100", () => {
          var result = formatCurrency.format(100, { code: 'ARS' });
          assert.equal(result, '$ 100,00');
        })

        it("Returns $ 1.000,00 for 1000", () => {
          var result = formatCurrency.format(1000, { code: 'ARS' });
          assert.equal(result, '$ 1.000,00');
        })

        it("Returns $ 10.000,00 for 10000", () => {
          var result = formatCurrency.format(10000, { code: 'ARS' });
          assert.equal(result, '$ 10.000,00');
        })

        it("Returns $ 1.000.000,00 for 1000000", () => {
          var result = formatCurrency.format(1000000, { code: 'ARS' });
          assert.equal(result, '$ 1.000.000,00');
        })
      })
    })

    context("Symbol on the right", () => {
      context("No Space", () => {
        it("Returns 10.00Nfk for 10", () => {
          var result = formatCurrency.format(10, { code: 'ERN' });
          assert.equal(result, '10.00Nfk');
        })

        it("Returns 100.00Nfk for 100", () => {
          var result = formatCurrency.format(100, { code: 'ERN' });
          assert.equal(result, '100.00Nfk');
        })

        it("Returns 1,000.00Nfk for 1000", () => {
          var result = formatCurrency.format(1000, { code: 'ERN' });
          assert.equal(result, '1,000.00Nfk');
        })

        it("Returns 10,000.00Nfk for 10000", () => {
          var result = formatCurrency.format(10000, { code: 'ERN' });
          assert.equal(result, '10,000.00Nfk');
        })

        it("Returns 1,000,000.00Nfk for 1000000", () => {
          var result = formatCurrency.format(1000000, { code: 'ERN' });
          assert.equal(result, '1,000,000.00Nfk');
        })
      })

      context("With Space", () => {
        it("Returns 10,00 € for 10", () => {
          var result = formatCurrency.format(10, { code: 'EUR' });
          assert.equal(result, '10,00 €');
        })

        it("Returns 100,00 € for 100", () => {
          var result = formatCurrency.format(100, { code: 'EUR' });
          assert.equal(result, '100,00 €');
        })

        it("Returns 1 000,00 € for 1000", () => {
          var result = formatCurrency.format(1000, { code: 'EUR' });
          assert.equal(result, '1 000,00 €');
        })

        it("Returns 10 000,00 € for 10000", () => {
          var result = formatCurrency.format(10000, { code: 'EUR' });
          assert.equal(result, '10 000,00 €');
        })

        it("Returns 1 000 000,00 € for 1000000", () => {
          var result = formatCurrency.format(1000000, { code: 'EUR' });
          assert.equal(result, '1 000 000,00 €');
        })
      })
    })
  })

  context("Overriding Options", () => {
    it("Returns 1^000^000*000 ¯\\_(ツ)_/¯ for the given parameters", () => {
      var result = formatCurrency.format(1000000, {
        code: 'USD',
        symbol: '¯\\_(ツ)_/¯',
        decimal: '*',
        thousand: '^',
        precision: 3,
        format: '%v %s'
      });

      assert.equal(result, "1^000^000*000 ¯\\_(ツ)_/¯")
    })
  })

  context("When the currency is not found", () => {
    it("Uses default values", () => {
      var result = formatCurrency.format(1000000, {
        code: 'None existing currency'
      });

      assert.equal(result, "1,000,000.00");
    })
  })
})
