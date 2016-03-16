////////////////////////////////////////////////////////
// Use the mt-simple API library                      //
// to set time and get time and current tempature     //
// of TI CC2530                                       //
//////////////////////////////////////////////////////// 

'use strict';
 var MT = require("../index");
 
    //check out your portname through the "dmesg" command//
    MT.init("/dev/ttyUSB0", function(){
      start();
    });

    function start(){
      MT.setCurrentTime(function(err, data){
         console.log("***User: set current time Successfully");
      });
     
      MT.getTime(function(err, data){
        console.log("***User: the current time is:");
        console.log(data.Hour+":"+data.Minute+":"+data.Second+"   "+data.Year+"/"+data.Month+"/"+data.Day);
      });    
      MT.getTempature(function(err, data){
          console.log("***User: the current tempature is:");
          console.log(data.AdcRead.toString(16));
      });
    }

  
