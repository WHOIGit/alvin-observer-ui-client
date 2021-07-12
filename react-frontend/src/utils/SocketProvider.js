import React, { useRef, useEffect, useContext } from "react";
import socketIOClient from "socket.io-client";

const NEW_CAMERA_COMMAND_EVENT = "newCameraCommand"; // Name of the event
const SOCKET_SERVER_URL = "http://localhost:4040";

export const SocketContext = React.createContext({ socket: null });

const SocketProvider = ({ children }) => {
  // we use a ref to store the socket as it won't be updated frequently
  const socket = useRef(socketIOClient(SOCKET_SERVER_URL));

  // When the Provider mounts, initialize it 👆
  // and register a few listeners 👇

  useEffect(() => {
    console.log(socket.current);
    socket.current.on("connect", () => {
      console.log("SocketIO: Connected and authenticated");
    });

    socket.current.on("error", (msg: string) => {
      console.error("SocketIO: Error", msg);
    });

    // Remove all the listeners and
    // close the socket when it unmounts
    return () => {
      if (socket && socket.current) {
        socket.current.removeAllListeners();
        socket.current.close();
      }
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket: socket.current }}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;

// Custom hook for components to use
export const useSocketEmit = (eventName, eventHandler) => {
  // Get the socket instance
  const { socket } = useContext(SocketContext);

  // when the component, *which uses this hook* mounts,
  // add a listener.
  useEffect(() => {
    console.log("SocketIO: adding emitter", eventName);
    socket.on(eventName, eventHandler);
    // Sends a message to the server that
    // forwards it to all users in the same room
    const sendMessage = messageBody => {
      socketRef.current.emit(NEW_CAMERA_COMMAND_EVENT, {
        body: messageBody,
        senderId: socketRef.current.id
      });
    };

    // Remove when it unmounts
    return () => {
      console.log("SocketIO: removing listener", eventName);
      socket?.off(eventName, eventHandler);
    };

    // Sometimes the handler function gets redefined
    // when the component using this hook updates (or rerenders)
    // So adding a dependency makes sure the handler is
    // up to date!
  }, [eventHandler]);
};

export const useSocketListen = (eventName, eventHandler) => {
  // Get the socket instance
  const { socket } = useContext(SocketContext);

  // when the component, *which uses this hook* mounts,
  // add a listener.
  useEffect(() => {
    console.log("SocketIO: adding listener", eventName);
    socket.on(eventName, eventHandler);

    // Remove when it unmounts
    return () => {
      console.log("SocketIO: removing listener", eventName);
      socket?.off(eventName, eventHandler);
    };

    // Sometimes the handler function gets redefined
    // when the component using this hook updates (or rerenders)
    // So adding a dependency makes sure the handler is
    // up to date!
  }, [eventHandler]);
};
