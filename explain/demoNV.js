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

   
