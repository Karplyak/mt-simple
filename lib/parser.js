'use strict';

var DChunks = require('dissolve-chunks'),
    ru = DChunks().Rule();
var Dissolve = require('dissolve');
var FCS = require ('./fcs');
var counter = require('./counter');

var util = require('util');
var events = require('events');
util.inherits(Parser, events.EventEmitter);


function generateRuleInd(ID){
  var chunkR, rule_of_Chunk;

  //Indication of SYS_OSAL_START_TIMER with ID: 
  if(ID == '81'){
   chunkR = [  
    ru.uint8('timerID')   ];
  }
  else if(ID == 'c0'){
   chunkR =[
    ru.int8('ZDOstate')   ];
  }
  else if(ID == '80'){
   chunkR =[
    ru.uint8('Reason'),
    ru.uint8('TransID'),
    ru.uint8('ProductID'),
    ru.uint8('MajorRel'),
    ru.uint8('MinorRel'),
    ru.uint8('H/W')   ];
  }
  else {
    //throw 'cant recognize this ID:'+ID.toString(16);
    return null;
  }
  rule_of_Chunk = DChunks().join(chunkR).compile();
  return rule_of_Chunk;
}

function generateRuleSRSP(ID){
  var chunkR, rule_of_Chunk;
  if(ID == '11'){
   chunkR = [
    ru.uint32('UTCTime'),
    ru.uint8('Hour'),
    ru.uint8('Minute'),
    ru.uint8('Second'),
    ru.uint8('Month'),
    ru.uint8('Day'),
    ru.uint16('Year')   ];
  }
  else if(ID == '10'){
   chunkR = [  
    ru.uint8('Status of SYS_SET_TIME: [Success(0) or Failure(1)] ')   ];
  }
  /*
  else if(ID == '1' || ID == '01'){
   chunkR = [  
    ru.uint16('Capability')
   ];
  }
  */
  else if(ID == '2' || ID == '02'){
   chunkR = [  
    ru.uint8('TransportRev'),
    ru.uint8('Product'),
    ru.uint8('MajorRel'),
    ru.uint8('MinorRel'),
    ru.uint8('MainRel')   ];
  }
  else if(ID == '5' || ID == '05'){
   chunkR = [  
    ru.uint8('Status')   ];
  }
  else if(ID == '7' || ID == '07'){
   chunkR = [  
    ru.uint8('Status')   ];
  }
  else if(ID == '8' || ID == '08'){
   chunkR = [  
    ru.uint8('Status'),
    ru.bufferPreLenUint8('Value')   ];
  }
  else if(ID == '9' || ID == '09'){
   chunkR = [  
    ru.uint8('Status')   ];
  }  
  else if(ID == 'a' || ID == '0a'){
   chunkR = [  
    ru.uint8('Status of SYS_OSAL_START_TIMER: [Success(0) or Failure(1)]')   ];
  }
  else if(ID == 'd' || ID == '0d'){
   chunkR = [  
    ru.uint16('AdcRead')   ];
  }
  else if(ID == '00' || ID == '0'){
    return null;
  }
  else if(ID == '01' || ID == '1'){
    return null;
  }
  else {
    //throw 'cant recognize this ID:'+ID.toString(16);
    return null;
  }

  rule_of_Chunk = DChunks().join(chunkR).compile();
  return rule_of_Chunk;
}

function callRuleInd(obj, ID){
    var rule = generateRuleInd(ID);
    if(rule === null) 
    {
        parser.emit('notRecogMessage',obj);   
        return;
    }
    else
    {    
        rule.once('parsed', function (result) {
            parser.emit('messageIND',result);  
        });
        rule.write(obj.bufferChunk);
    }
}

function callRuleSRSP(obj, ID){
    var rule = generateRuleSRSP(ID);
    var tag;
    //there are two cases that rule is null
      //1)the ID is not verified
      //2)the ID is known, but SRSP is null, so no need for parser/rule
    if(rule === null) 
    {
        //null SRSP by ZBstartReq
        if(ID == "0"){
            tag = counter.getParseCount();
            parser.emit(tag+'message_SRSP', {data:"ZBstartReqSRSP"});             
        }
        //null SRSP by ZBbindDevSRSP
        else if(ID == "1"){
            tag = counter.getParseCount();
            parser.emit(tag+'message_SRSP', {data:"ZBbindDevSRSP"});
        }
        else {
            parser.emit('notRecogMessage',obj);
        }     
        return;
    }
    else{    
        rule.on('parsed', function (result) {
            tag = counter.getParseCount();
            parser.emit(tag+'messageSRSP',result);  
        });
        rule.write(obj.bufferChunk);
    }
}

//juge if the received message is SRSP or Indication
function callRule(obj){
    var ID = obj.Cmd1.toString(16);//the ID/key is retrived from Cmd1
    var rule;

     //if the message is indication, ID = 0x010x xxxx//
     //if the message is not indication, ID = 0x011x xxxx or 0x001x xxxx//
     if( ((obj.Cmd0)>>5) === 0x02 )
     {
       callRuleInd(obj, ID);
     }
     else{        
        callRuleSRSP(obj, ID);
     }
}

var parser = new Parser();

function Parser(){
  this.parser = Dissolve().loop(function(end){
                 this.uint8('SOF').tap(function(){
                  if(this.vars.SOF == 0xFE)
                  {
                   this.uint8('len').uint8('Cmd0').uint8('Cmd1').tap(function(){
                     var length = this.vars.len;
                     this.buffer('bufferChunk', length);
                   }).uint8('FCS').tap(function(){
                      this.push(this.vars);
                      this.vars = {};
                   });
                  }   
                 });
               });
  var that = this;
  this.parser.on('readable', function () {
    var e;
    while(e = that.parser.read())
    {
       callRule(e);     
    }
  });
}

module.exports = parser;
