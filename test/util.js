var LimitOrder  = require('../lib/orders.js').LimitOrder;
var MarketOrder = require('../lib/orders.js').MarketOrder;
var nextOrderId = 0;


function newAsk(price, size, orderId) {
  if (orderId !== undefined) {
    return new LimitOrder(orderId, "ask", price, size);
  } else {
    return new LimitOrder((nextOrderId++).toString(), "ask", price, size);
  }
}

function newMarketAsk(size, funds, orderId) {
  if (orderId !== undefined) {
    return new MarketOrder(orderId, "ask", size, funds);
  } else {
    return new MarketOrder((nextOrderId++).toString(), "ask", size, funds);
  }
}

function newBid(price, size, orderId) {
  if (orderId !== undefined) {
    return new LimitOrder(orderId, "bid", price, size);
  } else {
    return new LimitOrder((nextOrderId++).toString(), "bid", price, size);
  }
}

function newMarketBid(size, funds, orderId) {
  if (orderId !== undefined) {
    return new MarketOrder(orderId, "bid", size, funds);
  } else {
    return new MarketOrder((nextOrderId++).toString(), "bid", size, funds);
  }
}


module.exports = {
  newAsk       : newAsk,
  newMarketAsk : newMarketAsk,
  newBid       : newBid,
  newMarketBid : newMarketBid
}
