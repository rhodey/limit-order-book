var MarketOrder = require('./orders.js').MarketOrder;


var Limit = function(price) {
  this.price  = price;
  this.volume = 0;
  this.map    = {};
  this.queue  = [];
};

Limit.prototype.peek = function() {
  return this.queue[0];
}

Limit.prototype.add = function(order) {
  this.map[order.orderId] = order;
  this.queue.push(order);
  this.volume += order.sizeRemaining;
}

Limit.prototype.remove = function(orderId) {
  var order = this.map[orderId];
  if (order !== undefined) {
    delete this.map[orderId];
    this.queue.splice(this.queue.indexOf(order), 1);
    this.volume -= order.sizeRemaining;
  }
  return order;
}

Limit.prototype.reduce = function(orderId, size) {
  var order = this.map[orderId];
  if (order !== undefined) {
    order.subtract(size, this.price);
    this.volume -= size;
    if (order.sizeRemaining <= 0) {
      delete this.map[orderId];
      this.queue.splice(this.queue.indexOf(order), 1);
    }
  }
  return order;
}

Limit.prototype.__getTakeSize = function(taker) {
  if (taker instanceof MarketOrder) {
    return taker.getSizeRemainingFor(this.price);
  } else {
    return taker.sizeRemaining;
  }
}

Limit.prototype.__takeLiquidityFromNextMaker = function(taker, takeSize) {
  var maker = this.queue[0];
  if (maker !== undefined) {
    var volumeRemoved = maker.takeSize(takeSize);

    if (maker.sizeRemaining <= 0) {
      delete this.map[maker.orderId];
      this.queue.shift();
    }

    this.volume -= volumeRemoved;
    taker.subtract(volumeRemoved, maker.price);
  }
  return maker;
}

Limit.prototype.takeLiquidity = function(taker) {
  var makers   = [];
  var takeSize = this.__getTakeSize(taker);
  var maker    = undefined;

  while (takeSize > 0) {
    maker = this.__takeLiquidityFromNextMaker(taker, takeSize);
    if (maker !== undefined) {
      makers.push(maker);
      takeSize = this.__getTakeSize(taker);
    } else {
      break;
    }
  }

  return makers;
}

Limit.prototype.clear = function() {
  this.queue  = [];
  this.map    = {};
  this.volume = 0;
}


module.exports = Limit;
