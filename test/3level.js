const test = require('tape')
const util = require('./util.js')
const Level = require('../lib/level.js')

const newOrder = (orderId, size) => util.newBid('1', size, orderId)

const newMarketOrder = (orderId, size, funds) => util.newMarketBid(size, funds, orderId)

test('level - add remove clear volume', (t) => {
  t.plan(8)
  const level = new Level('1')

  t.equal(level.price, '1')
  t.equal(level.volume, '0')

  level.add(newOrder('00', '10'))
  t.equal(level.volume, '10')

  level.add(newOrder('01', '20'))
  t.equal(level.volume, '30')

  level.remove('00')
  t.ok(!level.remove('00'))
  t.equal(level.volume, '20')

  level.clear()
  t.ok(!level.remove('01'))
  t.equal(level.volume, '0')
})

test('level - taker with no maker', (t) => {
  t.plan(2)
  const level = new Level('1')
  const taker = newOrder('00', '10')
  const makers = level.takeSize(taker)

  t.equal(taker.sizeRemaining, '10')
  t.equal(makers.length, 0)
})

test('level - market taker with no maker', (t) => {
  t.plan(2)
  const level = new Level('1')
  const taker = newMarketOrder('00', '10', '20')
  const makers = level.takeSize(taker)

  t.equal(taker.filled, '0')
  t.equal(makers.length, 0)
})

test('level - one full take one full make', (t) => {
  t.plan(4)
  const level = new Level('1')

  level.add(newOrder('00', '10'))

  const taker = newOrder('01', '10')
  const makers = level.takeSize(taker)

  t.equal(taker.sizeRemaining, '0')
  t.equal(makers.length, 1)
  t.equal(makers[0].sizeRemaining, '0')
  t.equal(level.volume, '0')
})

test('level - one full market size take one full make', (t) => {
  t.plan(4)
  const level = new Level('1')

  level.add(newOrder('00', '10'))

  const taker = newMarketOrder('01', '10', '0')
  const makers = level.takeSize(taker)

  t.equal(taker.filled, '10')
  t.equal(makers.length, 1)
  t.equal(makers[0].sizeRemaining, '0')
  t.equal(level.volume, '0')
})

test('level - one full market funds take one full make', (t) => {
  t.plan(4)
  const level = new Level('1')

  level.add(newOrder('00', '10'))

  const taker = newMarketOrder('01', '0', '10')
  const makers = level.takeSize(taker)

  t.equal(taker.filled, '10')
  t.equal(makers.length, 1)
  t.equal(makers[0].sizeRemaining, '0')
  t.equal(level.volume, '0')
})

test('level - one full market size and funds take one full make', (t) => {
  t.plan(4)
  const level = new Level('1')

  level.add(newOrder('00', '12'))

  const taker = newMarketOrder('01', '12', '20')
  const makers = level.takeSize(taker)

  t.equal(taker.filled,'12')
  t.equal(makers.length, 1)
  t.equal(makers[0].sizeRemaining, '0')
  t.equal(level.volume, '0')
})

test('level - full take partial make', (t) => {
  t.plan(4)
  const level = new Level('1')

  level.add(newOrder('00', '10'))

  const taker = newOrder('01', '8')
  const makers = level.takeSize(taker)

  t.equal(taker.sizeRemaining, '0')
  t.equal(makers.length, 1)
  t.equal(makers[0].sizeRemaining, '2')
  t.equal(level.volume, '2')
})

test('level - full market size take partial make', (t) => {
  t.plan(4)
  const level = new Level('1')

  level.add(newOrder('00', '10'))

  const taker = newMarketOrder('01', '8', '0')
  const makers = level.takeSize(taker)

  t.equal(taker.filled, '8')
  t.equal(makers.length, 1)
  t.equal(makers[0].sizeRemaining, '2')
  t.equal(level.volume, '2')
})

test('level - full market funds take partial make', (t) => {
  t.plan(4)
  const level = new Level('1')

  level.add(newOrder('00', '10'))

  const taker = newMarketOrder('01', '0', '8')
  const makers = level.takeSize(taker)

  t.equal(taker.filled, '8')
  t.equal(makers.length, 1)
  t.equal(makers[0].sizeRemaining, '2')
  t.equal(level.volume, '2')
})

test('level - full market size and funds take partial make', (t) => {
  t.plan(4)
  const level = new Level('1')

  level.add(newOrder('00', '10'))

  const taker = newMarketOrder('01', '10', '8')
  const makers = level.takeSize(taker)

  t.equal(taker.filled, '8')
  t.equal(makers.length, 1)
  t.equal(makers[0].sizeRemaining, '2')
  t.equal(level.volume, '2')
})

test('level - one full take one partial take', (t) => {
  t.plan(8)
  const level = new Level('1')

  level.add(newOrder('00', '10'))

  const taker1 = newOrder('01', '8')
  const makers1 = level.takeSize(taker1)

  t.equal(taker1.sizeRemaining, '0')
  t.equal(makers1.length, 1)
  t.equal(makers1[0].sizeRemaining, '2')
  t.equal(level.volume, '2')

  const taker2 = newOrder('02', '4')
  const makers2 = level.takeSize(taker2)

  t.equal(taker2.sizeRemaining, '2')
  t.equal(makers2.length, 1)
  t.equal(makers2[0].sizeRemaining, '0')
  t.equal(level.volume, '0')
})

test('level - two full makes one full take', (t) => {
  t.plan(5)
  const level = new Level('1')

  level.add(newOrder('00', '10'))
  level.add(newOrder('01', '30'))

  const taker = newOrder('02', '40')
  const makers = level.takeSize(taker)

  t.equal(taker.sizeRemaining, '0')
  t.equal(makers.length, 2)
  t.equal(makers[0].sizeRemaining, '0')
  t.equal(makers[1].sizeRemaining, '0')
  t.equal(level.volume, '0')
})

test('level - one full make one partial make one full take', (t) => {
  t.plan(5)
  const level = new Level('1')

  level.add(newOrder('00', '10'))
  level.add(newOrder('01', '30'))

  const taker = newOrder('02', '30')
  const makers = level.takeSize(taker)

  t.equal(taker.sizeRemaining, '0')
  t.equal(makers.length, 2)
  t.equal(makers[0].sizeRemaining, '0')
  t.equal(makers[1].sizeRemaining, '10')
  t.equal(level.volume, '10')
})
