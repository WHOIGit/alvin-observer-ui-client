import { useEffect, useRef, useState } from "react";
import socketIOClient from "socket.io-client";
import { v4 as uuidv4 } from "uuid";

const NEW_CAMERA_COMMAND_EVENT = "newCameraCommand"; // Name of the event
const SOCKET_SERVER_URL = "http://localhost:4040";

const useCameraWebSocket = socketEvent => {
  console.log(socketEvent);
  const [messages, setMessages] = useState([]); // Sent and received messages
  const socketRef = useRef();

  useEffect(() => {
    // Creates a WebSocket connection
    socketRef.current = socketIOClient(SOCKET_SERVER_URL);
    console.log(socketRef);

    // Listens for incoming messages
    socketRef.current.on(socketEvent, incomingMessage => {
      /*
      const incomingMessage = {
        ...message,
        ownedByCurrentUser: message.senderId === socketRef.current.id
      };
      */
      console.log(incomingMessage);
      setMessages(messages => [...messages, incomingMessage]);
    });

    // Destroys the socket reference
    // when the connection is closed
    return () => {
      socketRef.current.disconnect();
    };
  }, [socketEvent]);

  // Sends a message to the server that
  // forwards it to all users in the same room
  const sendMessage = messageBody => {
    console.log(messageBody);
    if (socketRef.current !== undefined) {
      const payload = {
        eventId: uuidv4(),
        command: messageBody.command,
        camera: messageBody.camera,
        action: messageBody.action
      };
      socketRef.current.emit(NEW_CAMERA_COMMAND_EVENT, payload);
    }
  };

  return { messages, sendMessage };
};

export default useCameraWebSocket;
