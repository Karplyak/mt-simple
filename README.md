# mt-simple
nodeJS API Library implementing Monitor-and-Test command to control TI-2530 chip for IOT application. 

##Overview
The CC2530 is a System-on-chip solution for IEEE 802.15.4, Zigbee and RF4CE applications, and the Monitor-and-Test(MT) interface is used for communication between the host testter and a Zigbee device through RS-232 serial port. 
  
As a user/tester, we can issue MT commands to the ZigBee target for your application: tempature sensoring, light sensing and chemical sensing etc. Thus, a nodeJS API Library which encapsulates the MT interface can help nodeJS/JavaScript user easily issue MT commands for their IOT application.

##Features
  With mt-simple nodeJS API Library, you can issue MT command easily through downloading mt-simple from npm and used in your nodeJS/JavaScript project without the need to look trough handbook issued by Texas Intrusment.

  For example, a HTML/CSS + websocket + mt-simple API website to present **tempature and brightness in realtime**.
  
  ![mt-simple web_demo](https://github.com/adwin5/mt-simple/blob/master/document/web_demo.jpg)
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

