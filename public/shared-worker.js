// This is the Shared Worker.

// This should match the version of the server, better serving the js from the server
importScripts('https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.7.2/socket.io.js');

const socket = io();
const broadcastChannel = new BroadcastChannel("shared-worker-channel");

const portMap = {};

socket.on('message', (message) => {
  console.log(message);
  //const message = event.data;
  console.log('Message received from WebSocket');
  broadcastChannel.postMessage(message);
});

// Worker connection

// Event handler called when a connection to this worker is attempted.
self.addEventListener('connect', function (event) {
  const port = event.ports[0];
  console.log('Port : ' + port);

  // Add an event listener to receive messages from the main page.
  port.addEventListener('message', function (event) {
    log_message = 'Message received in Shared Worker';
    console.log(log_message + ':', JSON.stringify(event.data));

    portMap[event.data.client_id] = port;
    console.log("portMap : " + JSON.stringify(portMap));

    socket.emit("message",JSON.stringify(event.data));
    port.postMessage(log_message);
  });

  // Notify that the connection is established.
  port.start();
});
