import { useDispatch } from "react-redux";
import formatISO from "date-fns/formatISO";
import { v4 as uuidv4 } from "uuid";
import { useSocket } from "./useSocket";
import {
  NEW_CAMERA_COMMAND_EVENT,
  WS_SERVER_NAMESPACE_PORT,
  WS_SERVER_NAMESPACE_STARBOARD,
  WS_SERVER_NAMESPACE_PILOT,
} from "../config";
import {
  setLastCommand,
  addCommandQueue,
} from "../features/camera-controls/cameraControlsSlice";

export function useCameraCommandEmitter(
  namespace = "/",
  { activeCamera, observerSide } = {}
) {
  const socket = useSocket(namespace);
  const dispatch = useDispatch();

  const sideToCmd = (side) => {
    if (side === "P" || side === WS_SERVER_NAMESPACE_PORT) return "COVP";
    if (side === "S" || side === WS_SERVER_NAMESPACE_STARBOARD) return "COVS";
    if (side === "PL" || side === WS_SERVER_NAMESPACE_PILOT) return "COPL";
    return undefined;
  };

  return {
    emit: (messageBody = {}) => {
      let camera = activeCamera ?? null;
      if ("oldCamera" in messageBody) {
        camera = messageBody.oldCamera;
      }

      // Determine command from override or options
      const cmd = sideToCmd(messageBody.observerSideOverride ?? observerSide);

      const payload = {
        eventId: uuidv4(),
        timestamp: formatISO(new Date()),
        camera: camera,
        command: cmd,
        ...messageBody,
      };

      // Persist command to Redux.
      //
      // We do this before emitting so that there's no race condition with
      // receiving an ack from the backend.
      //
      // FIXME: setLastCommand() mutates its parameter. We provide a copy here.
      // This should be fixed along with other opportunities for refactoring.
      const payloadForState = {
        ...payload,
        action: payload.action ? { ...payload.action } : payload.action,
      };
      dispatch(setLastCommand(payloadForState));
      dispatch(addCommandQueue(payloadForState));

      // TODO: We could return a promise that resolves on ack from server
      socket.emit(NEW_CAMERA_COMMAND_EVENT, payload);
    },
  };
}

export default useCameraCommandEmitter;
