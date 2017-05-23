var express = require('express'); 
var app = express(); 
var server = require('http').createServer(app); 
var io = require('socket.io').listen(server); 
var fs = require('fs'); 
var port = 90; 

server.listen(port); 

var socket = io.listen(server); 

//use static files in ROOT/public folder
app.use(express.static(__dirname + '/public')); 

// Pipe stream index.html 

app.get("/", function(req, res){ 
   res.writeHead(200,{"Context-Type":"text/html"});
	fs.createReadStream("index.html").pipe(res);
});

var sdtp = require('./controller/senddatamysql');

socket.on('connection', function(socket) {
   
   sdtp(socket);
   
});



