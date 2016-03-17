# mt-simple
nodeJS API Library implementing Monitor-and-Test command to control TI-2530 chip for IOT application. 

##Overview
The CC2530 is a System-on-chip solution for IEEE 802.15.4, Zigbee and RF4CE applications, and the Monitor-and-Test(MT) interface is used for communication between the host testter and a Zigbee device through RS-232 serial port. 
  
As a user/tester, we can issue MT commands to the ZigBee target for your application: tempature sensoring, light sensing and chemical sensing etc. Thus, a nodeJS API Library which encapsulates the MT interface can help nodeJS/JavaScript user easily issue MT commands for their IOT application.

##Features
  With mt-simple nodeJS API Library, you can issue MT command easily through downloading mt-simple from npm and used in your nodeJS/JavaScript project without the need to look trough handbook issued by Texas Intrusment.

  For example, a HTML/CSS + websocket + mt-simple API website to present **tempature and brightness in realtime**.
  
  ![mt-simple web_demo](https://github.com/adwin5/mt-simple/blob/master/document/web_demo.jpg)
  
  [![demo and tutorial video](https://i.ytimg.com/vi/XR0Q8ULU49I/2.jpg?time=1458208945360)](https://www.youtube.com/watch?v=XR0Q8ULU49I)
  
##Installation
Available via [npm](http://npmjs.org/):

    > $ npm install mt-simple

Or via git:

    > $ git clone https://github.com/adwin5/mt-simple.git
    > $ npm install

##Test Files
####/explain has 4 demo files
*  demoNV.js        
*  demoTempature.js    
*  demotime.js 
*  demoTimer.js
*  demoAdcRead.js

####/explain-web has 1 demo file
*  demowebserver.js
*  table.html

##How to use
  ```js
  var MT = require("index");
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
  ```
  
  Result
  ```
open
AP sent: 
<Buffer fe 0b 21 10 19 8f 7d 1e 0f 33 35 03 11 e0 07 33>
***User: set current time Successfully
AP sent: 
<Buffer fe 00 21 11 30>
***User: the current time is:
15:51:53   2016/3/17
  ```
###Init
  ```js
  MT.init("/dev/ttyUSB0", function(){
      start();
    });
  ```
1. Portname needs to be specified  
2. If you don't know your portname, please check out your portname through the "dmesg" command
3. Callback function will be called after init is done
4. In this case, start function will be called after init is done
  ![mt-simple dmesg](https://github.com/adwin5/mt-simple/blob/master/document/dmesg_command.jpg)

###Write Code Here
  ```js
  function start(){
    ...code...
  }
  ```
1. Write your code in the start function that is called after init
2. It makes sure that your code is executed after port and parser is ready

###Method Example 1: SYS_TIME_SET
  ```js
    MT.setCurrentTime(callback);
  ```
1.  setCurrentTime is one of the mt-simple API function which sets the time/clock of TI-cc2530 to current time
2.  The time in TI-cc2530 is not current time if your just power on and read the time.

###Method Example 2: SYS_NV_WRITE
  ```js
    var data = { id : 0x0F00, offset : 0x00, len : 0x01, value : [0x55] };
    MT.SysNVWrite(data, callback);
  ```
1.  SysNVWrite is one of the mt-simple API function which writes to none volatial memory of TI-cc2530
2.  User should create an object to specifies the attribute
3.  the console.log(...) will be called when the parser receive response from TI-cc2530

###Indication Dealer Example : 
  ```js
  MT.startTimer(data, callback);
  MT.hub.on('messageIND',callback);
  ```
Example:
  ```js
  //set timer 0 ,it will expire in 2 secs//
  MT.startTimer({id:0, timeout:2000}, function(err, data){});
    
  MT.hub.on('messageIND',function(data){
    //do someting ... when the timer expired ... aka ... the indication comes//
    //get tempature//
    MT.getTempature(function(err, data){
      console.log("***User: the current tempature is:");
      console.log(data.AdcRead.toString(16));
      });
  });
  ```
1. Indication means an response from Soc and it is not synchronous
2. Use hub.on to listen to the indication
2. In this case, when the timer expires, then execute the callback function in
```js
hub.on('messsageIND', cb);
```
4. We show an example to get the value of tempature when the timer expires a.k.a after 2000 millisecond

###notRecognized Command Dealer Example : 
  ```js
  MT.hub.on('notRecogMessage',function(data){
     console.log(data);
  });
  ```
1. If the ID of indication/synchronous response is not regonized by parser, then execute the callback function in
```js
hub.on('notRecogMessage', cb);
```

##Demo

demoTempature.js
```js
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
          console.log(data.AdcRead.toString());
      });
    }
```

Result
```
open
AP sent: 
<Buffer fe 0b 21 10 4d 91 7d 1e 10 01 11 03 11 e0 07 70>
***User: set current time Successfully
AP sent: 
<Buffer fe 00 21 11 30>
***User: the current time is:
16:1:17   2016/3/17
AP sent: 
<Buffer fe 02 21 0d 0e 03 23>
***User: the current tempature is:
564
```
==================================

demoNV.js
```js
////////////////////////////////////////////////////////////////////////////////////////
// Use the mt-simple API library                                                      //
// to write and read none volatial memoryin of TICC2530                               //
// Also, here are other command tested :                                              //
// Zigbee write configure, System NV init and system reset request                    //
//////////////////////////////////////////////////////////////////////////////////////// 

 'use strict';
  var MT = require("../index");

  //check out your portname through the "dmesg" command//
  MT.init("/dev/ttyUSB0", function(){
    start();
  });

  function start(){
    //write to NV memory
    var commandSysNVWrite = { id : 0x0F00, offset : 0x00, len : 0x01, value : [0x55] };
    MT.SysNVWrite(commandSysNVWrite, function(err, data){
       console.log("***User: write NV Successfully");
       console.log(data);
    });
    //read from NV memory
    var commandSysNVRead = { id : 0x0F00, offset : 0x00 };
    MT.SysNVRead(commandSysNVRead, function(err, data){
       console.log("***User: Read NV Successfully");
       console.log(data);
    });
    //write ZB configure
    var commandZBWriteConfg = { configid : 0x03, len : 0x01, value : [0x02] };
    MT.ZBWriteConfg(commandZBWriteConfg, function(err, data){
       console.log("***User: ZB write config Successfully");
       console.log(data);
    });
    //create and initialize an item in non-volatial memory
    var commandSysNVItemInit = { id: 0x0F00, len : 0x01, initlen: 0x01, initvalue : [0x00]};
    MT.SysNVItemInit(commandSysNVItemInit, function(err, data){
       console.log("***User: NV write and init Successfully");
       console.log(data);
    });
    //System Reset 
    MT.SysResetReq(function(err, data){
      console.log("***User: System Reset Successfully");
      console.log(data);
    });
    //listen to indication 
    MT.hub.on('messageIND',function(data){
      console.log("***User: Receieved indication");         
      console.log(data);
    });
  }
```

Result
```
open
AP sent: 
<Buffer fe 05 21 09 00 0f 00 01 55 76>
***User: write NV Successfully
{ Status: 0 }
AP sent: 
<Buffer fe 03 21 08 00 0f 00 25>
***User: Read NV Successfully
{ Status: 0, Value: <Buffer 55> }
AP sent: 
<Buffer fe 03 26 05 03 01 02 20>
***User: ZB write config Successfully
{ Status: 0 }
AP sent: 
<Buffer fe 05 21 07 00 0f 01 01 00 2c>
***User: NV write and init Successfully
{ Status: 0 }
AP sent: 
<Buffer fe 01 41 00 00 40>
***User: Receieved indication
{ Reason: 2,
  TransID: 2,
  ProductID: 0,
  MajorRel: 2,
  MinorRel: 6,
  'H/W': 2 }
```
==================================
demoTimer.js
```js
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
```

Result
```
open
AP sent: 
<Buffer fe 0b 21 10 b1 93 7d 1e 10 0b 1d 03 11 e0 07 88>
***User: set current time Successfully
AP sent: 
<Buffer fe 03 21 0a 00 d0 07 ff>
timer 0 set successfully
{ 'Status of SYS_OSAL_START_TIMER: [Success(0) or Failure(1)]': 0 }
AP sent: 
<Buffer fe 03 21 0a 01 a0 0f 86>
timer 1 set successfully
{ 'Status of SYS_OSAL_START_TIMER: [Success(0) or Failure(1)]': 0 }
AP sent: 
<Buffer fe 03 21 0a 02 70 17 4d>
timer 2 set successfully
{ 'Status of SYS_OSAL_START_TIMER: [Success(0) or Failure(1)]': 0 }
AP sent: 
<Buffer fe 03 21 0a 03 40 1f 74>
timer 3 set successfully
{ 'Status of SYS_OSAL_START_TIMER: [Success(0) or Failure(1)]': 0 }
AP sent: 
<Buffer fe 00 21 11 30>
***User: the current time is:
16:11:31   2016/3/17
AP sent: 
<Buffer fe 02 21 0d 0e 03 23>
***User: the current tempature is:
234
AP sent: 
<Buffer fe 00 21 11 30>
***User: the current time is:
16:11:33   2016/3/17
AP sent: 
<Buffer fe 02 21 0d 0e 03 23>
***User: the current tempature is:
234
AP sent: 
<Buffer fe 00 21 11 30>
***User: the current time is:
16:11:35   2016/3/17
AP sent: 
<Buffer fe 02 21 0d 0e 03 23>
***User: the current tempature is:
233
AP sent: 
<Buffer fe 00 21 11 30>
***User: the current time is:
16:11:37   2016/3/17
AP sent: 
<Buffer fe 02 21 0d 0e 03 23>
***User: the current tempature is:
234
```
==================================

##Methods
* `init(portname, cb)` - initiate serial port and parser
* `setCurrentTime(cb)` - reset the value of time in TI-cc2530 chip
* `getCurrentTime(cb)` - get the value of time in TI-cc2530 chip
* `getTempature(cb)` - get the value of tempature in TI-cc2530 chip
* `startTimer(data, cb)` - start a timer in 
* `SysNVWrite(data, cb)` - write to the Non-volatiale memory
* `SysNVRead(data, cb)` -  read from the Non-volatiale memory
* `ZBWriteConfg(data, cb)` - write and config Z-Stack
* `SysNVItemInit(data, cb)` - Write and Initiale 
* `SysResetReq(cb)` - hard reset of the TI-cc2530 chip
* `hub.on('messageIND',cb)` - listener for listening recognized indication 
* `hub.on('notRecogMessage',cb)` - listener for listening not recognized indication 

