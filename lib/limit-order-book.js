var LimitQueue  = require('./limit-queue.js');
var MarketOrder = require('./orders.js').MarketOrder;
var TakeResult  = require('./take-result.js');


var LimitOrderBook = function() {
  this.askLimits = new LimitQueue("ask");
  this.bidLimits = new LimitQueue("bid");
};

LimitOrderBook.prototype.__processAsk = function(ask) {
  var makers = [];
  var next   = this.bidLimits.takeLiquidityFromBestLimit(ask);

  while (next.length > 0) {
    makers = makers.concat(next);
    next   = this.bidLimits.takeLiquidityFromBestLimit(ask);
  }

  if (ask.sizeRemaining > 0 && !(ask instanceof MarketOrder)) {
    this.askLimits.addOrder(ask);
  }

  return makers;
}

LimitOrderBook.prototype.__processBid = function(bid) {
  var makers = [];
  var next   = this.askLimits.takeLiquidityFromBestLimit(bid);

  while (next.length > 0) {
    makers = makers.concat(next);
    next   = this.askLimits.takeLiquidityFromBestLimit(bid);
  }

  if (bid.sizeRemaining > 0 && !(bid instanceof MarketOrder)) {
    this.bidLimits.addOrder(bid);
  }

  return makers;
}

LimitOrderBook.prototype.add = function(taker) {
  var takeSize = taker.sizeRemaining;
  var makers   = undefined;

  if (taker.side === "ask") {
    makers = this.__processAsk(taker);
  } else {
    makers = this.__processBid(taker);
  }

  if (!(taker instanceof MarketOrder)) {
    return new TakeResult(taker, makers, (takeSize - taker.sizeRemaining));
  } else {
    return new TakeResult(taker, makers, taker.volumeRemoved);
  }
}

LimitOrderBook.prototype.remove = function(side, price, orderId) {
  if (side === "ask") {
    return this.askLimits.removeOrder(price, orderId);
  } else {
    return this.bidLimits.removeOrder(price, orderId);
  }
}


LimitOrderBook.prototype.reduce = function(side, price, orderId, size) {
  if (side === "ask") {
    return this.askLimits.reduceOrder(price, orderId, size);
  } else {
    return this.bidLimits.reduceOrder(price, orderId, size);
  }
}

LimitOrderBook.prototype.clear = function() {
  this.askLimits.clear();
  this.bidLimits.clear();
}


module.exports = LimitOrderBook;
