import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import socketIOClient from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import {
  setLastCommand,
  changeCameraSettings,
  changeCurrentCamData,
  changeCamHeartbeat,
  changeCamHeartbeatPort,
  changeCamHeartbeatStbd,
  selectObserverSide,
  selectActiveCamera,
  selectWebSocketNamespace,
  addCommandQueue,
} from "../features/camera-controls/cameraControlsSlice";
import {
  WS_SERVER,
  WS_PATH,
  NEW_CAMERA_COMMAND_EVENT,
  CAM_HEARTBEAT,
  RECORDER_HEARTBEAT,
  WS_SERVER_NAMESPACE_PORT,
  WS_SERVER_NAMESPACE_STARBOARD,
} from "../config";

const useCameraWebSocket = (
  socketEvent,
  useNamespace = true,
  nameSpaceOverride = null, // set socket connection to different nameSpace than the current Pilot/Observer
  isEnabled = true
) => {
  const observerSide = useSelector(selectObserverSide);
  const activeCamera = useSelector(selectActiveCamera);
  const socketNamespace = useSelector(selectWebSocketNamespace);
  const [messages, setMessages] = useState(null);
  const socketRef = useRef();
  const dispatch = useDispatch();

  // check if the current namespace needs to be changed to a different one
  let activeSocketNamespace;
  if (nameSpaceOverride) {
    activeSocketNamespace = nameSpaceOverride;
  } else {
    activeSocketNamespace = socketNamespace;
  }

  // need to set the web socket namespace depending on the event channel we need
  let socketNs = "/";
  if (useNamespace) {
    if (
      socketEvent === NEW_CAMERA_COMMAND_EVENT ||
      socketEvent === CAM_HEARTBEAT ||
      socketEvent === RECORDER_HEARTBEAT
    ) {
      socketNs = socketNs + activeSocketNamespace;
    }
  }

  let observerSideCmd;
  if (observerSide === "P") {
    observerSideCmd = "COVP";
  }
  if (observerSide === "S") {
    observerSideCmd = "COVS";
  }
  if (observerSide === "PL") {
    observerSideCmd = "COPL";
  }

  useEffect(() => {
    if (!isEnabled) {
      return null;
    }
    // Creates a WebSocket connection
    socketRef.current = socketIOClient(WS_SERVER + socketNs, {
      path: WS_PATH + "socket.io",
      query: { client: activeSocketNamespace },
      transports: ["websocket"],
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
        //console.log(socketEvent, incomingMessage);
        setMessages(incomingMessage);
      }

      // handle NEW_CAMERA_COMMAND_EVENT events here
      if (socketEvent === NEW_CAMERA_COMMAND_EVENT) {
        //console.log("Incoming message");
        //console.log(socketEvent, incomingMessage);
        // check if message is a Camera Change Package, else it's a Command Receipt
        if (incomingMessage.hasOwnProperty("current_settings")) {
          console.log("CAM CHANGE HERE");
          console.log(socketEvent, incomingMessage);
          dispatch(changeCurrentCamData(incomingMessage));
        } else {
          dispatch(changeCameraSettings(incomingMessage));
        }
      }

      // handle CAM_HEARTBEAT events here
      if (socketEvent === CAM_HEARTBEAT && nameSpaceOverride) {
        // set Observer specific heartbeats here for Pilot UI
        if (nameSpaceOverride === WS_SERVER_NAMESPACE_PORT) {
          dispatch(changeCamHeartbeatPort(incomingMessage));
        } else if (nameSpaceOverride === WS_SERVER_NAMESPACE_STARBOARD) {
          dispatch(changeCamHeartbeatStbd(incomingMessage));
        }
      } else if (socketEvent === CAM_HEARTBEAT) {
        //console.log("INCOMING HEARTBEAT", incomingMessage);
        dispatch(changeCamHeartbeat(incomingMessage));
      }
    });

    // Destroys the socket reference
    // when the connection is closed
    return () => {
      // Emit our custom event
      socketRef.current.on("disconnect", () => {
        socketRef.current.emit("disconnectEvent", {
          client: activeSocketNamespace,
        });
      });
      socketRef.current.disconnect();
    };
  }, [
    socketEvent,
    dispatch,
    socketNs,
    activeSocketNamespace,
    nameSpaceOverride,
    isEnabled,
  ]);

  // Sends a message to the server
  const sendMessage = (messageBody) => {
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
        ...messageBody,
      };

      try {
        //console.log("Dispatched payload", payload);
        socketRef.current.emit(NEW_CAMERA_COMMAND_EVENT, payload);
        dispatch(setLastCommand(payload));
        dispatch(addCommandQueue(payload));
      } catch (err) {
        console.log(err);
      }
    }
  };

  return { messages, sendMessage };
};

export default useCameraWebSocket;
