import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useSocketListener } from "../../hooks/useSocket";
import { NEW_CAMERA_COMMAND_EVENT } from "../../config";
import {
  changeCurrentCamData,
  setAllCameras,
  setRouterOutputs,
  setRouterInputs,
  changeCameraSettings,
} from "../camera-controls/cameraControlsSlice";

export default function NewCameraCommandListener() {
  const dispatch = useDispatch();
  const { lastMessage } = useSocketListener("/", NEW_CAMERA_COMMAND_EVENT);

  useEffect(() => {
    if (!lastMessage) return;
    if ("current_settings" in lastMessage) {
      dispatch(changeCurrentCamData(lastMessage));
    } else if ("camera_array" in lastMessage) {
      dispatch(setAllCameras(lastMessage.camera_array));
    } else if ("router_output_array" in lastMessage) {
      dispatch(setRouterOutputs(lastMessage.router_output_array));
    } else if ("router_input_array" in lastMessage) {
      dispatch(setRouterInputs(lastMessage.router_input_array));
    } else {
      dispatch(changeCameraSettings(lastMessage));
    }
  }, [dispatch, lastMessage]);
  return null;
}
