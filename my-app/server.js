let waitingUser = null;

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// serve frontend
app.use(express.static("public"));

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  if (waitingUser) {
    // Match found
    const room = `room-${waitingUser.id}-${socket.id}`;

    socket.join(room);
    waitingUser.join(room);

    // Notify both players
    socket.emit("matched", { room, role: "user" });
    waitingUser.emit("matched", { room, role: "ai" });

    console.log("Matched:", waitingUser.id, socket.id);

    waitingUser = null;
  } else {
    // No one waiting → store this user
    waitingUser = socket;
    socket.emit("waiting");
  }

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    if (waitingUser === socket) {
      waitingUser = null;
    }
  });

socket.on("prompt", ({ room, message }) => {
  socket.to(room).emit("prompt", message);
});

});

