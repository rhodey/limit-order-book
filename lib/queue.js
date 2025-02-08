const Decimal = require('decimal.js')
const Level = require('./level.js')
const { MarketOrder } = require('./orders.js')

const sides = ['bid', 'ask']
const isMarket = (order) => order instanceof MarketOrder

const sortAsks = (a, b) => new Decimal(a.price).sub(b.price).toNumber()
const sortBids = (a, b) => new Decimal(b.price).sub(a.price).toNumber()

const LevelQueue = function(side, opts={}) {
  if (!sides.includes(side)) { throw new Error('side must be bid, ask') }
  this.side = side
  this.opts = opts
  this.queue = []
  this.map = {}
}

LevelQueue.prototype.config = function(opts) {
  this.opts = opts
  this.queue.forEach((level) => level.config(opts))
}

LevelQueue.prototype._sort = function() {
  const sort = this.side === 'ask' ? sortAsks : sortBids
  this.queue.sort(sort)
}

LevelQueue.prototype.peek = function() {
  return this.queue[0]
}

LevelQueue.prototype.add = function(order) {
  let level = this.map[order.price]
  if (!level) {
    level = new Level(order.price)
    level.config(this.opts)
    this.map[order.price] = level
    this.queue.push(level)
    this._sort()
  }
  level.add(order)
}

const removeLevel = (queue, level) => {
  const idx = queue.indexOf(level)
  if (idx < 0) { return }
  queue.splice(idx, 1)
}

LevelQueue.prototype.reduce = function(price, orderId, size) {
  const level = this.map[price]
  if (!level) { return null }
  const order = level.reduce(orderId, size)
  if (order && !level.peek()) {
    delete this.map[price]
    removeLevel(this.queue, level)
  }
  return order
}

LevelQueue.prototype.remove = function(price, orderId) {
  const level = this.map[price]
  if (!level) { return null }
  const order = level.remove(orderId)
  if (order && !level.peek()) {
    delete this.map[price]
    removeLevel(this.queue, level)
  }
  return order
}

LevelQueue.prototype._isTaken = function(maker, taker) {
  if (isMarket(taker)) {
    return new Decimal(taker.getSizeFor(maker.price)).gt(0)
  } else if (taker.side === 'bid') {
    return new Decimal(taker.price).gte(maker.price)
  } else {
    return new Decimal(taker.price).lte(maker.price)
  }
}

LevelQueue.prototype.takeSizeFromBestLevel = function(taker) {
  const maker = this.peek()
  if (!maker) { return [] }
  if (!this._isTaken(maker, taker)) { return [] }
  const makers = maker.takeSize(taker)
  if (makers.length > 0 && !maker.peek()) {
    delete this.map[maker.price]
    this.queue.shift()
  }
  return makers
}

LevelQueue.prototype.clear = function() {
  this.map = {}
  while (this.peek()) {
    this.queue.shift().clear()
  }
}

module.exports = LevelQueue
