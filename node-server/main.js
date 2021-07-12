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

  // Listen for new messages
  socket.on(NEW_CAMERA_COMMAND_EVENT, data => {
    console.log(data);
    // Do something with the data object here
    // Then emit a response with eventID, success/error status
    const responsePayload = {
      eventId: data.eventId,
      receipt: "COVP_OK"
    };
    socket.emit(NEW_CAMERA_COMMAND_EVENT, responsePayload);
  });

  socket.on("disconnect", reason => {
    console.log("disconnected (" + reason + ")");
  });
});

server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
