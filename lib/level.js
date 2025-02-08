const Decimal = require('decimal.js')
const { MarketOrder } = require('./orders.js')

const isMarket = (order) => order instanceof MarketOrder

const Level = function(price) {
  if (typeof price !== 'string') { throw new Error('price must be string') }
  this.volume = '0'
  this.price = price
  this.queue = []
  this.map = {}
}

Level.prototype.config = function(opts) {
  this.sizeStep = opts.sizeStep
}

Level.prototype.peek = function() {
  return this.queue[0]
}

Level.prototype.add = function(order) {
  this.queue.push(order)
  this.map[order.orderId] = order
  this.volume = new Decimal(this.volume).add(order.sizeRemaining).toFixed()
}

const removeOrder = (queue, order) => {
  const idx = queue.indexOf(order)
  if (idx < 0) { return }
  queue.splice(idx, 1)
}

Level.prototype.reduce = function(orderId, size) {
  const order = this.map[orderId]
  if (!order) { return null }
  const removed = order.reduce(size)
  this.volume = new Decimal(this.volume).sub(removed).toFixed()
  if (new Decimal(order.sizeRemaining).gt(0)) { return order }
  delete this.map[orderId]
  removeOrder(this.queue, order)
  return order
}

Level.prototype.remove = function(orderId) {
  const order = this.map[orderId]
  if (!order) { return null }
  delete this.map[orderId]
  removeOrder(this.queue, order)
  this.volume = new Decimal(this.volume).sub(order.sizeRemaining).toFixed()
  return order
}

Level.prototype._getTakeSize = function(taker) {
  if (isMarket(taker)) {
    return taker.getSizeFor(this.price, this.sizeStep)
  }
  return taker.sizeRemaining
}

Level.prototype._takeSizeFromNextMaker = function(taker, takeSize) {
  const maker = this.queue[0]
  if (!maker) { return null }
  takeSize = maker.takeSize(takeSize)
  if (new Decimal(maker.sizeRemaining).lte(0)) {
    delete this.map[maker.orderId]
    this.queue.shift()
  }
  this.volume = new Decimal(this.volume).sub(takeSize).toFixed()
  taker.subtract(takeSize, maker.price, this.sizeStep)
  return maker
}

Level.prototype.takeSize = function(taker) {
  const makers = []
  let takeSize = this._getTakeSize(taker)
  let maker = null
  while (new Decimal(takeSize).gt(0)) {
    maker = this._takeSizeFromNextMaker(taker, takeSize)
    if (!maker) { break }
    makers.push(maker)
    takeSize = this._getTakeSize(taker)
  }
  return makers
}

Level.prototype.clear = function() {
  this.volume = '0'
  this.queue = []
  this.map = {}
}

module.exports = Level
