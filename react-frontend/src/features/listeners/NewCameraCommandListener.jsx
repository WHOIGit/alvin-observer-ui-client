import React, { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSocketListener } from "../../hooks/useSocket";
import { NEW_CAMERA_COMMAND_EVENT } from "../../config";
import {
  changeCurrentCamData,
  setAllCameras,
  setRouterOutputs,
  setRouterInputs,
  changeCameraSettings,
  selectWebSocketNamespace,
} from "../camera-controls/cameraControlsSlice";

export default function NewCameraCommandListener({ namespaceOverride = null }) {
  const dispatch = useDispatch();
  const userNamespace = useSelector(selectWebSocketNamespace);
  const namespace = namespaceOverride || userNamespace;

  const handleMessage = useCallback(
    (message) => {
      if ("current_settings" in message) {
        dispatch(changeCurrentCamData(message));
      } else if ("camera_array" in message) {
        dispatch(setAllCameras(message.camera_array));
      } else if ("router_output_array" in message) {
        dispatch(setRouterOutputs(message.router_output_array));
      } else if ("router_input_array" in message) {
        dispatch(setRouterInputs(message.router_input_array));
      } else {
        dispatch(changeCameraSettings(message));
      }
    },
    [dispatch]
  );

  useSocketListener(`/${namespace}`, NEW_CAMERA_COMMAND_EVENT, handleMessage);

  return null;
}
