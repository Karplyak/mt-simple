/////////////////////////////////////////////////////////////////
// Use the MT-simple API library                               //
// to keep retriving the value of tempature of TI CC2530       //
// BTW, the formatFloat(temp/14, 2); is just a scale of the    //
// value of the tempature returned by ADC read MT command      //
/////////////////////////////////////////////////////////////////

'use strict';
 var MT = require("../index");

  MT.init("/dev/ttyUSB0", function(){
   start();
  });

  function start(){        
    
    setInterval( function(){
      MT.getTempature(function(err, data){
        //console.log("***User: the current tempature is:"); 
        //console.log(data.AdcRead.toString(16));
        temp = data.AdcRead.toString(16);
      });
    }, 1000);
    var temp;
    
    exports.getTemp = function(){
     return formatFloat(temp/14, 2);
    };
  }

  function formatFloat(num, pos){
     var size = Math.pow(10,pos);
     return Math.round(num*size)/size; 
  }

    

  
