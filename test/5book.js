const test = require('tape')
const Decimal = require('decimal.js')
const LimitOrderBook = require('../lib/book.js')
const { newAsk, newMarketAsk } = require('./util.js')
const { newBid, newMarketBid } = require('./util.js')

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

test('book - add remove clear asks', (t) => {
  t.plan(4)
  const book = new LimitOrderBook()

  book.add(newAsk('10', '20', '00'))
  book.add(newAsk('30', '40', '01'))

  t.ok(book.remove('00'))
  book.clear()
  t.ok(!book.remove('01'))

  t.equal(askVolume(book), '0')
  t.equal(bidVolume(book), '0')
})

test('book - add remove clear bids', (t) => {
  t.plan(4)
  const book = new LimitOrderBook()

  book.add(newBid('10', '20', '00'))
  book.add(newBid('30', '40', '01'))

  t.ok(book.remove('00'))
  book.clear()
  t.ok(!book.remove('01'))

  t.equal(askVolume(book), '0')
  t.equal(bidVolume(book), '0')
})

test('book - ask wont take empty book', (t) => {
  t.plan(5)
  const book = new LimitOrderBook()
  const result = book.add(newAsk('10', '10'))

  t.equal(result.filled, '0')
  t.equal(result.filledValue, '0')
  t.equal(result.makers.length, 0)

  t.equal(askVolume(book), '10')
  t.equal(bidVolume(book), '0')
})

test('book - bid wont take empty book', (t) => {
  t.plan(5)
  const book = new LimitOrderBook()
  const result = book.add(newBid('10', '10'))

  t.equal(result.filled, '0')
  t.equal(result.filledValue, '0')
  t.equal(result.makers.length, 0)

  t.equal(askVolume(book), '0')
  t.equal(bidVolume(book), '10')
})

test('book - market ask wont take empty book', (t) => {
  t.plan(6)
  const book = new LimitOrderBook()
  const taker = newMarketAsk('10', '20', '00')
  const result = book.add(taker)

  t.equal(result.filled, '0')
  t.equal(result.filledValue, '0')
  t.equal(result.makers.length, 0)
  t.ok(!book.remove('00'))

  t.equal(askVolume(book), '0')
  t.equal(bidVolume(book), '0')
})

test('book - market bid wont take empty book', (t) => {
  t.plan(6)
  const book = new LimitOrderBook()
  const taker = newMarketBid('10', '20', '00')
  const result = book.add(taker)

  t.equal(result.filled, '0')
  t.equal(result.filledValue, '0')
  t.equal(result.makers.length, 0)
  t.ok(!book.remove('00'))

  t.equal(askVolume(book), '0')
  t.equal(bidVolume(book), '0')
})

test('book - ask wont take lesser bid', (t) => {
  t.plan(8)
  const book = new LimitOrderBook()
  let result = book.add(newBid('8', '10'))

  t.equal(result.filled, '0')
  t.equal(result.filledValue, '0')
  t.equal(result.makers.length, 0)

  result = book.add(newAsk('9', '10'))

  t.equal(result.filled, '0')
  t.equal(result.filledValue, '0')
  t.equal(result.makers.length, 0)

  t.equal(askVolume(book), '10')
  t.equal(bidVolume(book), '10')
})

test('book - bid wont take greater ask', (t) => {
  t.plan(8)
  const book = new LimitOrderBook()
  let result = book.add(newAsk('8', '10'))

  t.equal(result.filled, '0')
  t.equal(result.filledValue, '0')
  t.equal(result.makers.length, 0)

  result = book.add(newBid('7', '10'))

  t.equal(result.filled, '0')
  t.equal(result.filledValue, '0')
  t.equal(result.makers.length, 0)

  t.equal(askVolume(book), '10')
  t.equal(bidVolume(book), '10')
})

test('book - one ask takes one smaller size bid', (t) => {
  t.plan(8)
  const book = new LimitOrderBook()
  let result = book.add(newBid('10', '5'))

  t.equal(result.filled, '0')
  t.equal(result.filledValue, '0')
  t.equal(result.makers.length, 0)

  result = book.add(newAsk('10', '20'))

  t.equal(result.filled, '5')
  t.equal(result.filledValue, ''+(10 * 5))
  t.equal(result.makers.length, 1)

  t.equal(askVolume(book), '15')
  t.equal(bidVolume(book), '0')
})

test('book - one ask takes one equal size bid', (t) => {
  t.plan(8)
  const book = new LimitOrderBook()
  let result = book.add(newBid('10', '5'))

  t.equal(result.filled, '0')
  t.equal(result.filledValue, '0')
  t.equal(result.makers.length, 0)

  result = book.add(newAsk('10', '5'))

  t.equal(result.filled, '5')
  t.equal(result.filledValue, ''+(10 * 5))
  t.equal(result.makers.length, 1)

  t.equal(askVolume(book), '0')
  t.equal(bidVolume(book), '0')
})

test('book - one ask takes one larger size bid', (t) => {
  t.plan(8)
  const book = new LimitOrderBook()
  let result = book.add(newBid('10', '15'))

  t.equal(result.filled, '0')
  t.equal(result.filledValue, '0')
  t.equal(result.makers.length, 0)

  result = book.add(newAsk('10', '5'))

  t.equal(result.filled, '5')
  t.equal(result.filledValue, ''+(10 * 5))
  t.equal(result.makers.length, 1)

  t.equal(askVolume(book), '0')
  t.equal(bidVolume(book), '10')
})

test('book - one bid takes one smaller size ask', (t) => {
  t.plan(8)
  const book = new LimitOrderBook()
  let result = book.add(newAsk('10', '5'))

  t.equal(result.filled, '0')
  t.equal(result.filledValue, '0')
  t.equal(result.makers.length, 0)

  result = book.add(newBid('10', '8'))

  t.equal(result.filled, '5')
  t.equal(result.filledValue, ''+(10 * 5))
  t.equal(result.makers.length, 1)

  t.equal(askVolume(book), '0')
  t.equal(bidVolume(book), '3')
})

test('book - one bid takes one equal size ask', (t) => {
  t.plan(8)
  const book = new LimitOrderBook()
  let result = book.add(newAsk('10', '5'))

  t.equal(result.filled, '0')
  t.equal(result.filledValue, '0')
  t.equal(result.makers.length, 0)

  result = book.add(newBid('10', '5'))

  t.equal(result.filled, '5')
  t.equal(result.filledValue, ''+(10 * 5))
  t.equal(result.makers.length, 1)

  t.equal(askVolume(book), '0')
  t.equal(bidVolume(book), '0')
})

test('book - one bid takes one larger size ask', (t) => {
  t.plan(8)
  const book = new LimitOrderBook()
  let result = book.add(newAsk('10', '5'))

  t.equal(result.filled, '0')
  t.equal(result.filledValue, '0')
  t.equal(result.makers.length, 0)

  result = book.add(newBid('10', '2'))

  t.equal(result.filled, '2')
  t.equal(result.filledValue, ''+(10 * 2))
  t.equal(result.makers.length, 1)

  t.equal(askVolume(book), '3')
  t.equal(bidVolume(book), '0')
})

test('book - one market size ask takes one smaller size bid', (t) => {
  t.plan(8)
  const book = new LimitOrderBook()
  let result = book.add(newBid('10', '5'))

  t.equal(result.filled, '0')
  t.equal(result.filledValue, '0')
  t.equal(result.makers.length, 0)

  result = book.add(newMarketAsk('10', '0'))

  t.equal(result.filled, '5')
  t.equal(result.filledValue, ''+(10 * 5))
  t.equal(result.makers.length, 1)

  t.equal(askVolume(book), '0')
  t.equal(bidVolume(book), '0')
})

test('book - one market size ask takes one equal size bid', (t) => {
  t.plan(8)
  const book = new LimitOrderBook()
  let result = book.add(newBid('10', '5'))

  t.equal(result.filled, '0')
  t.equal(result.filledValue, '0')
  t.equal(result.makers.length, 0)

  result = book.add(newMarketAsk('5', '0'))

  t.equal(result.filled, '5')
  t.equal(result.filledValue, ''+(10 * 5))
  t.equal(result.makers.length, 1)

  t.equal(askVolume(book), '0')
  t.equal(bidVolume(book), '0')
})

test('book - one market size ask takes one larger size bid', (t) => {
  t.plan(8)
  const book = new LimitOrderBook()
  let result = book.add(newBid('10', '8'))

  t.equal(result.filled, '0')
  t.equal(result.filledValue, '0')
  t.equal(result.makers.length, 0)

  result = book.add(newMarketAsk('5', '0'))

  t.equal(result.filled, '5')
  t.equal(result.filledValue, ''+(10 * 5))
  t.equal(result.makers.length, 1)

  t.equal(askVolume(book), '0')
  t.equal(bidVolume(book), '3')
})

test('book - one market funds ask takes one smaller size bid', (t) => {
  t.plan(8)
  const book = new LimitOrderBook()
  let result = book.add(newBid('1', '5'))

  t.equal(result.filled, '0')
  t.equal(result.filledValue, '0')
  t.equal(result.makers.length, 0)

  result = book.add(newMarketAsk('0', '10'))

  t.equal(result.filled, '5')
  t.equal(result.filledValue, '5')
  t.equal(result.makers.length, 1)

  t.equal(askVolume(book), '0')
  t.equal(bidVolume(book), '0')
})

test('book - one market funds ask takes one equal size bid', (t) => {
  t.plan(8)
  const book = new LimitOrderBook()
  let result = book.add(newBid('1', '5'))

  t.equal(result.filled, '0')
  t.equal(result.filledValue, '0')
  t.equal(result.makers.length, 0)

  result = book.add(newMarketAsk('0', '5'))

  t.equal(result.filled, '5')
  t.equal(result.filledValue, '5')
  t.equal(result.makers.length, 1)

  t.equal(askVolume(book), '0')
  t.equal(bidVolume(book), '0')
})

test('book - one market funds ask takes one larger size bid', (t) => {
  t.plan(8)
  const book = new LimitOrderBook()
  let result = book.add(newBid('1', '10'))

  t.equal(result.filled, '0')
  t.equal(result.filledValue, '0')
  t.equal(result.makers.length, 0)

  result = book.add(newMarketAsk('0', '5'))

  t.equal(result.filled, '5')
  t.equal(result.filledValue, '5')
  t.equal(result.makers.length, 1)

  t.equal(askVolume(book), '0')
  t.equal(bidVolume(book), '5')
})

test('book - one market size bid takes one smaller size ask', (t) => {
  t.plan(8)
  const book = new LimitOrderBook()
  let result = book.add(newAsk('10', '5'))

  t.equal(result.filled, '0')
  t.equal(result.filledValue, '0')
  t.equal(result.makers.length, 0)

  result = book.add(newMarketBid('10', '0'))

  t.equal(result.filled, '5')
  t.equal(result.filledValue, ''+(10 * 5))
  t.equal(result.makers.length, 1)

  t.equal(askVolume(book), '0')
  t.equal(bidVolume(book), '0')
})

test('book - one market size bid takes one equal size ask', (t) => {
  t.plan(8)
  const book = new LimitOrderBook()
  let result = book.add(newAsk('10', '5'))

  t.equal(result.filled, '0')
  t.equal(result.filledValue, '0')
  t.equal(result.makers.length, 0)

  result = book.add(newMarketBid('5', '0'))

  t.equal(result.filled, '5')
  t.equal(result.filledValue, ''+(10 * 5))
  t.equal(result.makers.length, 1)

  t.equal(askVolume(book), '0')
  t.equal(bidVolume(book), '0')
})

test('book - one market size bid takes one larger size ask', (t) => {
  t.plan(8)
  const book = new LimitOrderBook()
  let result = book.add(newAsk('10', '10'))

  t.equal(result.filled, '0')
  t.equal(result.filledValue, '0')
  t.equal(result.makers.length, 0)

  result = book.add(newMarketBid('5', '0'))

  t.equal(result.filled, '5')
  t.equal(result.filledValue, ''+(10 * 5))
  t.equal(result.makers.length, 1)

  t.equal(askVolume(book), '5')
  t.equal(bidVolume(book), '0')
})

test('book - one market funds bid takes one smaller size ask', (t) => {
  t.plan(8)
  const book = new LimitOrderBook()
  let result = book.add(newAsk('1', '5'))

  t.equal(result.filled, '0')
  t.equal(result.filledValue, '0')
  t.equal(result.makers.length, 0)

  result = book.add(newMarketBid('0', '10'))

  t.equal(result.filled, '5')
  t.equal(result.filledValue, '5')
  t.equal(result.makers.length, 1)

  t.equal(askVolume(book), '0')
  t.equal(bidVolume(book), '0')
})

test('book - one market funds bid takes one equal size ask', (t) => {
  t.plan(8)
  const book = new LimitOrderBook()
  let result = book.add(newAsk('1', '5'))

  t.equal(result.filled, '0')
  t.equal(result.filledValue, '0')
  t.equal(result.makers.length, 0)

  result = book.add(newMarketBid('0', '5'))

  t.equal(result.filled, '5')
  t.equal(result.filledValue, '5')
  t.equal(result.makers.length, 1)

  t.equal(askVolume(book), '0')
  t.equal(bidVolume(book), '0')
})

test('book - one market funds bid takes one larger size ask', (t) => {
  t.plan(8)
  const book = new LimitOrderBook()
  let result = book.add(newAsk('1', '10'))

  t.equal(result.filled, '0')
  t.equal(result.filledValue, '0')
  t.equal(result.makers.length, 0)

  result = book.add(newMarketBid('0', '5'))

  t.equal(result.filled, '5')
  t.equal(result.filledValue, '5')
  t.equal(result.makers.length, 1)

  t.equal(askVolume(book), '5')
  t.equal(bidVolume(book), '0')
})
