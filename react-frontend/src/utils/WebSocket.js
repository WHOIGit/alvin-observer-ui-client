import React, { createContext } from "react";
import io from "socket.io-client";
import { WS_BASE } from "../config";
//import { useDispatch } from "react-redux";
//import { updateChatLog } from "./actions";

const WebSocketContext = createContext(null);

export { WebSocketContext };

export default ({ children }) => {
  let socket;
  let ws;

  //const dispatch = useDispatch();

  const sendMessage = (camera, message) => {
    const payload = {
      camera: camera,
      data: message
    };
    socket.emit("event://send-message", JSON.stringify(payload));
    console.log(payload);
    //dispatch(updateChatLog(payload));
  };

  if (!socket) {
    socket = io.connect(WS_BASE);
    socket.on("connect", () => {
      console.log("Connected to server");
    });
    socket.on("event://get-message", msg => {
      const payload = JSON.parse(msg);
      console.log(payload);
      //dispatch(updateChatLog(payload));
    });
    socket.on("update", data => {
      // data is already deserialized
      console.log(data.time);
      //window.timestamp.innerText = data.time;
    });

    ws = {
      socket: socket,
      sendMessage
    };
  }

  return (
    <WebSocketContext.Provider value={ws}>{children}</WebSocketContext.Provider>
  );
};
