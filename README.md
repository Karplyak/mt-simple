# mt-simple
simple MT API to use TI-2530 Soc through Monitor-and-Test command

##Test File 
####/test has 4 demo files
*  demoNV.js        
*  demoTempature.js    
*  demotime.js 
*  demoTimer.js

####/test-web has 1 demo files
*  demowebserver

##To Use
  ```js
var MT = require("index");
  ```
  
##Init
  ```js
  MT.init("/dev/ttyUSB0", function(){
      start();
    });
  ```
1. Portname needs to be specified  
2. If you don't know your portname, please check out your portname through the "dmesg" command
3. Callback function will be called after init is done
4. In this case, start function will be called after init is done
    
##Method Example : SYS_NV_WRITE
  ```js
  var commandSysNVWrite = { id : 0x0F00, offset : 0x00, len : 0x01, value : [0x55] };
   MT.SysNVWrite(commandSysNVWrite, function(err, data){
     console.log("***User: write NV Successfully");
     console.log(data);
   });
  ```
1.  SysNVWrite is one the mt-simple API function which writes to none volatial memory of TI-cc2530
2.  User should create an object to specifies the attribute
3.  the console.log(...) will be called when the parser receive response from TI-cc2530
