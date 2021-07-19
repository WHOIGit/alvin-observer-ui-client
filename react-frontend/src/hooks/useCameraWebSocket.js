import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import socketIOClient from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import {
  setLastCommand,
  changeCameraSettings
} from "../features/camera-controls/cameraControlsSlice";

const NEW_CAMERA_COMMAND_EVENT = "newCameraCommand"; // Name of the event
const SOCKET_SERVER_URL = "http://localhost:4040";

const useCameraWebSocket = socketEvent => {
  console.log(socketEvent);
  const [messages, setMessages] = useState([]); // Sent and received messages
  const socketRef = useRef();
  const dispatch = useDispatch();

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
      dispatch(changeCameraSettings(incomingMessage));
    });

    // Destroys the socket reference
    // when the connection is closed
    return () => {
      socketRef.current.disconnect();
    };
  }, [socketEvent, dispatch]);

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
      try {
        console.log(payload);
        socketRef.current.emit(NEW_CAMERA_COMMAND_EVENT, payload);
        dispatch(setLastCommand(payload));
      } catch {
        console.log("Error sending socket message");
      }
    }
  };

  return { messages, sendMessage };
};

export default useCameraWebSocket;
