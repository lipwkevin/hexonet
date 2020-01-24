const express = require('express');
const app = express();
const path = require('path');
const net = require('net');
const Query = require('./server/models/query');

var mongoose = require('mongoose'); 				// mongoose for mongodb
var database = require('./config/database'); 			// load the database config
mongoose.connect(database.localUrl); 	// Connect to local MongoDB instance. A remoteUrl is also available (modulus.io)

const REMOTE_PORT = 43;
const REMOTE_ADDR = "whois.verisign-grs.com";
const LOCAL_PORT = 3000;
const KEY = 3;

app.use(express.static(path.join(__dirname, 'dist/ngApp')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/ngApp/index.html'));
});

let http = require('http');
let server = http.Server(app);

let io = require('socket.io').listen(server);

function encodeRailFence(input,key){
  var array = [];
  for( var i=0;i<key;i++){ array.push([]) }
  var elem;
  for (var i=0; i < input.length; i++) {
    elem = input[i];
    array[i%key].push(elem);
  }
  return array.join().split(',');
}

io.sockets.on('connection', (socket) => {
  socket.on('new-query', (query) => {
      //create the data base entry on quert
      Query.create({
          domain: query,
      }, function (err, insertedQuery) {
          if (err)
            console.log(err);
      });
      socket.emit("get-key", KEY);
      /****/
      var serviceSocket = new net.Socket();
      serviceSocket.connect(parseInt(REMOTE_PORT), REMOTE_ADDR, function () {
          console.log('connect to server');
          query = query+"\r\n"; //attach end of line to query
          serviceSocket.write(query);
      });
      serviceSocket.on("data", function (data) {
          //redirect received data to angular
          // first convert received data to Uint8Array, then encode the array
          var array = encodeRailFence(new Uint8Array(data),KEY);
          console.log('receive data from server');
          socket.emit("new-respond", array);
      });
      serviceSocket.on('close', function (err) {
        //terminate socket connect with angular when connect with server is terminated
        console.log('connection closed')
        socket.disconnect(0);
      });
      serviceSocket.on('disconnect', function (err) {
        //terminate socket connect with angular when connect with server is terminated
        console.log('connection terminated')
        socket.disconnect(0);
      });
      serviceSocket.on('error', function (err) {
        // handle error
        console.error(err);
      });
      /****/
    });
});

server.listen(LOCAL_PORT, () => {
    console.log(`started on port: ${LOCAL_PORT}`);
});
