# limit-order-book
At time of publish in 2016 this was the only OSS limit order book on github

The order book has always been passing tests but with v1.0.0 the api has significantly improved

+ **npm install limit-order-book**
+ Suitable for matching engine
+ Supports limit and market orders
+ Floats as strings internally = always correct math

## Usage
```javascript
const { LimitOrderBook } = require('limit-order-book')
const { LimitOrder, MarketOrder } = require('limit-order-book')

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
```
```
Result {
  symbol: 'BTCUSDT',
  taker: {
    type: 'market',
    orderId: 'order4',
    side: 'bid',
    price: '0',
    size: '2.5',
    sizeRemaining: '0',
    filled: '2.5',
    filledValue: '33.45',
    funds: '0',
    fundsRemaining: '0'
  },
  makers: [
    {
      type: 'limit',
      orderId: 'order2',
      side: 'ask',
      price: '13.38',
      size: '10',
      sizeRemaining: '2.5',
      filled: '2.5',
      filledValue: '33.45'
    }
  ],
  filled: '2.5',
  filledValue: '33.45'
}

best ask = {
  type: 'limit',
  orderId: 'order2',
  side: 'ask',
  price: '13.38',
  size: '10',
  sizeRemaining: '2.5'
}

best bid = {
  type: 'limit',
  orderId: 'order1',
  side: 'bid',
  price: '13.37',
  size: '10',
  sizeRemaining: '10'
}

spread = 0.01
```

## Api
```
book({ symbol, priceStep, sizeStep })
Constructor wants symbol, priceStep, sizeStep

book.config(opts)
Same as constructor

book.add(order)
Add a limit or market order to the book and get back result

book.reduce(orderId, size)
Reduce the size of an order to = size
Returns null or the updated order

book.remove(orderId)
Remove the order from the book
Returns null or the order

book.clear()
Remove all orders
```

## Test
[480 assertions passing](https://github.com/rhodey/limit-order-book/tree/master/test)
```
npm run test
```

## License
```
Copyright 2025 - mike@rhodey.org

MIT
```
