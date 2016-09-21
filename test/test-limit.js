var test  = require('tape');
var util  = require('./util.js');
var Limit = require('../lib/limit.js');


function newOrder(orderId, size) {
  return util.newBid(1020, size, orderId);
}

function newMarketOrder(orderId, size, funds) {
  return util.newMarketBid(size, funds, orderId);
}


test('testLimit-addRemoveClearVolume', function (t) {
  t.plan(7);
  var limit = new Limit(1020);

  t.equal(limit.price, 1020);
  t.equal(limit.volume,   0);

  limit.add(newOrder("00", 10));
  t.equal(limit.volume, 10);

  limit.add(newOrder("01", 20));
  t.equal(limit.volume, 30);

  limit.remove("00");
  t.equal(limit.volume, 20);

  limit.clear();
  t.ok(limit.remove("01") === undefined);
  t.equal(limit.volume, 0);
});

test('testLimit-takerWithNoMaker', function (t) {
  t.plan(2);
  var limit  = new Limit(1020);
  var taker  = newOrder("00", 10);
  var makers = limit.takeLiquidity(taker);

  t.equal(taker.sizeRemaining, 10);
  t.equal(makers.length,        0);
});

test('testLimit-marketTakerWithNoMaker', function (t) {
  t.plan(2);
  var limit  = new Limit(1020);
  var taker  = newMarketOrder("00", 10, 20);
  var makers = limit.takeLiquidity(taker);

  t.equal(taker.volumeRemoved, 0);
  t.equal(makers.length,       0);
});

test('testLimit-oneFullTakeOneFullMake', function (t) {
  t.plan(4);
  var limit = new Limit(1020);

  limit.add(newOrder("00", 10));

  var taker  = newOrder("01", 10);
  var makers = limit.takeLiquidity(taker);

  t.equal(taker.sizeRemaining,     0);
  t.equal(makers.length,           1);
  t.equal(makers[0].sizeRemaining, 0);
  t.equal(limit.volume,            0);
});

test('testLimit-oneFullMarketSizeTakeOneFullMake', function (t) {
  t.plan(4);
  var limit = new Limit(1020);

  limit.add(newOrder("00", 10));

  var taker  = newMarketOrder("01", 10, -1);
  var makers = limit.takeLiquidity(taker);

  t.equal(taker.volumeRemoved,    10);
  t.equal(makers.length,           1);
  t.equal(makers[0].sizeRemaining, 0);
  t.equal(limit.volume,            0);
});

test('testLimit-oneFullMarketFundsTakeOneFullMake', function (t) {
  t.plan(4);
  var limit = new Limit(1);

  limit.add(newOrder("00", 10));

  var taker  = newMarketOrder("01", -1, 10);
  var makers = limit.takeLiquidity(taker);

  t.equal(taker.volumeRemoved,    10);
  t.equal(makers.length,           1);
  t.equal(makers[0].sizeRemaining, 0);
  t.equal(limit.volume,            0);
});

test('testLimit-oneFullMarketSizeFundsTakeOneFullMake', function (t) {
  t.plan(4);
  var limit = new Limit(1);

  limit.add(newOrder("00", 12));

  var taker  = newMarketOrder("01", 12, 20);
  var makers = limit.takeLiquidity(taker);

  t.equal(taker.volumeRemoved,    12);
  t.equal(makers.length,           1);
  t.equal(makers[0].sizeRemaining, 0);
  t.equal(limit.volume,            0);
});

test('testLimit-fullTakePartialMake', function (t) {
  t.plan(4);
  var limit = new Limit(1020);

  limit.add(newOrder("00", 10));

  var taker  = newOrder("01", 8);
  var makers = limit.takeLiquidity(taker);

  t.equal(taker.sizeRemaining,     0);
  t.equal(makers.length,           1);
  t.equal(makers[0].sizeRemaining, 2);
  t.equal(limit.volume,            2);
});

test('testLimit-fullMarketSizeTakePartialMake', function (t) {
  t.plan(4);
  var limit = new Limit(1020);

  limit.add(newOrder("00", 10));

  var taker  = newMarketOrder("01", 8, -1);
  var makers = limit.takeLiquidity(taker);

  t.equal(taker.volumeRemoved,     8);
  t.equal(makers.length,           1);
  t.equal(makers[0].sizeRemaining, 2);
  t.equal(limit.volume,            2);
});

test('testLimit-fullMarketFundsTakePartialMake', function (t) {
  t.plan(4);
  var limit = new Limit(1);

  limit.add(newOrder("00", 10));

  var taker  = newMarketOrder("01", -1, 8);
  var makers = limit.takeLiquidity(taker);

  t.equal(taker.volumeRemoved,     8);
  t.equal(makers.length,           1);
  t.equal(makers[0].sizeRemaining, 2);
  t.equal(limit.volume,            2);
});

test('testLimit-fullMarketSizeFundsTakePartialMake', function (t) {
  t.plan(4);
  var limit = new Limit(1);

  limit.add(newOrder("00", 10));

  var taker  = newMarketOrder("01", 10, 8);
  var makers = limit.takeLiquidity(taker);

  t.equal(taker.volumeRemoved,     8);
  t.equal(makers.length,           1);
  t.equal(makers[0].sizeRemaining, 2);
  t.equal(limit.volume,            2);
});

test('testLimit-oneFullTakeOnePartialTake', function (t) {
  t.plan(8);
  var limit = new Limit(1020);

  limit.add(newOrder("00", 10));

  var taker1  = newOrder("01", 8);
  var makers1 = limit.takeLiquidity(taker1);

  t.equal(taker1.sizeRemaining,     0);
  t.equal(makers1.length,           1);
  t.equal(makers1[0].sizeRemaining, 2);
  t.equal(limit.volume,             2);

  var taker2  = newOrder("02", 4);
  var makers2 = limit.takeLiquidity(taker2);

  t.equal(taker2.sizeRemaining,     2);
  t.equal(makers2.length,           1);
  t.equal(makers2[0].sizeRemaining, 0);
  t.equal(limit.volume,             0);
});

test('testLimit-twoFullMakesOneFullTake', function (t) {
  t.plan(5);
  var limit = new Limit(1);

  limit.add(newOrder("00", 10));
  limit.add(newOrder("01", 30));

  var taker  = newOrder("02", 40);
  var makers = limit.takeLiquidity(taker);

  t.equal(taker.sizeRemaining,     0);
  t.equal(makers.length,           2);
  t.equal(makers[0].sizeRemaining, 0);
  t.equal(makers[1].sizeRemaining, 0);
  t.equal(limit.volume,            0);
});

test('testLimit-oneFullMakeOnePartialMakeOneFullTake', function (t) {
  t.plan(5);
  var limit = new Limit(1);

  limit.add(newOrder("00", 10));
  limit.add(newOrder("01", 30));

  var taker  = newOrder("02", 30);
  var makers = limit.takeLiquidity(taker);

  t.equal(taker.sizeRemaining,      0);
  t.equal(makers.length,            2);
  t.equal(makers[0].sizeRemaining,  0);
  t.equal(makers[1].sizeRemaining, 10);
  t.equal(limit.volume,            10);
});
