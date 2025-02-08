const test = require('tape')
const Result = require('../lib/result.js')
const { newAsk, newBid } = require('./util.js')

test('result - empty', (t) => {
  t.plan(6)
  const result = new Result('BTC', newBid('10', '20'), [])

  t.equal(result.symbol, 'BTC')
  t.equal(result.taker.price, '10')
  t.equal(result.taker.size, '20')
  t.equal(result.filled, '0')
  t.equal(result.filledValue, '0')
  t.equal(result.makers.length, 0)
})

test('result - ask makers', (t) => {
  t.plan(3)
  const ask1 = newAsk('10', '1')
  const ask2 = newAsk('10', '3')
  const ask3 = newAsk('12', '2')
  const makers = [ask1, ask2, ask3]

  ask1.takeSize(ask1.size)
  ask2.takeSize(ask2.size)
  ask3.takeSize(ask3.size)

  const TAKE_SIZE = parseFloat(ask1.size) + parseFloat(ask2.size) + parseFloat(ask3.size)
  const TAKE_VALUE = parseFloat(ask1.filledValue) + parseFloat(ask2.filledValue) + parseFloat(ask3.filledValue)
  const result = new Result('BTC', newBid('10', '20'), makers)

  t.equal(result.filled, ''+TAKE_SIZE)
  t.equal(result.filledValue, ''+TAKE_VALUE)
  t.equal(result.makers.length, 3)
})

test('result - bid makers', (t) => {
  t.plan(3)
  const bid1 = newBid('12', '1')
  const bid2 = newBid('10', '3')
  const bid3 = newBid('10', '2')
  const makers = [bid1, bid2, bid3]

  bid1.takeSize(bid1.size)
  bid2.takeSize(bid2.size)
  bid3.takeSize(bid3.size)

  const TAKE_SIZE = parseFloat(bid1.size) + parseFloat(bid2.size) + parseFloat(bid3.size)
  const TAKE_VALUE = parseFloat(bid1.filledValue) + parseFloat(bid2.filledValue) + parseFloat(bid3.filledValue)
  const result = new Result('BTC', newBid('10', '20'), makers)

  t.equal(result.filled, ''+TAKE_SIZE)
  t.equal(result.filledValue, ''+TAKE_VALUE)
  t.equal(result.makers.length, 3)
})
