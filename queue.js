'use strict';
Queue.prototype.enQueue = function(func){
  if(this.queue.length === 0){
    this.queue.push(function(){} );
    func();
  }
  else{
    this.queue.push(function(){ func();});
  }    
};

Queue.prototype.deQueue = function(){
    if(this.queue.length !== 0){
      this.queue.shift();
      //After pop, if there is a command at the head, then execute it//
      if(typeof(this.queue[0]) == 'function'){
        //console.log(queue[0]);
        this.queue[0]();
      }
    }
};

var queue = new Queue();

function Queue(){
    this.queue = [];
}

module.exports = queue;