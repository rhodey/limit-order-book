const test = require('tape')
const { LimitOrder, MarketOrder } = require('../lib/orders.js')

test('limit order', (t) => {
  t.plan(20)
  const o = new LimitOrder('hi', 'bid', '10', '20')

  t.equal(o.orderId, 'hi')
  t.equal(o.side, 'bid')
  t.equal(o.price, '10')
  t.equal(o.size, '20')
  t.equal(o.sizeRemaining, '20')
  t.equal(o.filled, '0')
  t.equal(o.filledValue, '0')

  t.equal(o.takeSize('5'), '5')
  t.equal(o.filled, '5')
  t.equal(o.filledValue, ''+(5*o.price))
  t.equal(o.sizeRemaining, '15')

  o.clearFilled()
  t.equal(o.filled, '0')
  t.equal(o.filledValue, '0')
  t.equal(o.sizeRemaining, '15')

  t.equal(o.takeSize('20'), '15')
  t.equal(o.filled, '15')
  t.equal(o.filledValue, ''+(15*o.price))
  t.equal(o.sizeRemaining, '0')

  o.clearFilled()
  t.equal(o.filled, '0')
  t.equal(o.filledValue, '0')
})

test('market order - with size', (t) => {
  t.plan(20)
  const o = new MarketOrder('hi', 'bid', '100', '0')

  t.equal(o.orderId, 'hi')
  t.equal(o.side, 'bid')
  t.equal(o.price, '0')
  t.equal(o.size, '100')
  t.equal(o.sizeRemaining, '100')
  t.equal(o.funds, '0')
  t.equal(o.fundsRemaining, '0')
  t.equal(o.filled, '0')
  t.equal(o.filledValue, '0')
  t.equal(o.getSizeFor('1337'), '100')

  o.subtract('75', '1337')
  t.equal(o.filled, '75')
  t.equal(o.filledValue, ''+(75*1337))
  t.equal(o.sizeRemaining, '25')
  t.equal(o.fundsRemaining, '0')
  t.equal(o.getSizeFor('1337'), '25')

  o.subtract('25', '1337')
  t.equal(o.filled, '100')
  t.equal(o.filledValue, ''+(100*1337))
  t.equal(o.sizeRemaining, '0')
  t.equal(o.fundsRemaining, '0')
  t.equal(o.getSizeFor('1337'), '0')
})

test('market order - with funds', (t) => {
  t.plan(20)
  const o = new MarketOrder('hi', 'bid', '0', '100')

  t.equal(o.orderId, 'hi')
  t.equal(o.side, 'bid')
  t.equal(o.price, '0')
  t.equal(o.size, '0')
  t.equal(o.sizeRemaining, '0')
  t.equal(o.funds, '100')
  t.equal(o.fundsRemaining, '100')
  t.equal(o.filled, '0')
  t.equal(o.filledValue, '0')
  t.equal(o.getSizeFor(25), '4')

  o.subtract('3', '25')
  t.equal(o.filled, '3')
  t.equal(o.filledValue, ''+(3*25))
  t.equal(o.sizeRemaining, '0')
  t.equal(o.fundsRemaining, '25')
  t.equal(o.getSizeFor('25'), '1')

  o.subtract('1', '25')
  t.equal(o.filled, '4')
  t.equal(o.filledValue, ''+(4*25))
  t.equal(o.sizeRemaining, '0')
  t.equal(o.fundsRemaining, '0')
  t.equal(o.getSizeFor('1'), '0')
})

test('market order - with size and funds', (t) => {
  t.plan(26)
  const o = new MarketOrder('hi', 'bid', '100', '50')

  t.equal(o.orderId, 'hi')
  t.equal(o.side, 'bid')
  t.equal(o.price, '0')
  t.equal(o.size, '100')
  t.equal(o.sizeRemaining, '100')
  t.equal(o.funds, '50')
  t.equal(o.fundsRemaining, '50')
  t.equal(o.filled, '0')
  t.equal(o.filledValue, '0')

  t.equal(o.getSizeFor('1'), '50')
  t.equal(o.getSizeFor('5'), ''+(50/5))

  o.subtract('25', '1')
  t.equal(o.filled, '25')
  t.equal(o.filledValue, '25')
  t.equal(o.sizeRemaining, '75')
  t.equal(o.fundsRemaining, '25')
  t.equal(o.getSizeFor('5'), ''+(25/5))

  o.subtract('10', '2')
  t.equal(o.filled, ''+(25+10))
  t.equal(o.filledValue, ''+(25+(10*2)))
  t.equal(o.sizeRemaining, ''+(100-(25+10)))
  t.equal(o.fundsRemaining, ''+(50-(25+(10*2))))
  t.equal(o.getSizeFor('1'), '5')

  o.subtract('5', '1')
  t.equal(o.filled, ''+(25+10+5))
  t.equal(o.filledValue, ''+(25+(10*2)+5))
  t.equal(o.sizeRemaining, ''+(100-(25+10+5)))
  t.equal(o.fundsRemaining, '0')
  t.equal(o.getSizeFor('1'), '0')
})

test('limit order - reduce', (t) => {
  t.plan(23)
  const o = new LimitOrder('hi', 'bid', '10', '20')

  t.equal(o.size, '20')
  t.equal(o.sizeRemaining, '20')

  t.equal(o.reduce('25'), '0')
  t.equal(o.size, '20')
  t.equal(o.sizeRemaining, '20')

  t.equal(o.reduce('20'), '0')
  t.equal(o.size, '20')
  t.equal(o.sizeRemaining, '20')

  t.equal(o.reduce('15'), '5')
  t.equal(o.size, '15')
  t.equal(o.sizeRemaining, '15')

  t.equal(o.takeSize('5'), '5')
  t.equal(o.size, '15')
  t.equal(o.sizeRemaining, '10')

  t.equal(o.reduce('9'), '1')
  t.equal(o.size, '9')
  t.equal(o.sizeRemaining, '9')

  t.equal(o.takeSize('5'), '5')
  t.equal(o.size, '9')
  t.equal(o.sizeRemaining, '4')

  t.equal(o.reduce('6'), '0')
  t.equal(o.size, '6')
  t.equal(o.sizeRemaining, '4')
})
