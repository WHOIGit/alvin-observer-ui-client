const server = require("http").createServer();
const io = require("socket.io")(server, {
  cors: {
    origin: "*"
  }
});

const PORT = 4040;
const NEW_CAMERA_COMMAND_EVENT = "newCameraCommand";

io.on("connection", socket => {
  console.log(socket.handshake.query);

  // Join a conversation
  const { roomId } = socket.handshake.query;
  socket.join(roomId);

  // Listen for new messages
  socket.on(NEW_CAMERA_COMMAND_EVENT, data => {
    io.in(roomId).emit(NEW_CAMERA_COMMAND_EVENT, data);
  });

  // Leave the room if the user closes the socket
  socket.on("disconnect", reason => {
    socket.leave(roomId);
    console.log(type + " disconnected (" + reason + ")");
  });
});

server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
