const { LimitOrder, MarketOrder } = require('../lib/orders.js')

let nextOrderId = 0

const newAsk = (price, size, orderId) => {
  if (orderId) {
    return new LimitOrder(orderId, 'ask', price, size)
  } else {
    return new LimitOrder((nextOrderId++).toString(), 'ask', price, size)
  }
}

const newMarketAsk = (size, funds, orderId) => {
  if (orderId) {
    return new MarketOrder(orderId, 'ask', size, funds)
  } else {
    return new MarketOrder((nextOrderId++).toString(), 'ask', size, funds)
  }
}

const newBid = (price, size, orderId) => {
  if (orderId) {
    return new LimitOrder(orderId, 'bid', price, size)
  } else {
    return new LimitOrder((nextOrderId++).toString(), 'bid', price, size)
  }
}

const newMarketBid = (size, funds, orderId) => {
  if (orderId) {
    return new MarketOrder(orderId, 'bid', size, funds)
  } else {
    return new MarketOrder((nextOrderId++).toString(), 'bid', size, funds)
  }
}

module.exports = {
  newAsk, newMarketAsk,
  newBid, newMarketBid
}
