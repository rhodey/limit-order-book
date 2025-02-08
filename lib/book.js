const Decimal = require('decimal.js')
const LevelQueue = require('./queue.js')
const { MarketOrder } = require('./orders.js')
const Result = require('./result.js')

const isMarket = (order) => order instanceof MarketOrder

const defaults = { symbol: '', priceStep: '1', sizeStep: '1' }

const LimitOrderBook = function(opts={}) {
  opts = {...defaults, ...opts}
  this.symbol = opts.symbol
  this.askLevels = new LevelQueue('ask')
  this.bidLevels = new LevelQueue('bid')
  this.config(opts)
  this.orders = {}
}

LimitOrderBook.prototype.config = function(opts) {
  this.priceStep = opts.priceStep
  this.sizeStep = opts.sizeStep
  this.askLevels.config(opts)
  this.bidLevels.config(opts)
}

LimitOrderBook.prototype._processAsk = function(ask) {
  let makers = []
  let next = this.bidLevels.takeSizeFromBestLevel(ask)
  while (next.length > 0) {
    makers = makers.concat(next)
    next = this.bidLevels.takeSizeFromBestLevel(ask)
  }
  if (new Decimal(ask.sizeRemaining).gt(0) && !isMarket(ask)) {
    this.askLevels.add(ask)
  }
  return makers
}

LimitOrderBook.prototype._processBid = function(bid) {
  let makers = []
  let next = this.askLevels.takeSizeFromBestLevel(bid)
  while (next.length > 0) {
    makers = makers.concat(next)
    next = this.askLevels.takeSizeFromBestLevel(bid)
  }
  if (new Decimal(bid.sizeRemaining).gt(0) && !isMarket(bid)) {
    this.bidLevels.add(bid)
  }
  return makers
}

const parse = (str) => {
  try {
    return new Decimal(str)
  } catch (err) {
    return new Decimal(0)
  }
}

LimitOrderBook.prototype._validate = function(order) {
  const { priceStep, sizeStep } = this
  let { price, size, funds } = order
  price = parse(price)
  size = parse(size)
  funds = parse(funds)
  if (!isMarket(order) && price.lte(0)) { throw new Error('limit order needs price > 0') }
  if (!isMarket(order) && size.lte(0)) { throw new Error('limit order needs size > 0') }
  if (size.lte(0) && funds.lte(0)) { throw new Error('order needs size > 0 or funds > 0') }
  let ok = price.mod(priceStep).eq(0)
  if (!ok) { throw new Error(`price must be divisible by ${priceStep.toFixed()}`) }
  ok = size.mod(sizeStep).eq(0)
  if (!ok) { throw new Error(`size must be divisible by ${sizeStep.toFixed()}`) }
}

LimitOrderBook.prototype._removeIfEmpty = function(order) {
  if (new Decimal(order.sizeRemaining).gt(0)) { return }
  delete this.orders[order.orderId]
}

LimitOrderBook.prototype.add = function(order) {
  this._validate(order)
  let makers = null
  let takeSize = order.sizeRemaining
  if (order.side === 'ask') {
    makers = this._processAsk(order)
  } else {
    makers = this._processBid(order)
  }
  const copies = makers.map((maker) => maker.copy())
  makers.forEach((maker) => {
    maker.clearFilled()
    this._removeIfEmpty(maker)
  })
  if (isMarket(order)) {
    return new Result(this.symbol, order.copy(), copies)
  }
  if (new Decimal(order.sizeRemaining).gt(0)) { this.orders[order.orderId] = order }
  return new Result(this.symbol, order.copy(), copies)
}

LimitOrderBook.prototype.reduce = function(orderId, size) {
  const { sizeStep } = this
  const ok = new Decimal(size).mod(sizeStep).eq(0)
  if (!ok) { throw new Error(`size must be divisible by ${sizeStep.toFixed()}`) }
  let order = this.orders[orderId]
  if (!order) { return null }
  order = order.side === 'ask' ?
    this.askLevels.reduce(order.price, orderId, size) :
    this.bidLevels.reduce(order.price, orderId, size)
  this._removeIfEmpty(order)
  return order
}

LimitOrderBook.prototype.remove = function(orderId) {
  const order = this.orders[orderId]
  if (!order) { return null }
  delete this.orders[orderId]
  return order.side === 'ask' ?
    this.askLevels.remove(order.price, orderId) :
    this.bidLevels.remove(order.price, orderId)
}

LimitOrderBook.prototype.clear = function() {
  this.orders = {}
  this.askLevels.clear()
  this.bidLevels.clear()
}

module.exports = LimitOrderBook
