# limit-order-book
A JavaScript limit order book implementation supporting limit and market orders.

## Usage
```javascript
var LimitOrder = require('limit-order-book').LimitOrder
var LimitOrderBook = require('limit-order-book').LimitOrderBook

let order1 = new LimitOrder("order01", "bid", 13.37, 10)
let order2 = new LimitOrder("order02", "ask", 13.38, 10)
let order3 = new LimitOrder("order03", "bid", 13.38, 5)

let book = new LimitOrderBook()

let result = book.add(order1)
result = book.add(order2)
result = book.add(order3)

console.log(result)
```
```
TakeResult {
  taker:
   LimitOrder {
     orderId: 'order03',
     side: 'bid',
     price: 13.38,
     size: 5,
     sizeRemaining: 0,
     valueRemoved: 0 },
  makers:
   [ LimitOrder {
       orderId: 'order02',
       side: 'ask',
       price: 13.38,
       size: 10,
       sizeRemaining: 5,
       valueRemoved: 66.9 } ],
  takeSize: 5,
  takeValue: 66.9 }
```

## Testing
```
$ npm run test
```

## License
Copyright 2016 An Honest Effort LLC, licensed under GPLv3: http://www.gnu.org/licenses/gpl-3.0.html
