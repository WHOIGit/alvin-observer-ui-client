import React, { useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSocketListener } from "../../hooks/useSocket";
import { NEW_CAMERA_COMMAND_EVENT } from "../../config";
import {
  changeCurrentCamData,
  setAllCameras,
  setRouterOutputs,
  setRouterInputs,
  changeCameraSettings,
  selectObserverSide,
} from "../camera-controls/cameraControlsSlice";
import { getObserverInfo } from "../../utils/observerSide";

export default function NewCameraCommandListener({ namespaceOverride = null }) {
  const dispatch = useDispatch();
  const observerSide = useSelector(selectObserverSide);
  const namespaceInfo = useMemo(
    () => getObserverInfo(namespaceOverride || observerSide),
    [namespaceOverride, observerSide]
  );

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

  useSocketListener(
    namespaceInfo.namespacePath,
    NEW_CAMERA_COMMAND_EVENT,
    handleMessage
  );

  return null;
}
