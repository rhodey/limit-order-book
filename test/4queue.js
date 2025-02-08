const test = require('tape')
const LevelQueue = require('../lib/queue.js')
const { newAsk, newMarketAsk } = require('./util.js')
const { newBid, newMarketBid } = require('./util.js')

test('level queue - add peek remove clear asks', (t) => {
  t.plan(17)
  const asks = new LevelQueue('ask')

  asks.add(newAsk('10', '1', '00'))
  asks.add(newAsk('10', '2', '01'))
  asks.add(newAsk('20', '2', '02'))
  asks.add(newAsk('5',  '2', '03'))

  let bestAsk = asks.peek()
  t.ok(bestAsk)
  t.equal(bestAsk.price, '5')
  t.equal(bestAsk.volume, '2')
  t.ok(asks.remove('5', '03'))

  bestAsk = asks.peek()
  t.ok(bestAsk)
  t.equal(bestAsk.price, '10')
  t.equal(bestAsk.volume, '3')
  t.ok(asks.remove('10', '01'))

  bestAsk = asks.peek()
  t.ok(bestAsk)
  t.equal(bestAsk.price, '10')
  t.equal(bestAsk.volume, '1')
  t.ok(asks.remove('20', '02'))

  bestAsk = asks.peek()
  t.ok(bestAsk)
  t.equal(bestAsk.price, '10')
  t.equal(bestAsk.volume, '1')

  asks.clear()
  t.ok(!asks.remove('10', '00'))
  t.ok(!asks.peek())
})

test('level queue - add peek remove clear bids', (t) => {
  t.plan(17)
  const bids = new LevelQueue('bid')

  bids.add(newBid('10', '1', '00'))
  bids.add(newBid('10', '2', '01'))
  bids.add(newBid('20', '2', '02'))
  bids.add(newBid('5',  '2', '03'))

  let bestBid = bids.peek()
  t.ok(bestBid)
  t.equal(bestBid.price, '20')
  t.equal(bestBid.volume, '2')
  t.ok(bids.remove('20', '02'))

  bestBid = bids.peek()
  t.ok(bestBid)
  t.equal(bestBid.price, '10')
  t.equal(bestBid.volume, '3')
  t.ok(bids.remove('10', '01'))

  bestBid = bids.peek()
  t.ok(bestBid)
  t.equal(bestBid.price, '10')
  t.equal(bestBid.volume, '1')
  t.ok(bids.remove('10', '00'))

  bestBid = bids.peek()
  t.ok(bestBid)
  t.equal(bestBid.price, '5')
  t.equal(bestBid.volume, '2')

  bids.clear()
  t.ok(!bids.remove('5', '03'))
  t.ok(!bids.peek())
})

test('level queue - remove ask size', (t) => {
  t.plan(17)
  const asks = new LevelQueue('ask')
  let bid = newBid('15', '5')

  asks.add(newAsk('10', '1'))
  asks.add(newAsk('10', '2'))
  asks.add(newAsk('20', '2'))
  asks.add(newAsk('5',  '2'))

  let makers = asks.takeSizeFromBestLevel(bid)
  t.equal(bid.sizeRemaining, '3')
  t.equal(makers.length, 1)
  t.equal(makers[0].price, '5')
  t.equal(makers[0].sizeRemaining, '0')

  makers = asks.takeSizeFromBestLevel(bid)
  t.equal(bid.sizeRemaining, '0')
  t.equal(makers.length, 2)
  t.equal(makers[0].price, '10')
  t.equal(makers[0].sizeRemaining, '0')
  t.equal(makers[1].price, '10')
  t.equal(makers[1].sizeRemaining, '0')

  makers = asks.takeSizeFromBestLevel(bid)
  t.equal(makers.length, 0)

  bid = newBid('20', '3')
  makers = asks.takeSizeFromBestLevel(bid)
  t.equal(bid.sizeRemaining, '1')
  t.equal(makers.length, 1)
  t.equal(makers[0].price, '20')
  t.equal(makers[0].sizeRemaining, '0')

  makers = asks.takeSizeFromBestLevel(bid)
  t.equal(makers.length, 0)
  t.ok(!asks.peek())
})

test('level queue - remove bid size', (t) => {
  t.plan(18)
  const bids = new LevelQueue('bid')
  let ask = newAsk('15', '5')

  bids.add(newBid('10', '1'))
  bids.add(newBid('10', '2'))
  bids.add(newBid('20', '2'))
  bids.add(newBid('5',  '2'))

  let makers = bids.takeSizeFromBestLevel(ask)
  t.equal(ask.sizeRemaining, '3')
  t.equal(makers.length, 1)
  t.equal(makers[0].price, '20')
  t.equal(makers[0].sizeRemaining, '0')

  makers = bids.takeSizeFromBestLevel(ask)
  t.equal(ask.sizeRemaining, '3')
  t.equal(makers.length, 0)

  ask = newAsk('5', '5')
  makers = bids.takeSizeFromBestLevel(ask)
  t.equal(ask.sizeRemaining, '2')
  t.equal(makers.length, 2)
  t.equal(makers[0].price, '10')
  t.equal(makers[0].sizeRemaining, '0')
  t.equal(makers[1].price, '10')
  t.equal(makers[1].sizeRemaining, '0')

  makers = bids.takeSizeFromBestLevel(ask)
  t.equal(ask.sizeRemaining, '0')
  t.equal(makers.length, 1)
  t.equal(makers[0].price, '5')
  t.equal(makers[0].sizeRemaining, '0')

  makers = bids.takeSizeFromBestLevel(ask)
  t.equal(makers.length, 0)
  t.ok(!bids.peek())
})

test('level queue - remove ask size with market bids', (t) => {
  t.plan(18)
  const asks = new LevelQueue('ask')
  let bid = newMarketBid('5', '0')

  asks.add(newAsk('10', '1'))
  asks.add(newAsk('10', '2'))
  asks.add(newAsk('20', '2'))
  asks.add(newAsk('5',  '2'))

  let makers = asks.takeSizeFromBestLevel(bid)
  t.equal(bid.filled, '2')
  t.equal(makers.length, 1)
  t.equal(makers[0].price, '5')
  t.equal(makers[0].sizeRemaining, '0')

  makers = asks.takeSizeFromBestLevel(bid)
  t.equal(bid.filled, '5')
  t.equal(makers.length, 2)
  t.equal(makers[0].price, '10')
  t.equal(makers[0].sizeRemaining, '0')
  t.equal(makers[1].price, '10')
  t.equal(makers[1].sizeRemaining,'0')

  makers = asks.takeSizeFromBestLevel(bid)
  t.equal(makers.length, 0)

  bid = newMarketBid('3', '0')
  makers = asks.takeSizeFromBestLevel(bid)
  t.equal(bid.filled, '2')
  t.equal(bid.sizeRemaining, '1')
  t.equal(makers.length, 1)
  t.equal(makers[0].price, '20')
  t.equal(makers[0].sizeRemaining, '0')

  makers = asks.takeSizeFromBestLevel(bid)
  t.equal(makers.length, 0)
  t.ok(!asks.peek())
})

test('level queue - remove bid size with market asks', (t) => {
  t.plan(19)
  const bids = new LevelQueue('bid')
  let ask = newMarketAsk('5', '0')

  bids.add(newBid('10', '1'))
  bids.add(newBid('10', '2'))
  bids.add(newBid('20', '2'))
  bids.add(newBid('5',  '2'))

  let makers = bids.takeSizeFromBestLevel(ask)
  t.equal(ask.filled, '2')
  t.equal(makers.length, 1)
  t.equal(makers[0].price, '20')
  t.equal(makers[0].sizeRemaining, '0')

  makers = bids.takeSizeFromBestLevel(ask)
  t.equal(ask.filled, '5')
  t.equal(ask.sizeRemaining, '0')
  t.equal(makers.length, 2)
  t.equal(makers[0].price, '10')
  t.equal(makers[0].sizeRemaining, '0')
  t.equal(makers[1].price, '10')
  t.equal(makers[1].sizeRemaining, '0')

  makers = bids.takeSizeFromBestLevel(ask)
  t.equal(makers.length, 0)

  ask = newMarketAsk('3', '0')
  makers = bids.takeSizeFromBestLevel(ask)
  t.equal(ask.filled, '2')
  t.equal(ask.sizeRemaining, '1')
  t.equal(makers.length, 1)
  t.equal(makers[0].price, '5')
  t.equal(makers[0].sizeRemaining, '0')

  makers = bids.takeSizeFromBestLevel(ask)
  t.equal(makers.length, 0)
  t.ok(!bids.peek())
})
