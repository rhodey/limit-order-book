var test         = require('tape');
var newAsk       = require('./util.js').newAsk;
var newMarketAsk = require('./util.js').newMarketAsk;
var newBid       = require('./util.js').newBid;
var newMarketBid = require('./util.js').newMarketBid;
var LimitQueue   = require('../lib/limit-queue.js');


test('testLimitQueue-addPeekRemoveClearAsks', function (t) {
  t.plan(17);
  var asks = new LimitQueue("ask");

  asks.addOrder(newAsk(10, 1, "00"));
  asks.addOrder(newAsk(10, 2, "01"));
  asks.addOrder(newAsk(20, 2, "02"));
  asks.addOrder(newAsk(5,  2, "03"));

  var bestAsk = asks.peek();
  t.ok(bestAsk !== undefined);
  t.equal(bestAsk.price,  5);
  t.equal(bestAsk.volume, 2);
  t.ok(asks.removeOrder(5, "03") !== undefined);

  var bestAsk = asks.peek();
  t.ok(bestAsk !== undefined);
  t.equal(bestAsk.price,  10);
  t.equal(bestAsk.volume,  3);
  t.ok(asks.removeOrder(10, "01") !== undefined);

  var bestAsk = asks.peek();
  t.ok(bestAsk !== undefined);
  t.equal(bestAsk.price,  10);
  t.equal(bestAsk.volume,  1);
  t.ok(asks.removeOrder(20, "02") !== undefined);

  var bestAsk = asks.peek();
  t.ok(bestAsk !== undefined);
  t.equal(bestAsk.price,  10);
  t.equal(bestAsk.volume,  1);

  asks.clear();
  t.ok(asks.removeOrder(10, "00") === undefined);
  t.ok(asks.peek()                === undefined);
});

test('testLimitQueue-addPeekRemoveClearBids', function (t) {
  t.plan(17);
  var bids = new LimitQueue("bid");

  bids.addOrder(newBid(10, 1, "00"));
  bids.addOrder(newBid(10, 2, "01"));
  bids.addOrder(newBid(20, 2, "02"));
  bids.addOrder(newBid(5,  2, "03"));

  var bestBid = bids.peek();
  t.ok(bestBid !== undefined);
  t.equal(bestBid.price,  20);
  t.equal(bestBid.volume,  2);
  t.ok(bids.removeOrder(20, "02") !== undefined);

  var bestBid = bids.peek();
  t.ok(bestBid !== undefined);
  t.equal(bestBid.price,  10);
  t.equal(bestBid.volume,  3);
  t.ok(bids.removeOrder(10, "01") !== undefined);

  var bestBid = bids.peek();
  t.ok(bestBid !== undefined);
  t.equal(bestBid.price,  10);
  t.equal(bestBid.volume,  1);
  t.ok(bids.removeOrder(10, "00") !== undefined);

  var bestBid = bids.peek();
  t.ok(bestBid !== undefined);
  t.equal(bestBid.price,  5);
  t.equal(bestBid.volume, 2);

  bids.clear();
  t.ok(bids.removeOrder(5, "03") === undefined);
  t.ok(bids.peek()               === undefined);
});

test('testLimitQueue-removeAskLiquidity', function (t) {
  t.plan(17);
  var asks = new LimitQueue("ask");
  var bid  = newBid(15, 5);

  asks.addOrder(newAsk(10, 1));
  asks.addOrder(newAsk(10, 2));
  asks.addOrder(newAsk(20, 2));
  asks.addOrder(newAsk(5,  2));

  var makers = asks.takeLiquidityFromBestLimit(bid);
  t.equal(bid.sizeRemaining,       3);
  t.equal(makers.length,           1);
  t.equal(makers[0].price,         5);
  t.equal(makers[0].sizeRemaining, 0);

  makers = asks.takeLiquidityFromBestLimit(bid);
  t.equal(bid.sizeRemaining,        0);
  t.equal(makers.length,            2);
  t.equal(makers[0].price,         10);
  t.equal(makers[0].sizeRemaining,  0);
  t.equal(makers[1].price,         10);
  t.equal(makers[1].sizeRemaining,  0);

  makers = asks.takeLiquidityFromBestLimit(bid);
  t.equal(makers.length, 0);

  bid    = newBid(20, 3);
  makers = asks.takeLiquidityFromBestLimit(bid);
  t.equal(bid.sizeRemaining,        1);
  t.equal(makers.length,            1);
  t.equal(makers[0].price,         20);
  t.equal(makers[0].sizeRemaining,  0);

  makers = asks.takeLiquidityFromBestLimit(bid);
  t.equal(makers.length, 0);
  t.ok(asks.peek() === undefined);
});

test('testLimitQueue-removeBidLiquidity', function (t) {
  t.plan(18);
  var bids = new LimitQueue("bid");
  var ask  = newAsk(15, 5);

  bids.addOrder(newBid(10, 1));
  bids.addOrder(newBid(10, 2));
  bids.addOrder(newBid(20, 2));
  bids.addOrder(newBid(5,  2));

  var makers = bids.takeLiquidityFromBestLimit(ask);
  t.equal(ask.sizeRemaining,        3);
  t.equal(makers.length,            1);
  t.equal(makers[0].price,         20);
  t.equal(makers[0].sizeRemaining,  0);

  makers = bids.takeLiquidityFromBestLimit(ask);
  t.equal(ask.sizeRemaining, 3);
  t.equal(makers.length,     0);

  ask    = newAsk(5, 5);
  makers = bids.takeLiquidityFromBestLimit(ask);
  t.equal(ask.sizeRemaining,        2);
  t.equal(makers.length,            2);
  t.equal(makers[0].price,         10);
  t.equal(makers[0].sizeRemaining,  0);
  t.equal(makers[1].price,         10);
  t.equal(makers[1].sizeRemaining,  0);

  makers = bids.takeLiquidityFromBestLimit(ask);
  t.equal(ask.sizeRemaining,       0);
  t.equal(makers.length,           1);
  t.equal(makers[0].price,         5);
  t.equal(makers[0].sizeRemaining, 0);

  makers = bids.takeLiquidityFromBestLimit(ask);
  t.equal(makers.length, 0);
  t.ok(bids.peek() === undefined);
});

test('testLimitQueue-removeAskLiquidityWithMarketBids', function (t) {
  t.plan(18);
  var asks = new LimitQueue("ask");
  var bid  = newMarketBid(5, -1);

  asks.addOrder(newAsk(10, 1));
  asks.addOrder(newAsk(10, 2));
  asks.addOrder(newAsk(20, 2));
  asks.addOrder(newAsk(5,  2));

  var makers = asks.takeLiquidityFromBestLimit(bid);
  t.equal(bid.volumeRemoved,       2);
  t.equal(makers.length,           1);
  t.equal(makers[0].price,         5);
  t.equal(makers[0].sizeRemaining, 0);

  makers = asks.takeLiquidityFromBestLimit(bid);
  t.equal(bid.volumeRemoved,        5);
  t.equal(makers.length,            2);
  t.equal(makers[0].price,         10);
  t.equal(makers[0].sizeRemaining,  0);
  t.equal(makers[1].price,         10);
  t.equal(makers[1].sizeRemaining,  0);

  makers = asks.takeLiquidityFromBestLimit(bid);
  t.equal(makers.length, 0);

  bid    = newMarketBid(3, -1);
  makers = asks.takeLiquidityFromBestLimit(bid);
  t.equal(bid.volumeRemoved,        2);
  t.equal(bid.sizeRemaining,        1);
  t.equal(makers.length,            1);
  t.equal(makers[0].price,         20);
  t.equal(makers[0].sizeRemaining,  0);

  makers = asks.takeLiquidityFromBestLimit(bid);
  t.equal(makers.length, 0);
  t.ok(asks.peek() === undefined);
});

test('testLimitQueue-removeBidLiquidityWithMarketAsks', function (t) {
  t.plan(19);
  var bids = new LimitQueue("bid");
  var ask  = newMarketAsk(5, -1);

  bids.addOrder(newBid(10, 1));
  bids.addOrder(newBid(10, 2));
  bids.addOrder(newBid(20, 2));
  bids.addOrder(newBid(5,  2));

  var makers = bids.takeLiquidityFromBestLimit(ask);
  t.equal(ask.volumeRemoved,        2);
  t.equal(makers.length,            1);
  t.equal(makers[0].price,         20);
  t.equal(makers[0].sizeRemaining,  0);

  makers = bids.takeLiquidityFromBestLimit(ask);
  t.equal(ask.volumeRemoved,        5);
  t.equal(ask.sizeRemaining,        0);
  t.equal(makers.length,            2);
  t.equal(makers[0].price,         10);
  t.equal(makers[0].sizeRemaining,  0);
  t.equal(makers[1].price,         10);
  t.equal(makers[1].sizeRemaining,  0);

  makers = bids.takeLiquidityFromBestLimit(ask);
  t.equal(makers.length, 0);

  ask    = newMarketAsk(3, -1);
  makers = bids.takeLiquidityFromBestLimit(ask);
  t.equal(ask.volumeRemoved,       2);
  t.equal(ask.sizeRemaining,       1);
  t.equal(makers.length,           1);
  t.equal(makers[0].price,         5);
  t.equal(makers[0].sizeRemaining, 0);

  makers = bids.takeLiquidityFromBestLimit(ask);
  t.equal(makers.length, 0);
  t.ok(bids.peek() === undefined);
});
