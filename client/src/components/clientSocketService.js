/*
 React App ->  Server (Browser-to-Server)
The Client: React application running in the browser (in the Electron window).
The Server: server's webSocketServer.js file.
The Technology: Socket.IO.
webSocketServer.js file correctly uses the socket.io library to create a powerful WebSocket server.
 React App ->  Server (Browser-to-Server)
Now, for your React app to connect to this server, it must also act as a client. The crucial point is this: because your server uses the socket.io library, the client connecting to it must use the corresponding socket.io-client library.
The Server: server's webSocketServer.js file.
The ws library (from Connection #1) is designed for Node.js environments and cannot be used in a browser. The socket.io-client library is specifically designed to run in a browser and communicate with a socket.io server, handling all the necessary handshakes and protocol details that socket.io adds on top of standard WebSockets.


*/
import { io } from "socket.io-client";

const SERVER_URL = "http://localhost:3000";

/*
The socket.io-client library is designed so that the io() function itself acts as a factory. When you call io(URL, options), it handles the creation and configuration of a Socket instance and returns it to you
*/
//We will handle all methods in components

/*
The socket.io-client library is designed so that the io() function itself acts as a factory. When you call io(URL, options), it handles the creation and configuration of a Socket instance and returns it to you
*/
//We will handle all methods in components

//That file creates a single, global socket instance using io(SERVER_URL, ...) and, because autoConnect is true, it immediately starts trying to connect to your server at http://localhost:3000 in the background.
const socket = io(SERVER_URL, {
  // autoConnect is true by default, which is usually what you want.
  autoConnect: true,
  transports: ["websocket"],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});
export default socket;
//
