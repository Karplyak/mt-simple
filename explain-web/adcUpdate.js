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
        temp = data.AdcRead.toString();
        temp = formatFloat(temp/26, 2);
        console.log("Tempature : "+temp);
      });
      MT.getAdcValue({channel:0x07}, function(err, data){
        light = data.AdcRead.toString();
        light = formatFloat(110 + 0.3*(light-110), 0);
        console.log("Light : "+light);
      });

    }, 1000);
    var temp, light;
    
    //linear transform, not accurate//
    exports.getTempValue = function(){
     return temp;
    };
    exports.getLightValue = function(){
     return light;
    };

  }

  function formatFloat(num, pos){
     var size = Math.pow(10,pos);
     return Math.round(num*size)/size; 
  }

    

  
