'use strict';
function Counter(){
   this.sendCount =0;
   this.parseCount =0;
}
Counter.prototype.getSendCount = function() {
  var tem = this.sendCount;
  this.sendCount = this.sendCount +1;
  return tem;
};
Counter.prototype.getParseCount = function() {
  var tem = this.parseCount;
  this.parseCount = this.parseCount +1;
  return tem;
};
var counter = new Counter();

//exports instance of constructor Counter//
module.exports = counter;