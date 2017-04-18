import { should } from 'chai'
should()

import USD from '../currencies/USD'
import { format } from '../src'

describe('format when', () => {
  context('no default is set', () => {
    context('only currency is passed', () => {
      context('for USD', () => {
        it('should return $1.00 for 1', () => {
          const value = 1
          const result = format(1, USD)
          console.log(result);


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
    })
  })
})
