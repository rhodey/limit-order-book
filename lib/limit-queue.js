var Limit         = require('./limit.js');
var MarketOrder   = require('./orders.js').MarketOrder;
var PriorityQueue = require('js-priority-queue');


var LimitQueue = function(side) {
  this.map = {};
  if (side === "ask") {
    this.__queue = new PriorityQueue({ strategy: PriorityQueue.ArrayStrategy, comparator: function(a, b) { return a.price - b.price; }});
  } else {
    this.__queue = new PriorityQueue({ strategy: PriorityQueue.ArrayStrategy, comparator: function(a, b) { return b.price - a.price; }});
  }
  this.queue = this.__queue.priv.data;
};

LimitQueue.prototype.peek = function() {
  return (this.queue.length <= 0) ? undefined : this.__queue.peek();
}

LimitQueue.prototype.addOrder = function(order) {
  var limit = this.map[order.price];

  if (limit === undefined) {
    limit = new Limit(order.price);
    this.map[order.price] = limit;
    this.__queue.queue(limit);
  }

  limit.add(order);
}

LimitQueue.prototype.removeOrder = function(price, orderId) {
  var order = undefined;
  var limit = this.map[price];

  if (limit !== undefined) {
    order = limit.remove(orderId);
    if (order !== undefined && limit.peek() === undefined) {
      delete this.map[price];
      this.queue.splice(this.queue.indexOf(limit), 1);
    }
  }

  return order;
}

LimitQueue.prototype.reduceOrder = function(price, orderId, size) {
  var order = undefined;
  var limit = this.map[price];

  if (limit !== undefined) {
    order = limit.reduce(orderId, size);
    if (order !== undefined && limit.peek() === undefined) {
      delete this.map[price];
      this.queue.splice(this.queue.indexOf(limit), 1);
    }
  }

  return order;
}

LimitQueue.prototype.__isTaken = function(maker, taker) {
  if (taker instanceof MarketOrder) {
    return taker.getSizeRemainingFor(maker.price) > 0;
  } else if (taker.side === "bid") {
    return taker.price >= maker.price;
  } else {
    return taker.price <= maker.price;
  }
}

LimitQueue.prototype.takeLiquidityFromBestLimit = function(taker) {
  var maker = this.peek();
  if (maker !== undefined && this.__isTaken(maker, taker)) {
    var makers = maker.takeLiquidity(taker);

    if (makers.length > 0 && maker.peek() === undefined) {
      delete this.map[maker.price];
      this.__queue.dequeue();
    }

    return makers;
  } else {
    return new Array();
  }
}

LimitQueue.prototype.clear = function() {
  this.map = {};
  while (this.peek() !== undefined) { this.__queue.dequeue().clear(); }
}


module.exports = LimitQueue;
