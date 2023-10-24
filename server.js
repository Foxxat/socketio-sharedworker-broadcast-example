const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const { v4: uuidv4 } = require('uuid');
const randomstring = require("randomstring");

const app = express();
const server = http.createServer(app);
const publicPath = path.join(__dirname, 'public');
app.use('/public', express.static(publicPath));

const io = socketIo(server);

// map of client connections:
const clients = new Map();

io.on('connection', (socket) => {

  // Generate a UUID for the connection
  const id = uuidv4();
  const metadata = { id };

  clients.set(socket, metadata);
  console.log(`Recieved a new connection : ${metadata.id}`);

  socket.on('error', console.error);
  socket.on('close', () => {
    closeConnection(socket)
  });
  socket.on('message', (message) => {
    sendMessage(message, socket);
  });

});

function formatMessageToString(message, type = 'message') {
  return JSON.stringify({ 'type': type, 'message': message, 'timestamp': new Date() });
}

function closeConnection(socket) {
  metadata = clientGetMetadata(socket);
  // Remove the connection from your data structure when the client disconnects
  console.log(`${new Date().toISOString()} | Closing connection for client : ${metadata.id}`);
  clients.delete(socket);
}

function clientGetMetadata(socket) {
  // get the metadata for the client
  const metadata = clients.get(socket);
  console.log(`Client : ${metadata.id}`);
  return metadata;
}

function sendMessage(message, socket) {
  metadata = clientGetMetadata(socket);
  console.log(`Received message : ${message.toString()}`);
  console.log(socket.id);
  // broadcast the message
  console.log(`Broadcasting the message`);
  socket.broadcast.emit("message", formatMessageToString(message.toString()));
  console.log(`Sending response to message`);
  // respond to sending client
  io.to(socket.id).emit('message',formatMessageToString('Message was received by server', 'status'))
}

// Send random JSON message to clients every 10 seconds
setInterval(() => {
  console.log(`Broadcasting random timed message to clients`)
  io.emit('message',formatMessageToString('Random Message - ' + randomstring.generate()));
}, 1000);


server.listen(3000, () => {
  console.log('Server is running on port 3000');
});
