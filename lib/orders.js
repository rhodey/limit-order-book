var LimitOrder = function(orderId, side, price, size) {
  this.orderId       = orderId;
  this.side          = side;
  this.price         = price;
  this.size          = size;
  this.sizeRemaining = size;
  this.valueRemoved  = 0;
};

LimitOrder.prototype.clearValueRemoved = function() {
  this.valueRemoved = 0;
}

LimitOrder.prototype.subtract = function(size, price) {
  this.sizeRemaining -= size;
}

LimitOrder.prototype.takeSize = function(size) {
  var taken           = Math.min(size, this.sizeRemaining);
  this.sizeRemaining -= taken;
  this.valueRemoved  += this.price * taken;
  return taken;
}


function MarketOrder(orderId, side, size, funds) {
  LimitOrder.call(this, orderId, side, 0, size);
  this.funds          = funds;
  this.fundsRemaining = funds;
  this.volumeRemoved  = 0;
};

MarketOrder.prototype = Object.create(LimitOrder.prototype);
MarketOrder.prototype.constructor = MarketOrder;

MarketOrder.prototype.subtract = function(size, price) {
  this.sizeRemaining  -= size;
  this.fundsRemaining -= (price * size);
  this.volumeRemoved  += size;
}

MarketOrder.prototype.getSizeRemainingFor = function(price) {
  var fundsTakeSize = ~~(this.fundsRemaining / price);

  if (this.funds > 0 && this.size > 0) {
    return Math.min(fundsTakeSize, this.sizeRemaining);
  } else if (this.funds > 0) {
    return fundsTakeSize;
  } else if (this.size > 0) {
    return this.sizeRemaining;
  } else {
    return 0;
  }
}


module.exports = {
  LimitOrder  : LimitOrder,
  MarketOrder : MarketOrder
};
