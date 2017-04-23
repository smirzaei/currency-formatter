import { should } from 'chai'
should()

import USD from '../currencies/USD'
import EUR from '../currencies/EUR'
import ARS from '../currencies/ARS'
import ERN from '../currencies/ERN'

import nl_NL from '../locales/nl-NL'

import { format } from '../src'

describe('format when', () => {
  context('no default is set', () => {
    context('only currency is passed', () => {
      // Symbol left - no space
      context('for USD', () => {
        it('should return -$1.00 for -1', () => {
          const result = format(-1, USD)
          result.should.equal('-$1.00')
        })

        it('should return $0.00 for 0', () => {
          const result = format(0, USD)
          result.should.equal('$0.00')
        })

        it('should return $1.00 for 1', () => {
          const result = format(1, USD)
          result.should.equal('$1.00')
        })

        it('should return $10.00 for 10', () => {
          const result = format(10, USD)
          result.should.equal('$10.00')
        })

        it('should return $100.00 for 100', () => {
          const result = format(100, USD)
          result.should.equal('$100.00')
        })

        it('should return $1,000.00 for 1000', () => {
          const result = format(1000, USD)
          result.should.equal('$1,000.00')
        })

        it('should return $10,000.00 for 10000', () => {
          const result = format(10000, USD)
          result.should.equal('$10,000.00')
        })
      })

      // Symbol left - with space
      context('for ARS', () => {
        it('should return -$ 1,00 for -1', () => {
          const result = format(-1, ARS)
          result.should.equal('-$ 1,00')
        })

        it('should return $ 0,00 for 0', () => {
          const result = format(0, ARS)
          result.should.equal('$ 0,00')
        })

        it('should return $ 1,00 for 1', () => {
          const result = format(1, ARS)
          result.should.equal('$ 1,00')
        })

        it('should return $ 10,00 for 10', () => {
          const result = format(10, ARS)
          result.should.equal('$ 10,00')
        })

        it('should return $ 100,00 for 100', () => {
          const result = format(100, ARS)
          result.should.equal('$ 100,00')
        })

        it('should return $ 1.000,00 for 1000', () => {
          const result = format(1000, ARS)
          result.should.equal('$ 1.000,00')
        })

        it('should return $ 10.000,00 for 10000', () => {
          const result = format(10000, ARS)
          result.should.equal('$ 10.000,00')
        })
      })

      // Symbol righr - no space
      context('for ERN', () => {
        it('should return -1.00Nfk for -1', () => {
          const result = format(-1, ERN)
          result.should.equal('-1.00Nfk')
        })

        it('should return 0.00Nfk for 0', () => {
          const result = format(0, ERN)
          result.should.equal('0.00Nfk')
        })

        it('should return 1.00Nfk for 1', () => {
          const result = format(1, ERN)
          result.should.equal('1.00Nfk')
        })

        it('should return 10.00Nfk for 10', () => {
          const result = format(10, ERN)
          result.should.equal('10.00Nfk')
        })

        it('should return 100.00Nfk for 100', () => {
          const result = format(100, ERN)
          result.should.equal('100.00Nfk')
        })

        it('should return 1,000.00Nfk for 1000', () => {
          const result = format(1000, ERN)
          result.should.equal('1,000.00Nfk')
        })

        it('should return 10,000.00Nfk for 10000', () => {
          const result = format(10000, ERN)
          result.should.equal('10,000.00Nfk')
        })
      })

      // Symbol right - with space
      context('for EUR', () => {
        it('should return -1,00 € for -1', () => {
          const result = format(-1, EUR)
          result.should.equal('-1,00 €')
        })

        it('should return 0,00 € for 0', () => {
          const result = format(0, EUR)
          result.should.equal('0,00 €')
        })

        it('should return 1,00 € for 1', () => {
          const result = format(1, EUR)
          result.should.equal('1,00 €')
        })

        it('should return 10,00 € for 10', () => {
          const result = format(10, EUR)
          result.should.equal('10,00 €')
        })

        it('should return 100,00 € for 100', () => {
          const result = format(100, EUR)
          result.should.equal('100,00 €')
        })

        it('should return 1 000,00 € for 1000', () => {
          const result = format(1000, EUR)
          result.should.equal('1 000,00 €')
        })

        it('should return 10 000,00 € for 10000', () => {
          const result = format(10000, EUR)
          result.should.equal('10 000,00 €')
        })
      })
    })

    context("Locale should override currency options", () => {
      it("should return €1.234,56 for nl-NL", () => {
        const result = format(1234.56, EUR, nl_NL)
        result.should.equal('€1.234,56')
      })
    })
  })

  context("Overrides", () => {
    it("should allow overrides", () => {
      const result = format(1000000, USD, {
        symbol: '@',
        decimalSeparator: '*',
        thousandsSeparator: '^',
        decimalDigits: 4,
        symbolOnLeft: false,
        spaceBetweenAmountAndSymbol: true
      })

      result.should.equal('1^000^000*0000 @')
    })

    it("should allow empty symbol", () => {
      const result = format(1000000, USD, {
        symbol: ''
      })

      result.should.equal('1,000,000.00')
    })

    it("should allow empty thousands separator", () => {
      const result = format(1000000, USD, {
        thousandsSeparator: ''
      })

      result.should.equal('$1000000.00')
    })

    it("should allow 0 decimal digits", () => {
      const result = format(1000000, USD, {
        decimalDigits: 0
      })

      result.should.equal('$1,000,000')
    })
  })
})
