var test        = require('tape');
var newAsk      = require('./util.js').newAsk;
var newBid      = require('./util.js').newBid;
var TakeResult  = require('../lib/take-result.js');


test('testTakeResult-empty', function (t) {
  t.plan(5);
  var result = new TakeResult(newBid(10, 20), new Array(), 0);

  t.equal(result.taker.price,  10);
  t.equal(result.taker.size,   20);
  t.equal(result.takeSize,      0);
  t.equal(result.takeValue,     0);
  t.equal(result.makers.length, 0);
});

test('testTakeResult-askMakers', function (t) {
  t.plan(6);

  var ask1   = newAsk(10, 1);
  var ask2   = newAsk(10, 3);
  var ask3   = newAsk(12, 2);
  var makers = [ask1, ask2, ask3];

  ask1.takeSize(ask1.size);
  ask2.takeSize(ask2.size);
  ask3.takeSize(ask3.size);

  var TAKE_SIZE  = ask1.size + ask2.size + ask3.size;
  var TAKE_VALUE = ask1.valueRemoved + ask2.valueRemoved + ask3.valueRemoved;
  var result     = new TakeResult(newBid(10, 20), makers, TAKE_SIZE);

  t.equal(result.takeSize,      TAKE_SIZE);
  t.equal(result.takeValue,     TAKE_VALUE);
  t.equal(result.makers.length, 3);

  result.clearMakerValueRemoved();
  t.equal(ask1.valueRemoved, 0);
  t.equal(ask2.valueRemoved, 0);
  t.equal(ask3.valueRemoved, 0);
});

test('testTakeResult-bidMakers', function (t) {
  t.plan(6);

  var bid1   = newBid(12, 1);
  var bid2   = newBid(10, 3);
  var bid3   = newBid(10, 2);
  var makers = [bid1, bid2, bid3];

  bid1.takeSize(bid1.size);
  bid2.takeSize(bid2.size);
  bid3.takeSize(bid3.size);

  var TAKE_SIZE  = bid1.size + bid2.size + bid3.size;
  var TAKE_VALUE = bid1.valueRemoved + bid2.valueRemoved + bid3.valueRemoved;
  var result     = new TakeResult(newBid(10, 20), makers, TAKE_SIZE);

  t.equal(result.takeSize,      TAKE_SIZE);
  t.equal(result.takeValue,     TAKE_VALUE);
  t.equal(result.makers.length, 3);

  result.clearMakerValueRemoved();
  t.equal(bid1.valueRemoved, 0);
  t.equal(bid2.valueRemoved, 0);
  t.equal(bid3.valueRemoved, 0);
});
