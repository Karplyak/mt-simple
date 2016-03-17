////////////////////////////////////////////////////////
// Use the mt-simple API library                      //
// and socketIO to build and server, router to update //
// tempature.                                         //
// Please log to http://localhost:8001/table.html     //
// or http://localhost:8001/socket.html               //
// on the browser, like chrome.                       //
//////////////////////////////////////////////////////// 

'use strict';
var http = require("http");
var url = require('url');
var fs = require('fs');
var io = require('socket.io'); 
var tempature = require('./adcUpdate'); 

var server = http.createServer(function(request, response) {
  console.log('Connection');
  var path = url.parse(request.url).pathname;

  switch (path) {
    case '/':
      response.writeHead(200, {'Content-Type': 'text/html'});
      response.write('Hello, World.');
      response.write('Please Log to http://localhost:8001/table.html');
      response.end();
      break;
    case '/socket.html':
      fs.readFile("./socket.html", function(error, data) {
        if (error){
          response.writeHead(404);
          response.write("opps this doesn't exist - 404");
        } else {
          response.writeHead(200, {"Content-Type": "text/html"});
          response.write(data, "utf8");
        }
        response.end();
      });
      break;
    case '/table.html':
      fs.readFile("./table.html", function(error, data) {
        if (error){
          response.writeHead(404);
          response.write("opps this doesn't exist - 404");
        } else {
          response.writeHead(200, {"Content-Type": "text/html"});
          response.write(data, "utf8");
        }
        response.end();
      });
      break;
    case '/CC2530.jpg':
      fs.readFile("./CC2530.jpg", function(error, data) {
        if (error){
          response.writeHead(404);
          response.write("opps this doesn't exist - 404");
        } else {
          response.writeHead(200, {"Content-Type": "text/html"});
          response.write(data, "utf8");
        }
        response.end();
      });
      break;
    case '/logo.png':
      fs.readFile("./logo.png", function(error, data) {
        if (error){
          response.writeHead(404);
          response.write("opps this doesn't exist - 404");
        } else {
          response.writeHead(200, {"Content-Type": "text/html"});
          response.write(data, "utf8");
        }
        response.end();
      });
      break;

    default:
      response.writeHead(404);
      response.write("opps this doesn't exist - 404");
      response.end();
      break;
  }
});

server.listen(8001);

var serv_io = io.listen(server);
var ID = 0;// ID is used to verify which node//
serv_io.sockets.on('connection', function(socket) {
   
  setInterval(function() {
    socket.emit('date', {'nodeID': ID, 'date': new Date(), 'tem' : tempature.getTempValue(), 'light': tempature.getLightValue()});
  }, 100);
});
