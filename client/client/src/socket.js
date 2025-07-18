// src/socket.js
import { io } from "socket.io-client";

// adjust the URL to match your backend
const socket = io("http://localhost:5000", {
  transports: ['websocket'],
  withCredentials: true,
});

export default socket;
