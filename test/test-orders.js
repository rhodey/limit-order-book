var test        = require('tape');
var LimitOrder  = require('../lib/orders.js').LimitOrder;
var MarketOrder = require('../lib/orders.js').MarketOrder;


test('testLimitOrder-', function (t) {
  t.plan(14);
  var order = new LimitOrder("lol", "bid", 10, 20);

  t.equal(order.orderId,    "lol");
  t.equal(order.side,       "bid");
  t.equal(order.price,         10);
  t.equal(order.size,          20);
  t.equal(order.sizeRemaining, 20);
  t.equal(order.valueRemoved,   0);

  t.equal(order.takeSize(5),    5);
  t.equal(order.sizeRemaining, 15);
  t.equal(order.valueRemoved,   5 * order.price);

  order.clearValueRemoved();
  t.equal(order.valueRemoved, 0);

  t.equal(order.takeSize(20),  15);
  t.equal(order.sizeRemaining,  0);
  t.equal(order.valueRemoved,  15 * order.price);

  order.clearValueRemoved();
  t.equal(order.valueRemoved, 0);
});

test('testMarketOrder-withSize', function (t) {
  t.plan(16);
  var order = new MarketOrder("lol", "bid", 100, -1);

  t.equal(order.orderId,     "lol")
  t.equal(order.side,        "bid");
  t.equal(order.price,           0);
  t.equal(order.size,          100);
  t.equal(order.sizeRemaining, 100);
  t.equal(order.valueRemoved,    0);

  t.ok(order.funds                         < 0);
  t.ok(order.fundsRemaining                < 0);
  t.equal(order.volumeRemoved,               0);
  t.equal(order.getSizeRemainingFor(1337), 100);

  order.subtract(75, 1337);
  t.equal(order.volumeRemoved,             75);
  t.equal(order.getSizeRemainingFor(1337), 25);

  order.subtract(25, 1337);
  t.equal(order.volumeRemoved,            100);
  t.equal(order.getSizeRemainingFor(1337),  0);
  t.equal(order.sizeRemaining,              0);
  t.equal(order.valueRemoved,               0);
});

test('testMarketOrder-withFunds', function (t) {
  t.plan(16);
  var order = new MarketOrder("lol", "bid", -1, 100);

  t.equal(order.orderId,  "lol")
  t.equal(order.side,     "bid");
  t.equal(order.price,        0);
  t.ok(order.size           < 0);
  t.ok(order.sizeRemaining  < 0);
  t.equal(order.valueRemoved, 0);

  t.equal(order.funds,                 100);
  t.equal(order.fundsRemaining,        100);
  t.equal(order.volumeRemoved,           0);
  t.equal(order.getSizeRemainingFor(25), 4);

  order.subtract(3, 25);
  t.equal(order.volumeRemoved,           3);
  t.equal(order.getSizeRemainingFor(25), 1);

  order.subtract(1, 25);
  t.equal(order.volumeRemoved,           4);
  t.equal(order.getSizeRemainingFor(1),  0);
  t.ok(order.sizeRemaining             < 0);
  t.equal(order.valueRemoved,            0);
});

test('testMarketOrder-withSizeAndFunds', function (t) {
  t.plan(21);
  var order = new MarketOrder("lol", "bid", 100, 50);

  t.equal(order.orderId,     "lol")
  t.equal(order.side,        "bid");
  t.equal(order.price,           0);
  t.equal(order.size,          100);
  t.equal(order.sizeRemaining, 100);
  t.equal(order.valueRemoved,    0);

  t.equal(order.funds,                  50);
  t.equal(order.fundsRemaining,         50);
  t.equal(order.volumeRemoved,           0);
  t.equal(order.getSizeRemainingFor(1), 50);
  t.equal(order.getSizeRemainingFor(5), (50 / 5));

  order.subtract(25, 1);
  t.equal(order.volumeRemoved,          25);
  t.equal(order.getSizeRemainingFor(5), (25 / 5));

  order.subtract(10, 2);
  t.equal(order.volumeRemoved,          35);
  t.equal(order.getSizeRemainingFor(1),  5);
  t.equal(order.sizeRemaining,          (100 - (25 + 10)));
  t.equal(order.valueRemoved,            0);

  order.subtract(5, 1);
  t.equal(order.volumeRemoved,          40);
  t.equal(order.getSizeRemainingFor(1),  0);
  t.equal(order.sizeRemaining,          (100 - (25 + 10 + 5)));
  t.equal(order.valueRemoved,            0);
});
