// Minimal socket handlers implementing:
// - createRoom (host creates a new room id)
// - joinRoom (join existing room)
// - message relay within room
// - when host disconnects, notify other and close room

// Import required modules
const { Server } = require('socket.io');    // Import Socket.IO server class
const { randomBytes } = require('crypto');  // Used to generate random room IDs

// Function to generate a short, readable room ID
function makeRoomId() {
  // randomBytes(3) creates 3 random bytes = 6 hex characters (e.g., 'a3f1bc')
  return randomBytes(3).toString('hex');
}

// Main setup function that attaches socket handlers to an existing HTTP server
function setupSocketHandlers(httpServer) {
  // Create a new Socket.IO server instance, allowing connections from any origin
  const io = new Server(httpServer, {
    cors: {
      origin: "*" // Allow all origins (useful during development)
    }
  });

  // Map to store active rooms
  // Key: roomId → Value: { hostId, members: Set(socketId) }
  const rooms = new Map();

  // Handle new client connections
  io.on('connection', (socket) => {
    console.log('socket connected', socket.id);

    // ==========================================================
    // 1️⃣  HOST CREATES A ROOM
    // ==========================================================
    socket.on('createRoom', (payload, cb) => {
      const roomId = makeRoomId();  // Generate unique room ID
      // Store room info: host and members set
      rooms.set(roomId, { hostId: socket.id, members: new Set([socket.id]) });
      socket.join(roomId); // Add the host’s socket to the room
      console.log(`room ${roomId} created by ${socket.id}`);

      // Send back confirmation to the host via callback
      if (typeof cb === 'function') cb({ ok: true, roomId });
    });

    // ==========================================================
    // 2️⃣  CLIENT JOINS EXISTING ROOM
    // ==========================================================
    socket.on('joinRoom', (roomId, cb) => {
      const info = rooms.get(roomId); // Get room details
      if (!info) {
        // If room doesn’t exist, inform the client
        if (typeof cb === 'function') cb({ ok: false, reason: 'Room not found' });
        return;
      }

      // Allow max 2 users per room (host + 1)
      if (info.members.size >= 2) {
        if (typeof cb === 'function') cb({ ok: false, reason: 'Room full' });
        return;
      }

      // Add the joining client to the room
      info.members.add(socket.id);
      socket.join(roomId);
      console.log(`${socket.id} joined room ${roomId}`);

      // Notify the host that another user has joined
      socket.to(roomId).emit('peerJoined');

      // Send success response to joining client
      if (typeof cb === 'function') cb({ ok: true });
    });

    // ==========================================================
    // 3️⃣  MESSAGE RELAY INSIDE ROOM
    // ==========================================================
    // Handle chat messages sent by any client
    socket.on('message', (msg) => {
      if (!msg || !msg.roomId) return; // Ignore malformed messages

      // Broadcast the message to everyone in the room (including sender)
      io.to(msg.roomId).emit('message', {
        text: msg.text,     // Actual message text
        from: msg.from,     // Sender name or ID
        ts: Date.now()      // Timestamp
      });
    });

    // ==========================================================
    // 4️⃣  OPTIONAL: TYPING INDICATOR
    // ==========================================================
    socket.on('typing', (roomId) => {
      // Notify other users in the room that someone is typing
      socket.to(roomId).emit('typing');
    });

    // ==========================================================
    // 5️⃣  HANDLE DISCONNECTIONS
    // ==========================================================
    socket.on('disconnect', () => {
      console.log('socket disconnected', socket.id);

      // Iterate through all rooms to find where this socket belonged
      for (const [roomId, info] of rooms.entries()) {
        if (info.members.has(socket.id)) {
          // Remove user from the room’s member list
          info.members.delete(socket.id);

          // CASE 1: Host disconnected
          if (info.hostId === socket.id) {
            // Notify others that the room is closed
            socket.to(roomId).emit('roomClosed');
            // Delete room completely
            rooms.delete(roomId);
            console.log(`host ${socket.id} left; room ${roomId} closed`);
          } 
          // CASE 2: Non-host disconnected
          else {
            // Notify remaining members that a peer left
            socket.to(roomId).emit('peerLeft');

            // If room becomes empty, delete it
            if (info.members.size === 0) {
              rooms.delete(roomId);
            } else {
              rooms.set(roomId, info);
            }

            console.log(`${socket.id} left room ${roomId}`);
          }
        }
      }
    });
  });

  // Return the Socket.IO instance (optional, for use elsewhere)
  return io;
}

// Export the setup function for use in your main server file
module.exports = { setupSocketHandlers };