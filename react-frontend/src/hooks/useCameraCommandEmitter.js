import { useDispatch } from "react-redux";
import formatISO from "date-fns/formatISO";
import { v4 as uuidv4 } from "uuid";
import { useSocket } from "./useSocket";
import { NEW_CAMERA_COMMAND_EVENT } from "../config";
import {
  setLastCommand,
  addCommandQueue,
} from "../features/camera-controls/cameraControlsSlice";
import {
  observerSideToCommand,
  observerSideToNamespacePath,
} from "../utils/observerSide";

export function useCameraCommandEmitter({
  observerSide,
  activeCamera,
} = {}) {
  const namespace = observerSideToNamespacePath(observerSide);
  const socket = useSocket(namespace);
  const dispatch = useDispatch();

  return {
    emit: (messageBody = {}) => {
      let camera = activeCamera ?? null;
      if ("oldCamera" in messageBody) {
        camera = messageBody.oldCamera;
      }

      // Determine command from override or options
      const cmd = observerSideToCommand(
        messageBody.observerSideOverride ?? observerSide
      );

      const payload = {
        eventId: uuidv4(),
        timestamp: formatISO(new Date()),
        camera: camera,
        command: cmd,
        ...messageBody,
      };

      if (cmd === undefined) {
        delete payload.command;
      }

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
