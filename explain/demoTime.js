////////////////////////////////////////////////////////
// Use the mt-simple API library                      //
// to set and get the current time of TI CC2530       //
//////////////////////////////////////////////////////// 

'use strict';
 var MT = require("../index");

    //check out your portname through the "dmesg" command//
    MT.init("/dev/ttyUSB0", function(){
      start();
    });

    function start(){

      //set Time
      MT.setCurrentTime(function(err, data){
         console.log("***User: set current time Successfully");
      });

      //get Time
      MT.getTime(function(err, data){
        console.log("***User: the current time is:");
        console.log(data.Hour+":"+data.Minute+":"+data.Second+"   "+data.Year+"/"+data.Month+"/"+data.Day);
      });    
    }

  
