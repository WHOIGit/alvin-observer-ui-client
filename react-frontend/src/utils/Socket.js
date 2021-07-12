import io from "socket.io-client";

let socket;

export const initiateSocket = () => {
  socket = io("http://localhost:9041/");
  console.log("Connecting socket...");
  socket.on("connect", () => {
    console.log("Connected to server");
    socket.on("update", data => {
      console.log(data);
      // data is already deserialized
      //window.timestamp.innerText = data.time;
    });
  });
  //if (socket && room) socket.emit("join", room);
};

export const disconnectSocket = () => {
  console.log("Disconnecting socket...");
  if (socket) socket.disconnect();
};

export const subscribeToChat = cb => {
  if (!socket) return true;
  socket.on("chat", msg => {
    console.log("  event received!");
    return cb(null, msg);
  });
};

export const sendMessage = (room, message) => {
  if (socket) socket.emit("chat", { message, room });
};
