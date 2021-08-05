import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import socketIOClient from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import {
  setLastCommand,
  changeCameraSettings,
  selectObserverSide
} from "../features/camera-controls/cameraControlsSlice";
import { WS_SERVER, NEW_CAMERA_COMMAND_EVENT } from "../config";

const useCameraWebSocket = socketEvent => {
  const observerSide = useSelector(selectObserverSide);
  const [messages, setMessages] = useState([]); // Sent and received messages
  const socketRef = useRef();
  const dispatch = useDispatch();

  useEffect(() => {
    // Creates a WebSocket connection
    socketRef.current = socketIOClient(WS_SERVER);
    console.log(socketRef);

    // Listens for incoming messages
    socketRef.current.on(socketEvent, incomingMessage => {
      /*
      const incomingMessage = {
        ...message,
        ownedByCurrentUser: message.senderId === socketRef.current.id
      };
      */
      //console.log(incomingMessage);

      const lastMessage = messages[messages.length - 1];

      setMessages(messages => [...messages, incomingMessage]);
      if (socketEvent === NEW_CAMERA_COMMAND_EVENT) {
        dispatch(changeCameraSettings(incomingMessage));
      }
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
        command: observerSide,
        camera: messageBody.camera,
        action: messageBody.action
      };
      try {
        console.log(payload);
        socketRef.current.emit(NEW_CAMERA_COMMAND_EVENT, payload);
        dispatch(setLastCommand(payload));
      } catch (err) {
        console.log(err);
      }
    }
  };

  return { messages, sendMessage };
};

export default useCameraWebSocket;
