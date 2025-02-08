const Decimal = require('decimal.js')

const Result = function(symbol, taker, makers) {
  this.symbol = symbol
  this.taker = taker
  this.makers = makers
  this.filled = makers
    .reduce((acc, maker) => acc.add(maker.filled), new Decimal(0))
    .toFixed()
  this.filledValue = makers
    .reduce((acc, maker) => acc.add(maker.filledValue), new Decimal(0))
    .toFixed()
  this.taker.filled = this.filled
  this.taker.filledValue = this.filledValue
}

module.exports = Result
