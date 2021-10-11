import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import socketIOClient from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import {
  setLastCommand,
  changeCameraSettings,
  changeCurrentCamData,
  changeCamHeartbeat,
  selectObserverSide,
  selectActiveCamera,
  selectWebSocketNamespace,
} from "../features/camera-controls/cameraControlsSlice";
import {
  WS_SERVER,
  WS_PATH,
  NEW_CAMERA_COMMAND_EVENT,
  CAM_HEARTBEAT,
  RECORDER_HEARTBEAT,
  COMMAND_PREFIX,
} from "../config";

const useCameraWebSocket = (socketEvent, useNamespace = true) => {
  const observerSideCmd = COMMAND_PREFIX + useSelector(selectObserverSide);
  const socketNamespace = useSelector(selectWebSocketNamespace);
  const activeCamera = useSelector(selectActiveCamera);
  const [messages, setMessages] = useState(null);
  const socketRef = useRef();
  const dispatch = useDispatch();
  // need to set the web socket namespace depending on the event channel we need
  let socketNs = "/";

  if (useNamespace) {
    if (
      socketEvent === NEW_CAMERA_COMMAND_EVENT ||
      socketEvent === CAM_HEARTBEAT ||
      socketEvent === RECORDER_HEARTBEAT
    ) {
      socketNs = socketNs + socketNamespace;
      //socketNs = "/port";
    }
  }

  useEffect(() => {
    // Creates a WebSocket connection
    socketRef.current = socketIOClient(WS_SERVER + socketNs, {
      path: WS_PATH + "socket.io",
      query: { client: socketNamespace },
    });
    console.log(socketRef);

    socketRef.current.on("connect", (incomingMessage) => {
      console.log("ON CONNECT", incomingMessage);
    });

    // Listens for incoming messages
    socketRef.current.on(socketEvent, (incomingMessage) => {
      /*
      const incomingMessage = {
        ...message,
        ownedByCurrentUser: message.senderId === socketRef.current.id
      };
      */
      if (socketEvent !== CAM_HEARTBEAT) {
        setMessages(incomingMessage);
      }
      if (socketEvent === NEW_CAMERA_COMMAND_EVENT) {
        console.log(socketEvent, incomingMessage);
        // check if message is a Camera Change Package, else it's a Command Receipt
        if (incomingMessage.hasOwnProperty("current_settings")) {
          console.log("CAM CHANGE HERE");
          dispatch(changeCurrentCamData(incomingMessage));
        } else {
          dispatch(changeCameraSettings(incomingMessage));
        }
      }

      if (socketEvent === CAM_HEARTBEAT) {
        dispatch(changeCamHeartbeat(incomingMessage));
      }
    });

    // Destroys the socket reference
    // when the connection is closed
    return () => {
      // Here we emit our custom event
      socketRef.current.on("disconnect", () => {
        socketRef.current.emit("disconnectEvent", {
          client: socketNamespace,
        });
        console.log("Socket disconnected: ");
      });
      socketRef.current.disconnect();
    };
  }, [socketEvent, dispatch, socketNs, socketNamespace]);

  // Sends a message to the server
  const sendMessage = (messageBody) => {
    console.log(messageBody.action);
    if (socketRef.current !== undefined) {
      // check if this a "Record Source" action, change "camera" prop to be current Recorder camera
      let camera = activeCamera;
      if (messageBody.hasOwnProperty("oldCamera")) {
        camera = messageBody.oldCamera;
      }

      const payload = {
        eventId: uuidv4(),
        command: observerSideCmd,
        camera: camera,
        action: messageBody.action,
      };
      console.log(payload);
      try {
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
