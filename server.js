//functions or objects/variables assigned to it
const express = require("express");
//bi-directional communication b/w client and server
const socket = require("socket.io");
//to create http server using require to access http module 
const http = require("http");
//creates an express application
const app = express();
//port number
const PORT = 3000 || process.env.PORT;
//creating server
const server = http.createServer(app);

// Set static folder
app.use(express.static("public"));

//declare var io which is a reference to a socket connection made on the server (Socket setup)
const io = socket(server);

// Players array
let users = [];
//then use the io.on method which looks for a connection
//upon a connection execute a callback function which will console.log something
io.on("connection", (socket) => {
  console.log("Made socket connection", socket.id);

  socket.on("join", (data) => {
    users.push(data);
    io.sockets.emit("join", data);
  });
//send this event to everyone in the joined
  socket.on("joined", () => {
    socket.emit("joined", users);
  });
//send this event to everyone in the rollDice
  socket.on("rollDice", (data) => {
    users[data.id].pos = data.pos;
    const turn = data.num != 6 ? (data.id + 1) % users.length : data.id;
    io.sockets.emit("rollDice", data, turn);
  });

  socket.on("restart", () => {
    users = [];
    io.sockets.emit("restart");
  });
});

server.listen(PORT, () => console.log("http://localhost:3000/"));
console.log("Open gamestart.html in file explorer then click start or use below link")//displaying instructions
