// server/server.js

// Import required modules
const express = require("express");   // Web framework for handling HTTP requests
const http = require("http");         // Built-in Node.js HTTP module (used to create the server)
const { Server } = require("socket.io"); // Import Socket.IO class for real-time communication
const path = require("path");         // Node.js module to handle file and directory paths

// Initialize an Express application
const app = express();

// Create an HTTP server and attach the Express app to it
const server = http.createServer(app);

// Attach Socket.IO to the HTTP server so it can handle WebSocket connections
const io = new Server(server);

// Define the port number for the server to run on
const PORT = 1041;

// ===================================================================
// SERVE FRONTEND FILES
// ===================================================================
// Serve all static files (HTML, CSS, JS) from the "public" directory
// The path "../public" is relative to this file (server/server.js)
app.use(express.static(path.join(__dirname, "../public")));

// ===================================================================
// SOCKET.IO — REALTIME COMMUNICATION HANDLERS
// ===================================================================
io.on("connection", (socket) => {
  // Fires when a new user connects to the server
  console.log("🟢 A user connected:", socket.id);

  // ---------------------------------------------------------------
  // When a user sends a message from the frontend
  // The client triggers this with: socket.emit("chatMessage", msg)
  // ---------------------------------------------------------------
  socket.on("chatMessage", (msg) => {
    // Broadcast this message to *all other* connected clients
    // (the sender will not receive this broadcast)
    socket.broadcast.emit("chatMessage", msg);
  });

  // ---------------------------------------------------------------
  // When a user disconnects (closes tab, loses connection, etc.)
  // ---------------------------------------------------------------
  socket.on("disconnect", () => {
    console.log("🔴 A user disconnected:", socket.id);
  });
});

// ===================================================================
// START THE SERVER
// ===================================================================
server.listen(PORT, () => {
  // Log message showing server is running and where to access it
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});