const test = require('tape')
const Decimal = require('decimal.js')
const LimitOrderBook = require('../lib/book.js')
const { newBid, newAsk } = require('./util.js')

const rand = (min, max) => Math.random() * (max - min) + min
const randPrice = (priceStep) => new Decimal(rand(1, 50)).div(priceStep).floor().mul(priceStep).toFixed()
const randSize = (sizeStep) => new Decimal(rand(1, 10)).div(sizeStep).floor().mul(sizeStep).toFixed()

const volume = (levels) => {
  let sum = new Decimal(0)
  for (const level of levels.queue) {
    for (const order of level.queue) {
      sum = sum.add(order.sizeRemaining)
    }
  }
  return sum.toFixed()
}

const askVolume = (book) => volume(book.askLevels)
const bidVolume = (book) => volume(book.bidLevels)

test('misc - large volume ok and sizeStep ok', (t) => {
  t.plan(1)
  const priceStep = '0.01'
  const sizeStep = '0.001'
  const book = new LimitOrderBook({ symbol: 'BTCUSDT', priceStep, sizeStep })
  let vol = new Decimal(0)

  for (let o = 0; o < 1000; o++) {
    const fn = Math.random() >= 0.5 ? newAsk : newBid
    const price = randPrice(priceStep)
    const size = randSize(sizeStep)
    const order = fn(price, size)
    const res = book.add(order)
    if (res.makers.length <= 0) {
      vol = vol.add(order.size)
      continue
    }

    vol = vol.sub(res.filled)
    vol = vol.add(order.sizeRemaining)

    let sum = new Decimal(askVolume(book)).add(bidVolume(book))
    let ok = sum.eq(vol)
    !ok && t.fail('volume sum not ok')

    let levels = res.makers.map((m) => m.price)
    levels = [...new Set(levels)].map((price) => {
      let level = order.side === 'ask' ? book.bidLevels : book.askLevels
      level = level.map[price] ?? { volume: '0' }
      return [price, level.volume]
    })

    ok = new Decimal(res.filled).mod(new Decimal(sizeStep)).eq(0)
    !ok && t.fail('filled size % sizeStep !== 0')

    ok = res.makers
      .map((m) => new Decimal(m.sizeRemaining))
      .every((sz) => sz.mod(new Decimal(sizeStep)).eq(0))
    !ok && t.fail('1 or more order sizeRemaining % sizeStep !== 0')

    ok = levels
      .map((l) => new Decimal(l[1]))
      .every((v) => v.mod(new Decimal(sizeStep)).eq(0))
    !ok && t.fail('1 or more level volume % sizeStep !== 0')
  }

  t.ok(1, 'volume and sizeStep ok')
})
