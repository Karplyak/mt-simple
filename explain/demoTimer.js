////////////////////////////////////////////////////////
// Use the mt-simple API library                      //
// to set 4 timers in TI CC2530 and get time and      //
// tempature when the timer expires                   //
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

    //set timer 0 ,it will expire in 2 secs//
    MT.startTimer({id:0, timeout:2000}, function(err, data){
        console.log("timer 0 set successfully");
        console.log(data);
    });
    //set timer 1 ,it will expire in 4 secs// 
    MT.startTimer({id:1, timeout:4000}, function(err, data){
        console.log("timer 1 set successfully");
        console.log(data);
    });
    //set timer 2 ,it will expire in 7 secs//
    MT.startTimer({id:2, timeout:6000}, function(err, data){
        console.log("timer 2 set successfully");
        console.log(data);
    });
    //set timer 3 ,it will expire in 8 secs//
    MT.startTimer({id:3, timeout:8000}, function(err, data){
        console.log("timer 3 set successfully");
        console.log(data);
    });
    
    MT.hub.on('messageIND',function(data){
      //do someting ... when the timer expired ... aka ... the indication comes//
      
      //get time//
      MT.getTime(function(err, data){
          console.log("***User: the current time is:");
          console.log(data.Hour+":"+data.Minute+":"+data.Second+"   "+data.Year+"/"+data.Month+"/"+data.Day);
      });

      //get tempature//
      MT.getTempature(function(err, data){
          console.log("***User: the current tempature is:");
          console.log(data.AdcRead.toString(16));
      });
        
    });

    //listen to indication/response which the system can't parse
    MT.hub.on('notRecogMessage',function(data){
       console.log(data);
    });

}

  
