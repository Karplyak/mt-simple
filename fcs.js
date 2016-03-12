'use strict';
var Concentrate = require('concentrate');

function FCS_generate(pMsg, len, start){
  var result=0x00, i=start;// no XOR with SOF
  while(len--){

   result ^= pMsg[i];
   i = i+1;
  }
  return result;
}

exports.append= function(MTBuf){
  var buffer_wo_FCS = MTBuf;
  
  //The reason for "length-1" and "start=1" is that SOF is not counted for FCS
  var buffer_FCS = Concentrate().uint8(FCS_generate(buffer_wo_FCS, buffer_wo_FCS.length-1, 1)).result();
  var buffers = [buffer_wo_FCS, buffer_FCS];
  var newbuffer = Buffer.concat(buffers);
  return newbuffer;
};

exports.check= function(FCS, obj){
  var calculated_FCS;
  //no need for e.SOF
  var buffer_Cmd = Concentrate().uint8(obj.len).uint8(obj.Cmd0).uint8(obj.Cmd1).result();
  var buffer = Buffer.concat([buffer_Cmd, obj.bufferChunk]); 

  calculated_FCS = FCS_generate(buffer, buffer.length, 0); 
   
  if(FCS == calculated_FCS)
    return true;
  else
    return false;
};

