// public/main.js

// Connect to the Socket.IO server running on the same origin
const socket = io();

// Select important HTML elements by their IDs
const chatForm = document.getElementById("chatForm");     // The chat input form
const messageInput = document.getElementById("messageInput"); // The text input field where the user types messages
const chatBox = document.getElementById("chatBox");       // The chat message display area

// Add an event listener that triggers when the form is submitted (when user sends a message)
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();  // Prevents the form from refreshing the page (default behavior)

  const msg = messageInput.value.trim();  // Get and trim (remove spaces) from user input
  if (msg === "") return;  // If input is empty, stop execution (don’t send blank messages)

  // Display the sender’s own message immediately in chat
  addMessage("You", msg);

  // Send the message to the server using Socket.IO event named "chatMessage"
  socket.emit("chatMessage", msg);

  // Clear the input box after sending
  messageInput.value = "";
});

// Listen for incoming messages from the server
// When another user sends a message, the server broadcasts it to all connected users
socket.on("chatMessage", (msg) => {
  // Display received message with sender name "Chatmate"
  addMessage("Chatmate", msg);
});

// Function to display messages inside the chat box
function addMessage(sender, message) {
  const div = document.createElement("div");  // Create a new <div> element for the message
  div.classList.add("msg");                   // Add CSS class "msg" for styling
  div.innerHTML = `<strong>${sender}:</strong> ${message}`; // Format message with sender name in bold
  chatBox.appendChild(div);                   // Add the message <div> to the chat area
  chatBox.scrollTop = chatBox.scrollHeight;   // Auto-scroll chat to the latest message
}

// Add functionality for emoji buttons (if you have emojis in HTML with class 'emoji')
document.querySelectorAll('.emoji').forEach(e => {
  // For each emoji element found
  e.addEventListener('click', () => {
    const input = document.getElementById('messageInput'); // Get the message input field
    input.value += e.textContent;  // Append the clicked emoji character to the input box
    input.focus();  // Set focus back to the input field so user can continue typing
  });
});


// node server/server.js