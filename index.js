/////////////////////////////////////
// mt-simple API library           //
///////////////////////////////////// 

'use strict';
var serialport = require("serialport");
var SerialPort = serialport.SerialPort;
var Concentrate = require('concentrate');

var FCS = require("./lib/fcs");
var MT_parser = require("./lib/parser");
var counter = require('./lib/counter');
var queue = require('./lib/queue');

var events =require('events');
var event = new events.EventEmitter();

var serialPort;
 
function MTinit(portname, callback){ 
  serialPort = new SerialPort(portname, {
    baudrate: 115200//really important***//other baudrate might not be able to connect UART
  },false); // this is the openImmediately flag [default is true] 

  serialPort.open(function (error) {
    if ( error ) {
      console.log('failed to open: '+error);
    } else {
      console.log('open');

    serialPort.pipe(MT_parser.parser);
    //pipe received message from serialport to parser 
   
    callback();
    }
  });
}

//----------------------------------------------------//
function send_message(command_name, obj, callback){
  obj = obj || {};

  var message = messageFactory.createMessage(command_name, obj),
      MTBuf_with_FCS = FCS.append(message.getBuffer()); 

  var tag = counter.getSendCount();
  //tage is the sequence of command

  MT_parser.once(tag+'messageSRSP',function(data){
  //listen for SRSP message//so every send message has its own listener

    if((typeof callback !== 'undefined')&&(callback!==null)){
      callback(null, data);
    }
    queue.deQueue();
    //When SRSP message is received, we should let the next waiting command to exe//
    //if there are other commands waiting, then pop it//    
  });
  
  serialPort.write(MTBuf_with_FCS , function(err, results) {
      if(err){
        console.log('err ' + err);
      }else{      
        console.log('AP sent: ');
        console.log(MTBuf_with_FCS);
      }
  });
  //send message/command by serialport

}

//listener for not recognized response
MT_parser.on('notRecogMessage',function(data){
  console.log(data);
  event.emit('notRecogMessage', data);  
});

//listener for not recognized response
MT_parser.on('messageIND',function(data){
  event.emit('messageIND', data);
});

var MT_mod ={
       startTimer : function (obj,cb){
         queue.enQueue(function(){send_message("req:SysOsalStartTimer", obj, cb);});
       },
       init : function(portname, cb){
          MTinit(portname, cb);
       },
       getTime : function(cb){
        queue.enQueue(function(){send_message('req:getSysTime', null, cb);});   
       },
       setCurrentTime : function(cb){
         queue.enQueue(function(){send_message('req:setSysTime', null, cb);}); 
       },
       getTempature : function(cb){
         queue.enQueue(function(){send_message('req:SysTempRead', null, cb);});
       },
       ZBstartReq : function(cb){
         queue.enQueue(function(){send_message('req:ZBstartReq', null, cb);});
       },
       ZBbindDev : function(cb){
         queue.enQueue(function(){send_message('req:ZBbindDev', null, cb);});
       },       
       SysNVWrite : function(obj, cb){
         queue.enQueue(function(){send_message('req:SysNVWrite', obj, cb);});
       },
       SysNVRead : function(obj, cb){
         queue.enQueue(function(){send_message('req:SysNVRead', obj, cb);});
       },
       ZBWriteConfg : function(obj, cb){
         queue.enQueue(function(){send_message('req:ZBWriteConfg', obj, cb);});
       },
       SysResetReq : function(obj, cb){
         queue.enQueue(function(){send_message('req:SysResetReq', obj, cb);});
       },
       SysNVItemInit : function(obj, cb){
         queue.enQueue(function(){send_message('req:SysNVItemInit', obj, cb);});
       },
       hub : event

};

module.exports = MT_mod;

function MessageFactory(){
    this.createMessage = function(type, obj){
      var message;

      if(type === 'req:getSysTime'){
        message = new GetSysTime();
      } else if(type === 'req:setSysTime'){
        message = new SetSysTime();
      } else if(type === 'req:SysTempRead'){
        message = new TempRead();
      } else if(type === 'req:SysNVWrite'){
        message = new SysNVWrite(obj);
      } else if(type === 'req:SysNVRead'){
        message = new SysNVRead(obj);
      } else if(type === 'req:SysOsalStartTimer'){
        message = new StartTimer(obj);
      } else if(type === 'req:ZBWriteConfg'){
        message = new ZBWriteConfg(obj);
      } else if(type === 'req:SysResetReq'){
        message = new SysResetReq();
      } else if(type === 'req:SysNVItemInit'){
        message = new SysNVItemInit(obj);
      }

      message.type = type;
      message.getBuffer = function(){
         return message.MTBuf;
      }; 
      return message;
    };
}
var messageFactory = new MessageFactory();

var GetSysTime = function(){
    this.MTBuf = Concentrate().uint8(0xFE).uint8(0x00)
                             .uint8(0x21)
                             .uint8(0x11)
                             .result();
};
var SetSysTime = function(){
    var currentdate = new Date(); 
    this.MTBuf = Concentrate().uint8(0xFE).uint8(0x0B)
                             .uint8(0x21)
                             .uint8(0x10)
                             .uint32(Date.now()/1000-946080000-576000)//Date.now() is the seconds from 1970/1/1 00:00:00//offset is caculated for seconds between 1970 and 2000
                             .uint8(currentdate.getHours())
                             .uint8(currentdate.getMinutes())
                             .uint8(currentdate.getSeconds())
                             .uint8((currentdate.getMonth()+1))
                             .uint8(currentdate.getDate())
                             .uint16(currentdate.getFullYear())
                             .result();
};
var TempRead = function(){
    this.MTBuf = Concentrate().uint8(0xFE).uint8(0x02)
                             .uint8(0x21)
                             .uint8(0x0D)
                             .uint8(0x0E)
                             .uint8(0x03)
                             .result();
};
var StartTimer = function(obj){
    if((obj.id == null)||(obj.timeout == null))
      throw "parameter is not complete";
    this.MTBuf = Concentrate().uint8(0xFE).uint8(0x03)
                             .uint8(0x21)
                             .uint8(0x0A)
                             .uint8(obj.id)
                             .uint16(obj.timeout)
                             .result();
  
};
var SysNVWrite = function(obj){
    if((obj.id == null)||(obj.offset == null)||(obj.len == null)||(obj.value == null))
      throw "parameter is not complete";
    this.MTBuf = Concentrate().uint8(0xFE).uint8(obj.len+4)
                             .uint8(0x21)
                             .uint8(0x09)
                             .uint16(obj.id)
                             .uint8(obj.offset)
                             .uint8(obj.len)
                             .buffer(new Buffer(obj.value))
                             .result();
};
var SysNVRead = function(obj){
    if((obj.offset == null)||(obj.id == null))
      throw "parameter is not complete";
    this.MTBuf = Concentrate().uint8(0xFE).uint8(0x03)
                             .uint8(0x21)
                             .uint8(0x08)
                             .uint16(obj.id)
                             .uint8(obj.offset)
                             .result();
};
var ZBWriteConfg = function(obj){
    if((obj.configid == null)||(obj.len == null)||(obj.value == null))
      throw "parameter is not complete";
    this.MTBuf = Concentrate().uint8(0xFE).uint8(obj.len+2)
                             .uint8(0x26)
                             .uint8(0x05)
                             .uint8(obj.configid)
                             .uint8(obj.len)
                             .buffer(new Buffer(obj.value))
                             .result();
};
var SysResetReq = function(){
    this.MTBuf = Concentrate().uint8(0xFE).uint8(0x01)
                             .uint8(0x41)
                             .uint8(0x00)
                             .uint8(0x00)
                             .result();
};
var SysNVItemInit = function(obj){
    if((obj.id == null)||(obj.len == null)||(obj.initlen == null)||(obj.initvalue == null))
      throw "parameter is not complete";
    this.MTBuf = Concentrate().uint8(0xFE).uint8(obj.len+4)
                             .uint8(0x21)
                             .uint8(0x07)
                             .uint16(obj.id)
                             .uint8(obj.len)
                             .uint8(obj.initlen)
                             .buffer(new Buffer(obj.initvalue))
                             .result();
};

