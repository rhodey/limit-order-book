const Decimal = require('decimal.js')

const sides = ['ask', 'bid']

const LimitOrder = function(orderId, side, price, size) {
  if (!sides.includes(side)) { throw new Error('side must be ask or bid') }
  if (typeof price !== 'string') { throw new Error('price must be string') }
  if (typeof size !== 'string') { throw new Error('size must be string') }
  this.orderId = orderId
  this.side = side
  this.price = price
  this.size = size
  this.sizeRemaining = size
  this.filled = '0'
  this.filledValue = '0'
}

LimitOrder.prototype.clearFilled = function() {
  this.filled = '0'
  this.filledValue = '0'
}

LimitOrder.prototype.reduce = function(size) {
  const before = this.sizeRemaining
  this.size = Decimal.min(size, this.size).toFixed()
  this.sizeRemaining = Decimal.min(this.sizeRemaining, this.size).toFixed()
  return new Decimal(before).sub(this.sizeRemaining).toFixed()
}

LimitOrder.prototype.subtract = function(size, price) {
  size = Decimal.min(size, this.sizeRemaining).toFixed()
  this.sizeRemaining = new Decimal(this.sizeRemaining).sub(size).toFixed()
  return size
}

LimitOrder.prototype.takeSize = function(size) {
  size = Decimal.min(size, this.sizeRemaining).toFixed()
  this.sizeRemaining = new Decimal(this.sizeRemaining).sub(size).toFixed()
  this.filled = new Decimal(this.filled).add(size).toFixed()
  const value = new Decimal(this.price).mul(size)
  this.filledValue = new Decimal(this.filledValue).add(value).toFixed()
  return size
}

LimitOrder.prototype.copy = function() {
  const { orderId, side, price, size, sizeRemaining, filled, filledValue } = this
  const copy = { type: 'limit', orderId, side, price, size, sizeRemaining, filled, filledValue }
  if (new Decimal(filled).lte(0)) {
    delete copy.filled
    delete copy.filledValue
  }
  return copy
}

function MarketOrder(orderId, side, size, funds='0') {
  LimitOrder.call(this, orderId, side, '0', size)
  if (typeof funds !== 'string') { throw new Error('funds must be string') }
  this.funds = funds
  this.fundsRemaining = funds
}

MarketOrder.prototype = Object.create(LimitOrder.prototype)
MarketOrder.prototype.constructor = MarketOrder

MarketOrder.prototype.getSizeFor = function(price, sizeStep='1') {
  let fundsTakeSize = new Decimal(this.fundsRemaining).div(price)
  fundsTakeSize = fundsTakeSize.div(sizeStep).floor().mul(sizeStep).toFixed()
  if (new Decimal(this.funds).gt(0) && new Decimal(this.size).gt(0)) {
    return Decimal.min(fundsTakeSize, this.sizeRemaining).toFixed()
  } else if (new Decimal(this.funds).gt(0)) {
    return fundsTakeSize
  } else if (new Decimal(this.size).gt(0)) {
    return this.sizeRemaining
  } else {
    return '0'
  }
}

MarketOrder.prototype.subtract = function(size, price, sizeStep='1') {
  const avail = this.getSizeFor(price, sizeStep)
  size = Decimal.min(size, avail).toFixed()
  this.sizeRemaining = new Decimal(this.sizeRemaining).sub(size).toFixed()
  this.filled = new Decimal(this.filled).add(size).toFixed()
  const value = new Decimal(price).mul(size)
  this.fundsRemaining = new Decimal(this.fundsRemaining).sub(value).toFixed()
  this.filledValue = new Decimal(this.filledValue).add(value).toFixed()
  this.sizeRemaining = Decimal.max(this.sizeRemaining, 0).toFixed()
  this.fundsRemaining = Decimal.max(this.fundsRemaining, 0).toFixed()
  return size
}

MarketOrder.prototype.copy = function() {
  const { orderId, side, price, size, sizeRemaining, filled, filledValue } = this
  const { funds, fundsRemaining } = this
  return {
    type: 'market',
    orderId, side, price, size, sizeRemaining, filled, filledValue,
    funds, fundsRemaining,
  }
}

module.exports = { LimitOrder, MarketOrder }
