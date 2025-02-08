const { LimitOrderBook } = require('./index.js')
const { LimitOrder, MarketOrder } = require('./index.js')

const symbol = 'BTCUSDT'
const priceStep = '0.01'
const sizeStep = '0.001'
const book = new LimitOrderBook({ symbol, priceStep, sizeStep })

const order1 = new LimitOrder('order1', 'bid', '13.37', '10')
const order2 = new LimitOrder('order2', 'ask', '13.38', '10')
const order3 = new LimitOrder('order3', 'bid', '13.38', '5')

let result = book.add(order1)
result = book.add(order2)
result = book.add(order3)

const order4 = new MarketOrder('order4', 'bid', '2.5')
result = book.add(order4)

console.log(result)

const bestAskLevel = book.askLevels.queue[0]
const bestBidLevel = book.bidLevels.queue[0]

const bestAsk = bestAskLevel.queue[0].copy()
const bestBid = bestBidLevel.queue[0].copy()

console.log(`\nbest ask =`, bestAsk)
console.log(`\nbest bid =`, bestBid)

const Decimal = require('decimal.js')

const spread = new Decimal(bestAsk.price)
  .sub(bestBid.price)
  .toFixed()

console.log(`\nspread =`, spread)
