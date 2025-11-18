import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import TopControlPanel from "./TopControlPanel";
import useCameraWebSocket from "../../hooks/useCameraWebSocket";
import {
  selectInitialCamHeartbeatData,
  selectActiveCamera,
  changeActiveCamera,
} from "../camera-controls/cameraControlsSlice";
import {
  CAM_HEARTBEAT,
  RECORDER_HEARTBEAT,
  NEW_CAMERA_COMMAND_EVENT,
  COMMAND_STRINGS,
} from "../../config";
import CamHeartbeatListener from "../listeners/CamHeartbeatListener";
import NewCameraCommandListener from "../listeners/NewCameraCommandListener";
import RecorderHeartbeatListener from "../listeners/RecorderHeartbeatListener";

export default function ObserverUI({
  showFullCameraControls,
  setShowFullCameraControls,
}) {
  const dispatch = useDispatch();

  // connect to observer side newCameraCommand to get global camera data on first connect,
  // send message to set active camera
  const { sendMessage } = useCameraWebSocket(NEW_CAMERA_COMMAND_EVENT);

  const activeCamera = useSelector(selectActiveCamera);
  const initialCamHeartbeat = useSelector(selectInitialCamHeartbeatData);

  // use CAM_HEARTBEAT parameters only on initial app load to set activeCamera
  // keep camera params in local state otherwise
  useEffect(() => {
    const setInitialCamera = () => {
      dispatch(changeActiveCamera(initialCamHeartbeat));

      // send camera change command to set available settings options
      const payload = {
        camera: initialCamHeartbeat.camera,
        action: {
          name: COMMAND_STRINGS.cameraChangeCommand,
          value: initialCamHeartbeat.camera,
        },
      };
      sendMessage(payload);
    };

    // set initial camera state only if activeCamera is undefined
    if (activeCamera === null) {
      if (initialCamHeartbeat !== null) {
        setInitialCamera();
      }
    }
  }, [activeCamera, dispatch, initialCamHeartbeat]);

  return (
    <>
      <CamHeartbeatListener />
      <NewCameraCommandListener />
      <RecorderHeartbeatListener />

      <TopControlPanel
        showFullCameraControls={showFullCameraControls}
        setShowFullCameraControls={setShowFullCameraControls}
      />
    </>
  );
}
