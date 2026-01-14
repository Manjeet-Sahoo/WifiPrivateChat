# WifiPrivateChat
This is a simple real-time chat application built using Node.js and Socket.IO.

 📌 Project Overview
This is a simple **real-time chat application** built using **Node.js** and **Socket.IO**.  
It allows multiple users to connect through a web browser and exchange messages instantly.

The application works on a **local network**, meaning users connected to the same Wi-Fi can chat with each other using the host machine’s IP address.

This project is mainly created for **learning purposes**, to understand:
- Real-time communication
- WebSockets using Socket.IO
- Basic client–server interaction


 🛠 Technologies Used
- Node.js  
- Express.js  
- Socket.IO  
- HTML, CSS, JavaScript  


 📂 Project Structure
MyChatApp
│
├── server
│ └── server.js # Main backend server file
│
├── public
│ ├── index.html # Frontend UI
│ ├── style.css # Styling
│ └── script.js # Client-side logic
│
├── package.json
├── package-lock.json
└── .gitignore
▶ How to Run the Project

 1️⃣ Install Node.js
Make sure **Node.js v20 (LTS)** is installed.

Check using:
node -v
npm -v

3️⃣ Install Dependencies
Open terminal inside the project folder and run:
npm install


 4️⃣ Start the Server
node server/server.js

You should see:
Server running at http://localhost:1041


 5️⃣ Open in Browser
On the same computer:
http://localhost:1041


On another device (same Wi-Fi):
http://<your-ip-address>:1041


Example:
http://192.1xx.x.x:1041
