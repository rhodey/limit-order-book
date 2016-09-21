var test           = require('tape');
var newAsk         = require('./util.js').newAsk;
var newMarketAsk   = require('./util.js').newMarketAsk;
var newBid         = require('./util.js').newBid;
var newMarketBid   = require('./util.js').newMarketBid;
var LimitOrderBook = require('../lib/limit-order-book.js');


test('testLimitOrderBook-addRemoveClearAsk', function (t) {
  t.plan(2);
  var book = new LimitOrderBook();

  book.add(newAsk(10, 20, "00"));
  book.add(newAsk(30, 40, "01"));

  t.ok(book.remove("ask", 10, "00") !== undefined);
  book.clear();
  t.ok(book.remove("ask", 30, "01") === undefined);
});

test('testLimitOrderBook-addRemoveClearBid', function (t) {
  t.plan(2);
  var book = new LimitOrderBook();

  book.add(newBid(10, 20, "00"));
  book.add(newBid(30, 40, "01"));

  t.ok(book.remove("bid", 10, "00") !== undefined);
  book.clear();
  t.ok(book.remove("bid", 30, "01") === undefined);
});

test('testLimitOrderBook-askWontTakeEmptyBook', function (t) {
  t.plan(3);
  var book   = new LimitOrderBook();
  var result = book.add(newAsk(10, 10));

  t.equal(result.takeSize,      0);
  t.equal(result.takeValue,     0);
  t.equal(result.makers.length, 0);
});

test('testLimitOrderBook-bidWontTakeEmptyBook', function (t) {
  t.plan(3);
  var book   = new LimitOrderBook();
  var result = book.add(newBid(10, 10));

  t.equal(result.takeSize,      0);
  t.equal(result.takeValue,     0);
  t.equal(result.makers.length, 0);
});

test('testLimitOrderBook-marketAskWontTakeEmptyBook', function (t) {
  t.plan(5);
  var book   = new LimitOrderBook();
  var taker  = newMarketAsk(10, 20, "00");
  var result = book.add(taker);

  t.equal(result.takeSize,      0);
  t.equal(result.takeValue,     0);
  t.equal(result.makers.length, 0);

  t.ok(book.remove("ask", 10, "00") === undefined);
  t.ok(book.remove("ask", 20, "00") === undefined);
});

test('testLimitOrderBook-marketBidWontTakeEmptyBook', function (t) {
  t.plan(5);
  var book   = new LimitOrderBook();
  var taker  = newMarketBid(10, 20, "00");
  var result = book.add(taker);

  t.equal(result.takeSize,      0);
  t.equal(result.takeValue,     0);
  t.equal(result.makers.length, 0);

  t.ok(book.remove("bid", 10, "00") === undefined);
  t.ok(book.remove("bid", 20, "00") === undefined);
});

test('testLimitOrderBook-askWontTakeSmallerBid', function (t) {
  t.plan(6);
  var book   = new LimitOrderBook();
  var result = book.add(newBid(8, 10));

  t.equal(result.takeSize,      0);
  t.equal(result.takeValue,     0);
  t.equal(result.makers.length, 0);

  result = book.add(newAsk(9, 10));

  t.equal(result.takeSize,      0);
  t.equal(result.takeValue,     0);
  t.equal(result.makers.length, 0);
});

test('testLimitOrderBook-bidWontTakeLargerAsk', function (t) {
  t.plan(6);
  var book   = new LimitOrderBook();
  var result = book.add(newAsk(8, 10));

  t.equal(result.takeSize,      0);
  t.equal(result.takeValue,     0);
  t.equal(result.makers.length, 0);

  result = book.add(newBid(7, 10));

  t.equal(result.takeSize,      0);
  t.equal(result.takeValue,     0);
  t.equal(result.makers.length, 0);
});

test('testLimitOrderBook-oneAskTakesOneSmallerSizeBid', function (t) {
  t.plan(6);
  var book   = new LimitOrderBook();
  var result = book.add(newBid(10, 5));

  t.equal(result.takeSize,      0);
  t.equal(result.takeValue,     0);
  t.equal(result.makers.length, 0);

  result = book.add(newAsk(10, 20));

  t.equal(result.takeSize,      5);
  t.equal(result.takeValue,     (10 * 5));
  t.equal(result.makers.length, 1);
});

test('testLimitOrderBook-oneAskTakesOneEqualSizeBid', function (t) {
  t.plan(6);
  var book   = new LimitOrderBook();
  var result = book.add(newBid(10, 5));

  t.equal(result.takeSize,      0);
  t.equal(result.takeValue,     0);
  t.equal(result.makers.length, 0);

  result = book.add(newAsk(10, 5));

  t.equal(result.takeSize,      5);
  t.equal(result.takeValue,     (10 * 5));
  t.equal(result.makers.length, 1);
});

test('testLimitOrderBook-oneAskTakesOneLargerSizeBid', function (t) {
  t.plan(6);
  var book   = new LimitOrderBook();
  var result = book.add(newBid(10, 15));

  t.equal(result.takeSize,      0);
  t.equal(result.takeValue,     0);
  t.equal(result.makers.length, 0);

  result = book.add(newAsk(10, 5));

  t.equal(result.takeSize,      5);
  t.equal(result.takeValue,     (10 * 5));
  t.equal(result.makers.length, 1);
});

test('testLimitOrderBook-oneBidTakesOneSmallerSizeAsk', function (t) {
  t.plan(6);
  var book   = new LimitOrderBook();
  var result = book.add(newAsk(10, 5));

  t.equal(result.takeSize,      0);
  t.equal(result.takeValue,     0);
  t.equal(result.makers.length, 0);

  result = book.add(newBid(10, 8));

  t.equal(result.takeSize,      5);
  t.equal(result.takeValue,     (10 * 5));
  t.equal(result.makers.length, 1);
});

test('testLimitOrderBook-oneBidTakesOneEqualSizeAsk', function (t) {
  t.plan(6);
  var book   = new LimitOrderBook();
  var result = book.add(newAsk(10, 5));

  t.equal(result.takeSize,      0);
  t.equal(result.takeValue,     0);
  t.equal(result.makers.length, 0);

  result = book.add(newBid(10, 5));

  t.equal(result.takeSize,      5);
  t.equal(result.takeValue,     (10 * 5));
  t.equal(result.makers.length, 1);
});

test('testLimitOrderBook-oneBidTakesOneLargerSizeAsk', function (t) {
  t.plan(6);
  var book   = new LimitOrderBook();
  var result = book.add(newAsk(10, 5));

  t.equal(result.takeSize,      0);
  t.equal(result.takeValue,     0);
  t.equal(result.makers.length, 0);

  result = book.add(newBid(10, 2));

  t.equal(result.takeSize,      2);
  t.equal(result.takeValue,     (10 * 2));
  t.equal(result.makers.length, 1);
});

test('testLimitOrderBook-oneMarketSizeAskTakesOneSmallerSizeBid', function (t) {
  t.plan(6);
  var book   = new LimitOrderBook();
  var result = book.add(newBid(10, 5));

  t.equal(result.takeSize,      0);
  t.equal(result.takeValue,     0);
  t.equal(result.makers.length, 0);

  result = book.add(newMarketAsk(10, -1));

  t.equal(result.takeSize,      5);
  t.equal(result.takeValue,     (10 * 5));
  t.equal(result.makers.length, 1);
});

test('testLimitOrderBook-oneMarketSizeAskTakesOneEqualSizeBid', function (t) {
  t.plan(6);
  var book   = new LimitOrderBook();
  var result = book.add(newBid(10, 5));

  t.equal(result.takeSize,      0);
  t.equal(result.takeValue,     0);
  t.equal(result.makers.length, 0);

  result = book.add(newMarketAsk(5, -1));

  t.equal(result.takeSize,      5);
  t.equal(result.takeValue,     (10 * 5));
  t.equal(result.makers.length, 1);
});

test('testLimitOrderBook-oneMarketSizeAskTakesOneLargerSizeBid', function (t) {
  t.plan(6);
  var book   = new LimitOrderBook();
  var result = book.add(newBid(10, 8));

  t.equal(result.takeSize,      0);
  t.equal(result.takeValue,     0);
  t.equal(result.makers.length, 0);

  result = book.add(newMarketAsk(5, -1));

  t.equal(result.takeSize,      5);
  t.equal(result.takeValue,     (10 * 5));
  t.equal(result.makers.length, 1);
});

test('testLimitOrderBook-oneMarketFundsAskTakesOneSmallerSizeBid', function (t) {
  t.plan(6);
  var book   = new LimitOrderBook();
  var result = book.add(newBid(1, 5));

  t.equal(result.takeSize,      0);
  t.equal(result.takeValue,     0);
  t.equal(result.makers.length, 0);

  result = book.add(newMarketAsk(-1, 10));

  t.equal(result.takeSize,      5);
  t.equal(result.takeValue,     5);
  t.equal(result.makers.length, 1);
});

test('testLimitOrderBook-oneMarketFundsAskTakesOneEqualSizeBid', function (t) {
  t.plan(6);
  var book   = new LimitOrderBook();
  var result = book.add(newBid(1, 5));

  t.equal(result.takeSize,      0);
  t.equal(result.takeValue,     0);
  t.equal(result.makers.length, 0);

  result = book.add(newMarketAsk(-1, 5));

  t.equal(result.takeSize,      5);
  t.equal(result.takeValue,     5);
  t.equal(result.makers.length, 1);
});

test('testLimitOrderBook-oneMarketFundsAskTakesOneLargerSizeBid', function (t) {
  t.plan(6);
  var book   = new LimitOrderBook();
  var result = book.add(newBid(1, 10));

  t.equal(result.takeSize,      0);
  t.equal(result.takeValue,     0);
  t.equal(result.makers.length, 0);

  result = book.add(newMarketAsk(-1, 5));

  t.equal(result.takeSize,      5);
  t.equal(result.takeValue,     5);
  t.equal(result.makers.length, 1);
});

test('testLimitOrderBook-oneMarketSizeBidTakesOneSmallerSizeAsk', function (t) {
  t.plan(6);
  var book   = new LimitOrderBook();
  var result = book.add(newAsk(10, 5));

  t.equal(result.takeSize,      0);
  t.equal(result.takeValue,     0);
  t.equal(result.makers.length, 0);

  result = book.add(newMarketBid(10, -1));

  t.equal(result.takeSize,      5);
  t.equal(result.takeValue,     (10 * 5));
  t.equal(result.makers.length, 1);
});

test('testLimitOrderBook-oneMarketSizeBidTakesOneEqualSizeAsk', function (t) {
  t.plan(6);
  var book   = new LimitOrderBook();
  var result = book.add(newAsk(10, 5));

  t.equal(result.takeSize,      0);
  t.equal(result.takeValue,     0);
  t.equal(result.makers.length, 0);

  result = book.add(newMarketBid(5, -1));

  t.equal(result.takeSize,      5);
  t.equal(result.takeValue,     (10 * 5));
  t.equal(result.makers.length, 1);
});

test('testLimitOrderBook-oneMarketSizeBidTakesOneLargerSizeAsk', function (t) {
  t.plan(6);
  var book   = new LimitOrderBook();
  var result = book.add(newAsk(10, 10));

  t.equal(result.takeSize,      0);
  t.equal(result.takeValue,     0);
  t.equal(result.makers.length, 0);

  result = book.add(newMarketBid(5, -1));

  t.equal(result.takeSize,      5);
  t.equal(result.takeValue,     (10 * 5));
  t.equal(result.makers.length, 1);
});

test('testLimitOrderBook-oneMarketFundsBidTakesOneSmallerSizeAsk', function (t) {
  t.plan(6);
  var book   = new LimitOrderBook();
  var result = book.add(newAsk(1, 5));

  t.equal(result.takeSize,      0);
  t.equal(result.takeValue,     0);
  t.equal(result.makers.length, 0);

  result = book.add(newMarketBid(-1, 10));

  t.equal(result.takeSize,      5);
  t.equal(result.takeValue,     5);
  t.equal(result.makers.length, 1);
});

test('testLimitOrderBook-oneMarketFundsBidTakesOneEqualSizeAsk', function (t) {
  t.plan(6);
  var book   = new LimitOrderBook();
  var result = book.add(newAsk(1, 5));

  t.equal(result.takeSize,      0);
  t.equal(result.takeValue,     0);
  t.equal(result.makers.length, 0);

  result = book.add(newMarketBid(-1, 5));

  t.equal(result.takeSize,      5);
  t.equal(result.takeValue,     5);
  t.equal(result.makers.length, 1);
});

test('testLimitOrderBook-oneMarketFundsBidTakesOneLargerSizeAsk', function (t) {
  t.plan(6);
  var book   = new LimitOrderBook();
  var result = book.add(newAsk(1, 10));

  t.equal(result.takeSize,      0);
  t.equal(result.takeValue,     0);
  t.equal(result.makers.length, 0);

  result = book.add(newMarketBid(-1, 5));

  t.equal(result.takeSize,      5);
  t.equal(result.takeValue,     5);
  t.equal(result.makers.length, 1);
});
