import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import socketIOClient from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import {
  setLastCommand,
  changeCameraSettings,
  changeCamHeartbeat,
  selectObserverSide,
  selectWebSocketNamespace
} from "../features/camera-controls/cameraControlsSlice";
import {
  WS_SERVER,
  NEW_CAMERA_COMMAND_EVENT,
  CAM_HEARTBEAT,
  NAV_HEARTBEAT,
  COMMAND_PREFIX
} from "../config";

const useCameraWebSocket = socketEvent => {
  const observerSideCmd = COMMAND_PREFIX + useSelector(selectObserverSide);
  const socketNamespace = useSelector(selectWebSocketNamespace);
  const [messages, setMessages] = useState(null); // Sent and received messages
  const socketRef = useRef();
  const dispatch = useDispatch();
  // need to set the web socket namespace depending on the event channel we need
  let socketNs = "/";
  if (
    socketEvent === NEW_CAMERA_COMMAND_EVENT ||
    socketEvent === CAM_HEARTBEAT
  ) {
    socketNs = socketNamespace;
  }

  useEffect(() => {
    // Creates a WebSocket connection
    //socketRef.current = socketIOClient(WS_SERVER);
    socketRef.current = socketIOClient(WS_SERVER + socketNs);
    console.log(socketRef);

    // Listens for incoming messages
    socketRef.current.on(socketEvent, incomingMessage => {
      /*
      const incomingMessage = {
        ...message,
        ownedByCurrentUser: message.senderId === socketRef.current.id
      };
      */
      //console.log(socketEvent, incomingMessage);

      setMessages(incomingMessage);
      if (socketEvent === NEW_CAMERA_COMMAND_EVENT) {
        dispatch(changeCameraSettings(incomingMessage));
      }

      if (socketEvent === CAM_HEARTBEAT) {
        dispatch(changeCamHeartbeat(incomingMessage));
      }
    });

    // Destroys the socket reference
    // when the connection is closed
    return () => {
      socketRef.current.disconnect();
    };
  }, [socketEvent, dispatch, socketNamespace]);

  // Sends a message to the server that
  // forwards it to all users in the same room
  const sendMessage = messageBody => {
    console.log(messageBody);
    if (socketRef.current !== undefined) {
      const payload = {
        eventId: uuidv4(),
        command: observerSideCmd,
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
