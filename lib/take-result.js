var TakeResult = function(taker, makers, takeSize) {
  this.taker     = taker;
  this.makers    = makers;
  this.takeSize  = takeSize;
  this.takeValue = (makers.length <= 0) ? 0 : makers.reduce(function(prev, maker) { return prev + maker.valueRemoved; }, 0);
};

TakeResult.prototype.clearMakerValueRemoved = function() {
  this.makers.forEach(function(maker) { maker.clearValueRemoved(); });
}


module.exports = TakeResult;
